"""API HTTP de agente_map.

Auth multiusuario:
- `POST /auth/register` (auto-registro; 1er usuario = admin aprobado, resto pending)
- `POST /auth/login` → token firmado (Bearer)
- La X-API-Key maestra (AGENTE_MAP_API_KEY) entra como ADMIN bootstrap.
- Cada usuario ve SUS entregables; el admin ve todos.

Endpoints de datos: /modules, /doc_types, /extract, /propuestas[...],
/propuestas/{id}/(markdown|word|excel|retry|reviews).

Trabajos largos: el pipeline corre en BackgroundTasks; el estado se persiste en
sessions.status (pending → running → approved/failed).
"""
from __future__ import annotations

import io
import os
import tempfile
import uuid
from pathlib import Path
from typing import Optional

from fastapi import (
    BackgroundTasks, Depends, FastAPI, File, Header, HTTPException, Query, UploadFile,
)
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

import config
import api.auth as auth_lib
from core.pipeline import run_pipeline, run_scouting
from db import queries
from db import users as users_repo
from models.doc_types import list_doc_types, list_modules
from models.schemas import DocumentBrief, FinancialPackage, ProjectSession


app = FastAPI(
    title="agente_map API",
    description="Pipeline multiagente multiusuario de entregables de alto nivel.",
    version="0.3.0",
)

API_KEY_ENV = "AGENTE_MAP_API_KEY"


# ── Auth / principal ────────────────────────────────────────────────────────
class Principal:
    def __init__(self, user_id: Optional[str], role: str,
                 email: Optional[str] = None, name: Optional[str] = None,
                 master: bool = False):
        self.user_id = user_id
        self.role = role
        self.email = email
        self.name = name
        self.master = master

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    def owner_filter(self) -> Optional[str]:
        """None → ve todo (admin/maestra). Si no, restringe a su user_id."""
        return None if self.is_admin else self.user_id


def get_principal(authorization: Optional[str] = Header(None),
                  x_api_key: Optional[str] = Header(None)) -> Principal:
    master = os.getenv(API_KEY_ENV, "")
    if x_api_key and master and x_api_key == master:
        return Principal(None, "admin", name="Administrador", master=True)
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    if token:
        payload = auth_lib.parse_token(token)
        if payload:
            return Principal(payload.get("uid"), payload.get("role", "user"))
    raise HTTPException(401, "No autenticado. Inicia sesión.")


def require_admin(p: Principal) -> None:
    if not p.is_admin:
        raise HTTPException(403, "Requiere rol administrador.")


def _require_supabase() -> None:
    if not users_repo.is_enabled():
        raise HTTPException(500, "Base de datos (Supabase) no configurada en el servidor.")


def _db(fn, *args, **kwargs):
    """Ejecuta una operación de usuarios traduciendo errores de BD a un mensaje
    claro (típicamente: falta aplicar la migración 004)."""
    try:
        return fn(*args, **kwargs)
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        msg = str(e)
        if "users" in msg and ("does not exist" in msg or "schema cache" in msg or "relation" in msg):
            raise HTTPException(500, "La tabla de usuarios no existe. Aplica la migración "
                                     "db/004_auth_and_owner.sql en Supabase (SQL Editor).")
        raise HTTPException(500, f"Error de base de datos: {type(e).__name__}: {e}")


# ── Schemas ───────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=200)
    name: str = Field("", max_length=120)
    password: str = Field(..., min_length=6, max_length=200)


class LoginRequest(BaseModel):
    email: str
    password: str


class CreateProposalRequest(BaseModel):
    user_input: str = Field(..., min_length=10, description="Idea, tema o propuesta a procesar.")
    mode: str = Field("text", pattern="^(search|text|file|url)$")
    doc_type_key: Optional[str] = Field("auto", description="'auto' o una clave de DOC_TYPES.")
    template_text: str = ""
    support_docs: list[tuple[str, str]] = Field(default_factory=list)


class CreateProposalResponse(BaseModel):
    session_id: str
    status: str


class ScoutRequest(BaseModel):
    user_input: str = Field(..., min_length=5, description="Tema o sector a buscar.")


class GenerateRequest(BaseModel):
    selected: list[int] = Field(..., min_length=1,
                                description="Índices de las oportunidades elegidas (0 = la mejor).")


class GenerateResponse(BaseModel):
    sessions: list[CreateProposalResponse]


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
    weighted_score: Optional[float] = None
    is_scouting: bool = False
    opportunities_count: int = 0
    go_no_go: Optional[str] = None
    evidence_sources: list = []
    feasibility_breakdown: dict = {}
    owner_user_id: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────
