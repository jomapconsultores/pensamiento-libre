"""Pipeline ejecutable programáticamente (sin input() ni prints).

Esta es la versión "headless" del flujo de main.py. La CLI sigue usando main.py
para experiencia interactiva; la API HTTP llama a `run_pipeline()` desde aquí.
"""
from __future__ import annotations

import uuid
from typing import Optional

import config
from config import MAX_REVIEW_CYCLES, ANTHROPIC_API_KEY
from models.schemas import ProjectSession
from models.doc_types import get_doc_type
import agents.analyst as analyst
import agents.classifier as classifier
import agents.writer as writer
import agents.peer as peer
import agents.reviewer as reviewer
import agents.financial as financial
from utils.output import save_session
from db import repository


def _resolve_doc_type(user_input: str, template_text: str, support_docs: list,
                      api_key: str, requested: Optional[str]) -> str:
    if requested and requested != "auto":
        return requested
    try:
        return classifier.detect_type(user_input, template_text, support_docs, api_key)
    except Exception:
        return "generico"


def _mark_running(session_id: str, owner_user_id: Optional[str] = None):
    if not repository.is_enabled():
        return
    try:
        from utils.supabase_client import get_client
        sb = get_client(service_role=True)
        row = {"session_id": session_id, "status": "running",
               "started_at": "now()", "user_input": "(initializing)",
               "input_mode": "text", "doc_type_key": "propuesta"}
        if owner_user_id:
            row["owner_user_id"] = owner_user_id
        sb.table("sessions").upsert(row, on_conflict="session_id").execute()
    except Exception:
        pass  # no bloquea el pipeline


def _mark_failed(session_id: str, error: str):
    if not repository.is_enabled():
        return
    try:
        from utils.supabase_client import get_client
        sb = get_client(service_role=True)
        sb.table("sessions").update(
            {"status": "failed", "error_message": error[:2000],
             "completed_at": "now()"}
        ).eq("session_id", session_id).execute()
    except Exception:
        pass


def _mark_completed(session_id: str, approved: bool):
    if not repository.is_enabled():
        return
    try:
        from utils.supabase_client import get_client
        sb = get_client(service_role=True)
        sb.table("sessions").update(
            {"status": "approved" if approved else "failed",
             "completed_at": "now()"}
        ).eq("session_id", session_id).execute()
    except Exception:
        pass


def run_pipeline(
    *,
    user_input: str,
    mode: str = "text",
    doc_type_key: Optional[str] = None,
    template_text: str = "",
    support_docs: Optional[list[tuple[str, str]]] = None,
    api_key: Optional[str] = None,
    session_id: Optional[str] = None,
    owner_user_id: Optional[str] = None,
) -> ProjectSession:
    """Corre el pipeline completo sin interacción. Devuelve la sesión final.

    Persiste en Supabase progresivamente (status: pending → running →
    approved/failed) y al final guarda archivos vía save_session().
    """
    api_key = api_key or ANTHROPIC_API_KEY
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY no configurada")
    if mode not in ("search", "text", "file", "url"):
        raise ValueError(f"mode inválido: {mode!r}")

    session_id = session_id or uuid.uuid4().hex[:8]
    support_docs = support_docs or []

    resolved_type = _resolve_doc_type(user_input, template_text, support_docs,
                                       api_key, doc_type_key)

    session = ProjectSession(
        session_id=session_id,
        user_input=user_input,
        input_mode=mode,
        doc_type_key=resolved_type,
        template_text=template_text,
        support_docs=support_docs,
        owner_user_id=owner_user_id,
    )

    _mark_running(session_id, owner_user_id)

    try:
        doc_type = get_doc_type(resolved_type)

        # ── FASE 1 ────────────────────────────────────────────────────────
        if doc_type.is_proposal:
            result = analyst.run(session, api_key)
            session.analysis = result
            if not result.viable:
                session.approved = False
                save_session(session)
                _mark_completed(session_id, approved=False)
                return session
            session.brief = classifier.analysis_to_brief(result, resolved_type)
        else:
            session.brief = classifier.build_brief(session, resolved_type, api_key)

        # ── FASES 2 + 3: CONSTRUCCIÓN + CONSENSO (1°,2°,3°) ↔ VEREDICTO (Claude) ──
        # 1) Un constructor redacta. 2) Los 3 constructores revisan entre sí y solo
        #    cuando coinciden en que TODO está cumplido (búsqueda + documento) pasa a
        #    Claude. 3) Claude da el veredicto final: aprueba, o devuelve para que el
        #    equipo lo mejore y se vuelva a someter.
        corrections: list = []
        approved = False
        for cycle in range(1, MAX_REVIEW_CYCLES + 1):
            session.current_cycle = cycle
            proposal = writer.run(session, corrections, api_key)

            # Consenso del equipo constructor antes de Claude (resiliente: si falla, no bloquea)
            try:
                for _ in range(config.MAX_PEER_SUBCYCLES):
                    ok, peer_corrections, _details = peer.consensus(session, proposal, api_key)
                    if ok or not peer_corrections:
                        break
                    proposal = writer.run(session, peer_corrections, api_key)
            except Exception:
                pass

            session.proposal_versions.append(proposal)
            session.final_proposal = proposal

            # Veredicto final de Claude (regla 90/90)
            review = reviewer.run(session, proposal, api_key)
            session.review_results.append(review)

            if review.approved:
                approved = True
                break
            corrections = review.corrections  # devuelve al equipo para mejorar

        session.approved = approved

        # ── FASE 4: financiero (si corresponde) ──────────────────────────
        if session.brief and session.brief.needs_budget_excel:
            try:
                session.financial = financial.run(session, session.final_proposal, api_key)
            except Exception:
                session.financial = None

        save_session(session)
        _mark_completed(session_id, approved=approved)
        return session

    except Exception as e:
        _mark_failed(session_id, f"{type(e).__name__}: {e}")
        raise
