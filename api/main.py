"""API HTTP de agente_map.

Endpoints:
    POST   /propuestas                 → encola una nueva sesión, devuelve session_id
    GET    /propuestas                 → lista las últimas N
    GET    /propuestas/{session_id}    → estado + datos
    GET    /propuestas/{session_id}/word   → descarga .docx generado on-demand
    GET    /propuestas/{session_id}/excel  → descarga .xlsx generado on-demand
    GET    /healthz                    → liveness

Auth: header X-API-Key debe coincidir con env var AGENTE_MAP_API_KEY.
Todos los endpoints excepto /healthz lo exigen.

Trabajos largos: el pipeline corre en BackgroundTasks. El estado se persiste en
sessions.status (pending → running → approved/failed) — consúltalo polleando
GET /propuestas/{id}.
"""
from __future__ import annotations

import io
import os
import tempfile
import uuid
from pathlib import Path
from typing import Optional

from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

import config
from core.pipeline import run_pipeline
from db import queries
from models.doc_types import list_doc_types
from models.schemas import (
    DocumentBrief, FinancialPackage, ProjectSession,
)


app = FastAPI(
    title="agente_map API",
    description="Pipeline multiagente de propuestas de financiamiento no reembolsable.",
    version="0.1.0",
)


# ── Auth ──────────────────────────────────────────────────────────────────
API_KEY_ENV = "AGENTE_MAP_API_KEY"


def _require_api_key(x_api_key: Optional[str]):
    expected = os.getenv(API_KEY_ENV, "")
    if not expected:
        raise HTTPException(500, f"{API_KEY_ENV} no configurada en el servidor")
    if not x_api_key or x_api_key != expected:
        raise HTTPException(401, "API key inválida o ausente (header X-API-Key)")


# ── Schemas ───────────────────────────────────────────────────────────────
class CreateProposalRequest(BaseModel):
    user_input: str = Field(..., min_length=10, description="Idea, tema o propuesta a procesar.")
    mode: str = Field("text", pattern="^(search|text|file|url)$")
    doc_type_key: Optional[str] = Field("auto", description="'auto' o una clave de DOC_TYPES.")
    template_text: str = ""
    support_docs: list[tuple[str, str]] = Field(default_factory=list)


class CreateProposalResponse(BaseModel):
    session_id: str
    status: str


class SessionSummary(BaseModel):
    session_id: str
    status: str
    approved: bool
    current_cycle: int
    doc_type_key: str
    input_mode: Optional[str] = None
    user_input: Optional[str] = None
    title: Optional[str] = None
    funder: Optional[str] = None
    funder_url: Optional[str] = None
    deadline: Optional[str] = None
    overall_score: Optional[float] = None
    viability_score: Optional[float] = None
    winning_probability: Optional[float] = None
    go_no_go: Optional[str] = None
    evidence_sources: list = []
    feasibility_breakdown: dict = {}
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────
def _project_session_from_db(row: dict) -> ProjectSession:
    """Reconstruye un ProjectSession completo desde el JSONB en Supabase
    para poder regenerar Word/Excel sin tener disco persistente."""
    from dataclasses import fields
    from models.schemas import (
        AnalysisResult, EcuadorAlignment, FunderInfo, ReviewResult,
    )

    def _rebuild_dc(cls, d: dict | None):
        if d is None:
            return None
        valid = {f.name for f in fields(cls)}
        kwargs = {k: v for k, v in d.items() if k in valid}
        return cls(**kwargs)

    analysis = None
    if row.get("analysis"):
        a = dict(row["analysis"])
        if a.get("funder"):
            a["funder"] = FunderInfo(**a["funder"])
        if a.get("ecuador_alignment"):
            a["ecuador_alignment"] = EcuadorAlignment(**a["ecuador_alignment"])
        analysis = _rebuild_dc(AnalysisResult, a)

    brief = _rebuild_dc(DocumentBrief, row.get("brief"))
    financial = _rebuild_dc(FinancialPackage, row.get("financial"))

    session = ProjectSession(
        session_id=row["session_id"],
        user_input=row["user_input"],
        input_mode=row["input_mode"],
        doc_type_key=row["doc_type_key"],
        analysis=analysis,
        brief=brief,
        financial=financial,
        approved=row.get("approved", False),
        current_cycle=row.get("current_cycle", 0),
    )
    session.proposal_versions = [v["content"] for v in row.get("proposal_versions", [])]
    session.review_results = [
        _rebuild_dc(ReviewResult, r) for r in row.get("reviews", [])
    ]
    if session.proposal_versions:
        session.final_proposal = session.proposal_versions[-1]
    return session