def _project_session_from_db(row: dict) -> ProjectSession:
    from dataclasses import fields
    from models.schemas import AnalysisResult, EcuadorAlignment, FunderInfo, ReviewResult

    def _rebuild_dc(cls, d: dict | None):
        if d is None:
            return None
        valid = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in d.items() if k in valid})

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
    session.review_results = [_rebuild_dc(ReviewResult, r) for r in row.get("reviews", [])]
    if session.proposal_versions:
        session.final_proposal = session.proposal_versions[-1]
    return session


def _row_to_summary(row: dict) -> SessionSummary:
    brief = row.get("brief") or {}
    analysis = row.get("analysis") or {}
    funder_dict = analysis.get("funder") or {}
    last_review = (row.get("reviews") or [])[-1] if row.get("reviews") else None
    score = float(last_review["overall_score"]) if last_review else None
    alts = analysis.get("alternatives") or []
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
        weighted_score=analysis.get("weighted_score"),
        is_scouting=bool(alts),
        opportunities_count=len(alts),
        go_no_go=analysis.get("go_no_go"),
        evidence_sources=analysis.get("evidence_sources") or [],
        feasibility_breakdown=analysis.get("feasibility_breakdown") or {},
        owner_user_id=row.get("owner_user_id"),
        created_at=str(row.get("created_at")) if row.get("created_at") else None,
        completed_at=str(row.get("completed_at")) if row.get("completed_at") else None,
        error_message=row.get("error_message"),
    )


def _owned_row(session_id: str, p: Principal) -> dict:
    """Recupera la sesión y verifica que el principal pueda verla."""
    row = queries.get_session(session_id)
    if not row:
        raise HTTPException(404, "session_id no encontrado")
    if not p.is_admin and row.get("owner_user_id") != p.user_id:
        raise HTTPException(403, "No tienes acceso a este entregable.")
    return row


# ── Static / health ─────────────────────────────────────────────────────────
STATIC_DIR = Path(__file__).parent / "static"


@app.get("/", include_in_schema=False)
def root():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "agente_map", "version": app.version}


# ── Auth endpoints ───────────────────────────────────────────────────────────
@app.post("/auth/register")
def register(req: RegisterRequest):
    _require_supabase()
    email = req.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(400, "Email inválido.")
    if _db(users_repo.get_by_email, email):
        raise HTTPException(409, "Ya existe una cuenta con ese email.")
    first = _db(users_repo.count_users) == 0
    h, salt = auth_lib.hash_password(req.password)
    role = "admin" if first else "user"
    status = "approved" if first else "pending"
    _db(users_repo.create_user, email=email, name=req.name, password_hash=h,
        password_salt=salt, role=role, status=status)
    return {
        "status": status, "role": role,
        "message": ("Eres el administrador; ya puedes iniciar sesión."
                    if first else
                    "Cuenta creada. Queda pendiente de aprobación por el administrador."),
    }


@app.post("/auth/login")
def login(req: LoginRequest):
    _require_supabase()
    u = _db(users_repo.get_by_email, req.email)
    if not u or not auth_lib.verify_password(req.password, u.get("password_hash", ""),
                                             u.get("password_salt", "")):
        raise HTTPException(401, "Email o contraseña incorrectos.")
    if u.get("status") == "pending":
        raise HTTPException(403, "Tu cuenta está pendiente de aprobación por el administrador.")
    if u.get("status") != "approved":
        raise HTTPException(403, "Tu cuenta no está activa. Contacta al administrador.")
    users_repo.touch_login(u["id"])
    token = auth_lib.make_token(u["id"], u.get("role", "user"))
    return {"token": token, "user": users_repo.public_view(u)}


@app.get("/auth/me")
def me(p: Principal = Depends(get_principal)):
    if p.master:
        return {"id": None, "name": "Administrador (clave maestra)", "email": None,
                "role": "admin", "status": "approved"}
    u = _db(users_repo.get_by_id, p.user_id) if p.user_id else None
    if not u:
        raise HTTPException(401, "Sesión inválida.")
    return users_repo.public_view(u)


# ── Gestión de usuarios (solo admin) ─────────────────────────────────────────
@app.get("/users")
def list_users_ep(status: Optional[str] = Query(None), p: Principal = Depends(get_principal)):
    require_admin(p)
    _require_supabase()
    return _db(users_repo.list_users, status)


@app.post("/users/{user_id}/approve")
def approve_user(user_id: str, p: Principal = Depends(get_principal)):
    require_admin(p)
    users_repo.set_status(user_id, "approved")
    return {"ok": True, "status": "approved"}


@app.post("/users/{user_id}/reject")
def reject_user(user_id: str, p: Principal = Depends(get_principal)):
    require_admin(p)
    users_repo.set_status(user_id, "rejected")
    return {"ok": True, "status": "rejected"}


@app.post("/users/{user_id}/make-admin")
def make_admin(user_id: str, p: Principal = Depends(get_principal)):
    require_admin(p)
    users_repo.set_role(user_id, "admin")
    return {"ok": True, "role": "admin"}


# ── Catálogo ─────────────────────────────────────────────────────────────────
@app.get("/modules")
def modules(p: Principal = Depends(get_principal)):
    return list_modules()


@app.get("/doc_types")
def doc_types(p: Principal = Depends(get_principal)):
    return [{"key": d.key, "name": d.name, "description": d.description, "module": d.module}
            for d in list_doc_types()]


# ── Extracción de archivos ───────────────────────────────────────────────────
MAX_EXTRACT_FILES = 12
MAX_EXTRACT_BYTES = 20 * 1024 * 1024
MAX_EXTRACT_CHARS = 120_000


@app.post("/extract")
async def extract(files: list[UploadFile] = File(...), p: Principal = Depends(get_principal)):
    from tools import file_reader
    if len(files) > MAX_EXTRACT_FILES:
        raise HTTPException(413, f"Máximo {MAX_EXTRACT_FILES} archivos por carga.")
    out = []
    for f in files:
        data = await f.read()
        if not data:
            raise HTTPException(400, f"'{f.filename}' está vacío.")
        if len(data) > MAX_EXTRACT_BYTES:
            raise HTTPException(413, f"'{f.filename}' supera 20 MB.")
        try:
            text = file_reader.read_upload(f.filename, data)
        except (ValueError, ImportError) as e:
            raise HTTPException(415, f"'{f.filename}': {e}")
        except Exception as e:  # noqa: BLE001
            raise HTTPException(422, f"No se pudo procesar '{f.filename}': {e}")
        text = (text or "").strip()
        if not text:
            raise HTTPException(422, f"'{f.filename}' no contiene texto legible "
                                     "(¿PDF escaneado sin OCR?).")
        out.append({"name": f.filename, "text": text[:MAX_EXTRACT_CHARS],
                    "chars": len(text), "truncated": len(text) > MAX_EXTRACT_CHARS})
    return out


# ── Entregables ──────────────────────────────────────────────────────────────
@app.post("/propuestas", response_model=CreateProposalResponse, status_code=202)
def create_proposal(req: CreateProposalRequest, background: BackgroundTasks,
                    p: Principal = Depends(get_principal)):
    if not config.ANTHROPIC_API_KEY:
        raise HTTPException(500, "ANTHROPIC_API_KEY no configurada en el servidor")
    session_id = uuid.uuid4().hex[:8]
    owner = p.user_id  # None si es la clave maestra

    def _run():
        try:
            run_pipeline(
                user_input=req.user_input, mode=req.mode,
                doc_type_key=(req.doc_type_key or "auto"),
                template_text=req.template_text, support_docs=req.support_docs,
                session_id=session_id, owner_user_id=owner,
            )
        except Exception:
            pass

    background.add_task(_run)
    return CreateProposalResponse(session_id=session_id, status="pending")


# ── Scouting: buscar → reporte con calificación → elegir → generar ───────────
@app.post("/buscar", response_model=CreateProposalResponse, status_code=202)
def buscar_oportunidades(req: ScoutRequest, background: BackgroundTasks,
                         p: Principal = Depends(get_principal)):
    """Detecta el TOP-N de oportunidades y arma un reporte con calificación
    ponderada (NO genera propuestas). Luego se eligen con POST /generar."""
    if not config.ANTHROPIC_API_KEY:
        raise HTTPException(500, "ANTHROPIC_API_KEY no configurada en el servidor")
    session_id = uuid.uuid4().hex[:8]
    owner = p.user_id

    def _run():
        try:
            run_scouting(user_input=req.user_input, session_id=session_id, owner_user_id=owner)
        except Exception:
            pass

    background.add_task(_run)
    return CreateProposalResponse(session_id=session_id, status="pending")