def _row_to_summary(row: dict) -> SessionSummary:
    brief = row.get("brief") or {}
    analysis = row.get("analysis") or {}
    funder_dict = analysis.get("funder") or {}
    last_review = (row.get("reviews") or [])[-1] if row.get("reviews") else None
    score = float(last_review["overall_score"]) if last_review else None
    return SessionSummary(
        session_id=row["session_id"],
        status=row.get("status", "pending"),
        approved=row.get("approved", False),
        current_cycle=row.get("current_cycle", 0),
        doc_type_key=row["doc_type_key"],
        input_mode=row.get("input_mode"),
        user_input=row.get("user_input"),
        title=brief.get("title") or analysis.get("project_title"),
        funder=funder_dict.get("name"),
        funder_url=funder_dict.get("url"),
        deadline=funder_dict.get("deadline"),
        overall_score=score,
        viability_score=analysis.get("viability_score"),
        winning_probability=analysis.get("winning_probability"),
        go_no_go=analysis.get("go_no_go"),
        evidence_sources=analysis.get("evidence_sources") or [],
        feasibility_breakdown=analysis.get("feasibility_breakdown") or {},
        created_at=str(row.get("created_at")) if row.get("created_at") else None,
        completed_at=str(row.get("completed_at")) if row.get("completed_at") else None,
        error_message=row.get("error_message"),
    )


# ── Endpoints ─────────────────────────────────────────────────────────────
STATIC_DIR = Path(__file__).parent / "static"


@app.get("/", include_in_schema=False)
def root():
    """UI de una sola página. La página pide el X-API-Key y lo guarda en
    localStorage; los demás endpoints siguen exigiéndolo en el header."""
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "agente_map", "version": app.version}


@app.get("/doc_types")
def doc_types(x_api_key: Optional[str] = Header(None)):
    _require_api_key(x_api_key)
    return [{"key": d.key, "name": d.name, "description": d.description}
            for d in list_doc_types()]


@app.post("/propuestas", response_model=CreateProposalResponse, status_code=202)
def create_proposal(
    req: CreateProposalRequest,
    background: BackgroundTasks,
    x_api_key: Optional[str] = Header(None),
):
    _require_api_key(x_api_key)
    if not config.ANTHROPIC_API_KEY:
        raise HTTPException(500, "ANTHROPIC_API_KEY no configurada en el servidor")

    session_id = uuid.uuid4().hex[:8]

    def _run():
        try:
            run_pipeline(
                user_input=req.user_input,
                mode=req.mode,
                doc_type_key=(req.doc_type_key or "auto"),
                template_text=req.template_text,
                support_docs=req.support_docs,
                session_id=session_id,
            )
        except Exception:
            # _mark_failed dentro del pipeline ya registró el error.
            # Capturamos para que no escale al runner de tareas.
            pass

    background.add_task(_run)
    return CreateProposalResponse(session_id=session_id, status="pending")


@app.get("/propuestas", response_model=list[SessionSummary])
def list_proposals(
    limit: int = Query(20, ge=1, le=100),
    approved_only: bool = False,
    x_api_key: Optional[str] = Header(None),
):
    _require_api_key(x_api_key)
    rows = queries.list_sessions(limit=limit, approved_only=approved_only)
    return [_row_to_summary(r) for r in rows]