@app.get("/propuestas/{session_id}/oportunidades")
def listar_oportunidades(session_id: str, p: Principal = Depends(get_principal)):
    """Lista las oportunidades detectadas (para mostrarlas en el programa)."""
    row = _owned_row(session_id, p)
    analysis = row.get("analysis") or {}
    opps = analysis.get("alternatives") or []
    out = []
    for i, o in enumerate(opps):
        funder = o.get("funder") or {}
        out.append({
            "index": i,
            "title": o.get("title"),
            "summary": o.get("summary"),
            "funder": funder.get("name"),
            "funder_type": funder.get("type"),
            "url": funder.get("url"),
            "deadline": funder.get("deadline"),
            "amount": o.get("total_amount") or funder.get("amount_range"),
            "sector": o.get("sector"),
            "viability_score": o.get("viability_score"),
            "winning_probability": o.get("winning_probability"),
            "weighted_score": o.get("weighted_score"),
            "feasibility_breakdown": o.get("feasibility_breakdown") or {},
        })
    return {"session_id": session_id, "count": len(out), "opportunities": out}


@app.get("/propuestas/{session_id}/reporte")
def descargar_reporte(session_id: str, ids: Optional[str] = Query(None,
                      description="Índices separados por coma (ej. '0,2'); vacío = todas."),
                      p: Principal = Depends(get_principal)):
    """Descarga el reporte de detección en Word (una, varias o todas las oportunidades)."""
    from tools import document_builder
    row = _owned_row(session_id, p)
    analysis = row.get("analysis") or {}
    opps = analysis.get("alternatives") or []
    if not opps:
        raise HTTPException(409, "Esta sesión no tiene oportunidades detectadas.")
    if ids:
        try:
            wanted = [int(x) for x in ids.split(",") if x.strip() != ""]
        except ValueError:
            raise HTTPException(400, "Parámetro 'ids' inválido (usa enteros separados por coma).")
        selected = [opps[i] for i in wanted if 0 <= i < len(opps)]
        if not selected:
            raise HTTPException(404, "Ningún índice válido en 'ids'.")
    else:
        selected = opps
    topic = row.get("user_input") or "Oportunidades"
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / f"REPORTE_{session_id}.docx"
        built = document_builder.build_scouting_report(selected, topic, out)
        if not built or not out.exists():
            raise HTTPException(500, "No se pudo generar el reporte (revisa logs).")
        data = out.read_bytes()
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="reporte_{session_id}.docx"'},
    )


@app.post("/propuestas/{session_id}/generar", response_model=GenerateResponse, status_code=202)
def generar_desde_seleccion(session_id: str, req: GenerateRequest, background: BackgroundTasks,
                            p: Principal = Depends(get_principal)):
    """Con el visto bueno del usuario: por cada oportunidad elegida lanza la
    generación de la propuesta completa (enfocada en esa entidad y sus requisitos)."""
    if not config.ANTHROPIC_API_KEY:
        raise HTTPException(500, "ANTHROPIC_API_KEY no configurada en el servidor")
    row = _owned_row(session_id, p)
    analysis = row.get("analysis") or {}
    opps = analysis.get("alternatives") or []
    if not opps:
        raise HTTPException(409, "Esta sesión no tiene oportunidades para generar.")
    owner = row.get("owner_user_id")

    created: list[CreateProposalResponse] = []
    for idx in req.selected:
        if not (0 <= idx < len(opps)):
            continue
        opp = opps[idx]
        funder = opp.get("funder") or {}
        title = opp.get("title") or funder.get("name") or row.get("user_input")
        url = funder.get("url") or ""
        user_input = f"{title} — {funder.get('name', '')}".strip(" —")
        mode = "url" if url.startswith("http") else "search"
        if mode == "url":
            user_input = f"{user_input}\n{url}"
        new_id = uuid.uuid4().hex[:8]

        def _run(new_id=new_id, user_input=user_input, mode=mode, opp=opp):
            try:
                run_pipeline(user_input=user_input, mode=mode, doc_type_key="propuesta",
                             session_id=new_id, owner_user_id=owner, seed_opportunity=opp)
            except Exception:
                pass

        background.add_task(_run)
        created.append(CreateProposalResponse(session_id=new_id, status="pending"))

    if not created:
        raise HTTPException(400, "Ningún índice válido en 'selected'.")
    return GenerateResponse(sessions=created)


@app.get("/propuestas", response_model=list[SessionSummary])
def list_proposals(limit: int = Query(20, ge=1, le=100), approved_only: bool = False,
                   p: Principal = Depends(get_principal)):
    rows = queries.list_sessions(limit=limit, approved_only=approved_only,
                                 owner_user_id=p.owner_filter())
    return [_row_to_summary(r) for r in rows]


@app.get("/propuestas/{session_id}", response_model=SessionSummary)
def get_proposal(session_id: str, p: Principal = Depends(get_principal)):
    return _row_to_summary(_owned_row(session_id, p))


@app.get("/propuestas/{session_id}/reviews")
def get_proposal_reviews(session_id: str, p: Principal = Depends(get_principal)):
    """Historial completo de verificación 90/90 (por ciclo) + versiones, para
    auditar/verificar lo producido en cualquier momento."""
    row = _owned_row(session_id, p)
    brief = row.get("brief") or {}
    return {
        "session_id": session_id,
        "approved": row.get("approved", False),
        "doc_type_key": row.get("doc_type_key"),
        "evaluation_criteria": brief.get("evaluation_criteria") or [],
        "reviews": row.get("reviews") or [],
        "versions": [{"cycle": v.get("cycle"), "char_count": v.get("char_count"),
                      "created_at": str(v.get("created_at"))}
                     for v in (row.get("proposal_versions") or [])],
    }


@app.get("/propuestas/{session_id}/markdown")
def get_proposal_markdown(session_id: str, p: Principal = Depends(get_principal)):
    row = _owned_row(session_id, p)
    versions = row.get("proposal_versions") or []
    if not versions:
        raise HTTPException(409, "El entregable aún no tiene borradores; revisa el status.")
    return StreamingResponse(
        io.BytesIO(versions[-1]["content"].encode("utf-8")),
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="entregable_{session_id}.md"'},
    )


def _build_and_stream(row: dict, kind: str):
    from tools import document_builder
    session_id = row["session_id"]
    if not (row.get("proposal_versions") or []):
        raise HTTPException(409, "El entregable aún no tiene contenido.")
    sess = _project_session_from_db(row)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        if kind == "word":
            excel_name = f"CALCULOS_{session_id}.xlsx"
            out = tmp_path / f"ENTREGABLE_{session_id}.docx"
            built = document_builder.build_word(sess.final_proposal, sess.brief,
                                                sess.financial, excel_name, out)
            mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ext = "docx"
        elif kind == "excel":
            if not (sess.financial and sess.financial.budget_items):
                raise HTTPException(409, "Este entregable no tiene presupuesto estructurado.")
            out = tmp_path / f"CALCULOS_{session_id}.xlsx"
            built = document_builder.build_excel(sess.brief, sess.financial, out)
            mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ext = "xlsx"
        else:
            raise HTTPException(400, f"kind inválido: {kind}")
        if not built or not out.exists():
            raise HTTPException(500, f"No se pudo generar el {kind} (revisa logs).")
        data = out.read_bytes()
    return StreamingResponse(
        io.BytesIO(data), media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="entregable_{session_id}.{ext}"'},
    )


@app.get("/propuestas/{session_id}/word")
def get_proposal_word(session_id: str, p: Principal = Depends(get_principal)):
    return _build_and_stream(_owned_row(session_id, p), "word")


@app.get("/propuestas/{session_id}/excel")
def get_proposal_excel(session_id: str, p: Principal = Depends(get_principal)):
    return _build_and_stream(_owned_row(session_id, p), "excel")


@app.post("/propuestas/{session_id}/retry", response_model=CreateProposalResponse, status_code=202)
def retry_proposal(session_id: str, background: BackgroundTasks,
                   p: Principal = Depends(get_principal)):
    row = _owned_row(session_id, p)
    if not config.ANTHROPIC_API_KEY:
        raise HTTPException(500, "ANTHROPIC_API_KEY no configurada en el servidor")
    user_input = row["user_input"]
    mode = row.get("input_mode") or "text"
    doc_type_key = row.get("doc_type_key") or "auto"
    template_text = row.get("template_text") or ""
    support_docs = [(d.get("name"), d.get("text")) for d in (row.get("support_docs") or [])]
    owner = row.get("owner_user_id")

    def _run():
        try:
            run_pipeline(user_input=user_input, mode=mode, doc_type_key=doc_type_key,
                         template_text=template_text, support_docs=support_docs,
                         session_id=session_id, owner_user_id=owner)
        except Exception:
            pass

    background.add_task(_run)
    return CreateProposalResponse(session_id=session_id, status="pending")


@app.delete("/propuestas/{session_id}", status_code=200)
def delete_proposal(session_id: str, p: Principal = Depends(get_principal)):
    """Borra el entregable del usuario (inconcluso o no): sesión + borradores + revisiones."""
    from db import repository
    _owned_row(session_id, p)  # verifica existencia y propiedad
    try:
        ok = repository.delete_session(session_id)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(500, f"No se pudo borrar: {type(e).__name__}: {e}")
    if not ok:
        raise HTTPException(404, "session_id no encontrado")
    return {"ok": True, "deleted": session_id}