@app.get("/propuestas/{session_id}", response_model=SessionSummary)
def get_proposal(session_id: str, x_api_key: Optional[str] = Header(None)):
    _require_api_key(x_api_key)
    row = queries.get_session(session_id)
    if not row:
        raise HTTPException(404, "session_id no encontrado")
    return _row_to_summary(row)


@app.get("/propuestas/{session_id}/markdown")
def get_proposal_markdown(session_id: str, x_api_key: Optional[str] = Header(None)):
    _require_api_key(x_api_key)
    row = queries.get_session(session_id)
    if not row:
        raise HTTPException(404, "session_id no encontrado")
    versions = row.get("proposal_versions") or []
    if not versions:
        raise HTTPException(409, "La propuesta aún no tiene borradores; revisa el status.")
    return StreamingResponse(
        io.BytesIO(versions[-1]["content"].encode("utf-8")),
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="propuesta_{session_id}.md"'},
    )


def _build_and_stream(session_id: str, kind: str):
    from tools import document_builder

    row = queries.get_session(session_id)
    if not row:
        raise HTTPException(404, "session_id no encontrado")
    if not (row.get("proposal_versions") or []):
        raise HTTPException(409, "La propuesta aún no tiene contenido.")

    sess = _project_session_from_db(row)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        if kind == "word":
            excel_name = f"CALCULOS_{session_id}.xlsx"
            out = tmp_path / f"PROPUESTA_{session_id}.docx"
            built = document_builder.build_word(
                sess.final_proposal, sess.brief, sess.financial,
                excel_name, out,
            )
            mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ext = "docx"
        elif kind == "excel":
            if not (sess.financial and sess.financial.budget_items):
                raise HTTPException(409, "Esta propuesta no tiene presupuesto estructurado.")
            out = tmp_path / f"CALCULOS_{session_id}.xlsx"
            built = document_builder.build_excel(sess.brief, sess.financial, out)
            mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ext = "xlsx"
        else:
            raise HTTPException(400, f"kind inválido: {kind}")

        if not built or not out.exists():
            raise HTTPException(500, f"No se pudo generar el {kind} (revisa logs del servidor).")

        data = out.read_bytes()

    return StreamingResponse(
        io.BytesIO(data),
        media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="propuesta_{session_id}.{ext}"'},
    )


@app.post("/propuestas/{session_id}/retry", response_model=CreateProposalResponse, status_code=202)
def retry_proposal(
    session_id: str,
    background: BackgroundTasks,
    x_api_key: Optional[str] = Header(None),
):
    """Relanza el pipeline para una sesión existente, reutilizando user_input
    y configuración. Borra borradores/revisiones previas vía cascade-delete
    en repository.save_session() (que reemplaza por session_id)."""
    _require_api_key(x_api_key)
    row = queries.get_session(session_id)
    if not row:
        raise HTTPException(404, "session_id no encontrado")

    if not config.ANTHROPIC_API_KEY:
        raise HTTPException(500, "ANTHROPIC_API_KEY no configurada en el servidor")

    user_input = row["user_input"]
    mode = row.get("input_mode") or "text"
    doc_type_key = row.get("doc_type_key") or "auto"
    template_text = row.get("template_text") or ""
    support_docs = [
        (d.get("name"), d.get("text")) for d in (row.get("support_docs") or [])
    ]

    def _run():
        try:
            from core.pipeline import run_pipeline
            run_pipeline(
                user_input=user_input, mode=mode, doc_type_key=doc_type_key,
                template_text=template_text, support_docs=support_docs,
                session_id=session_id,   # reutiliza id → upsert sobre el mismo row
            )
        except Exception:
            pass

    background.add_task(_run)
    return CreateProposalResponse(session_id=session_id, status="pending")


@app.get("/propuestas/{session_id}/word")
def get_proposal_word(session_id: str, x_api_key: Optional[str] = Header(None)):
    _require_api_key(x_api_key)
    return _build_and_stream(session_id, "word")


@app.get("/propuestas/{session_id}/excel")
def get_proposal_excel(session_id: str, x_api_key: Optional[str] = Header(None)):
    _require_api_key(x_api_key)
    return _build_and_stream(session_id, "excel")
