"""Pipeline por FASES con gates ≥90 revisados por IAs distintas y reinicio al inicio.

Flujo (cada fase la produce una IA y la audita OTRA; si un gate da <90 se vuelve al
inicio y se reinvestiga, hasta MAX_PIPELINE_RESTARTS intentos):

  FASE 0  Clasificación ........................ Claude
  FASE 1  Investigación web + análisis ......... ROLE_RESEARCH (DeepSeek)
          └─ GATE 1 revisado por ............... ROLE_REVIEW_RESEARCH (Mistral)
  FASE 2  Redacción del documento .............. ROLE_WRITER (Mistral)
          └─ GATE 2 revisado por ............... ROLE_REVIEW_WRITER (DeepSeek)
  FASE 3  Estructuración financiera ........... ROLE_FINANCIAL (Codestral)
  FASE 4  Veredicto final 90/90 ............... Claude (reviewer.run)

Si tras agotar los intentos no se alcanza el 90, se entrega la MEJOR versión
lograda marcada como inconclusa.

Esta es la versión "headless" que llama la API HTTP. La CLI (main.py) conserva su
flujo interactivo propio.
"""
from __future__ import annotations

import json
import uuid
from typing import Optional

import config
from config import (
    MAX_PIPELINE_RESTARTS, ANTHROPIC_API_KEY,
    ROLE_REVIEW_RESEARCH, ROLE_WRITER, ROLE_REVIEW_WRITER, ROLE_FINANCIAL,
)
from models.schemas import ProjectSession
from models.doc_types import get_doc_type
import agents.classifier as classifier
import agents.researcher as researcher
import agents.scout as scout
import agents.writer as writer
import agents.reviewer as reviewer
import agents.financial as financial
import agents.phase_review as phase_review
from agents.analyst import result_from_data
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


def _research_content(session: ProjectSession) -> str:
    """Texto compacto de la fase de investigación, para el gate cruzado."""
    a = session.analysis
    if a:
        return "\n".join([
            f"Proyecto: {a.project_title}",
            f"Financiador: {a.funder.name} ({a.funder.type}) · {a.funder.url}",
            f"Deadline: {a.funder.deadline} · Monto: {a.total_amount}",
            f"Viabilidad: {a.viability_score:.0f}/100 · Prob. ganar: {a.winning_probability:.0f}%",
            "Lineamientos nacionales: " + "; ".join(a.national_guidelines),
            "Lineamientos internacionales: " + "; ".join(a.international_guidelines),
            "Fuentes (evidencia): " + json.dumps(a.evidence_sources, ensure_ascii=False)[:4000],
            "Análisis:\n" + (a.raw_analysis or ""),
        ])
    b = session.brief
    if b:
        return "\n".join([
            f"Instrucciones: {b.instructions}",
            f"Fuentes encontradas: {b.source_notes}",
            "Lineamientos nacionales: " + "; ".join(b.national_guidelines),
            "Lineamientos internacionales: " + "; ".join(b.international_guidelines),
        ])
    return ""


def run_scouting(
    *,
    user_input: str,
    api_key: Optional[str] = None,
    session_id: Optional[str] = None,
    owner_user_id: Optional[str] = None,
) -> ProjectSession:
    """Detecta el TOP-N de oportunidades (modo búsqueda) y guarda un reporte con
    calificación ponderada. NO genera propuestas: el usuario elige después.

    Las oportunidades quedan en `session.analysis.alternatives` (índice 0 = la mejor),
    serializadas dentro del jsonb `analysis`. La oportunidad #0 también puebla los
    campos principales del AnalysisResult para la tarjeta-resumen de la UI.
    """
    api_key = api_key or ANTHROPIC_API_KEY
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY no configurada")
    session_id = session_id or uuid.uuid4().hex[:8]

    session = ProjectSession(
        session_id=session_id, user_input=user_input, input_mode="search",
        doc_type_key="propuesta", owner_user_id=owner_user_id,
    )
    _mark_running(session_id, owner_user_id)
    try:
        opportunities = scout.run(session, api_key)
        if not opportunities:
            session.approved = False
            session.inconclusive_reason = "La búsqueda no devolvió oportunidades verificables."
            save_session(session)
            _mark_completed(session_id, approved=False)
            return session

        best = opportunities[0]
        analysis = result_from_data(best, best.get("summary", ""))
        analysis.summary = best.get("summary", "")
        analysis.weighted_score = float(best.get("weighted_score", 0) or 0)
        analysis.alternatives = opportunities      # lista completa ranqueada
        session.analysis = analysis
        session.approved = True                    # scouting completado con éxito

        save_session(session)
        _mark_completed(session_id, approved=True)
        return session
    except Exception as e:
        _mark_failed(session_id, f"{type(e).__name__}: {e}")
        raise


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
    seed_opportunity: Optional[dict] = None,
) -> ProjectSession:
    """Corre el pipeline por fases con gates ≥90 y reinicio al inicio. Devuelve la sesión.

    Persiste progresivamente (pending → running → approved/failed) y al final
    guarda archivos vía save_session().
    """
    api_key = api_key or ANTHROPIC_API_KEY
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY no configurada")
    if mode not in ("search", "text", "file", "url"):
        raise ValueError(f"mode inválido: {mode!r}")

    session_id = session_id or uuid.uuid4().hex[:8]
    support_docs = support_docs or []

    # FASE 0 — Clasificación (Claude). Una sola vez para todo el pipeline.
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

        approved = False
        # Mejor versión lograda (por si ningún intento alcanza el 90).
        best = {"score": -1.0, "proposal": None, "financial": None}

        for attempt in range(1, MAX_PIPELINE_RESTARTS + 1):
            session.attempts = attempt
            session.current_cycle = attempt

            # ── FASE 1 — INVESTIGACIÓN WEB + ANÁLISIS (IA investigadora) ──────
            if doc_type.is_proposal:
                analysis = researcher.run(session, api_key, seed=seed_opportunity)
                session.analysis = analysis
                if not analysis.viable:
                    # Oportunidad no viable: no tiene sentido reintentar.
                    session.approved = False
                    session.inconclusive_reason = "Análisis de viabilidad: NO-GO."
                    save_session(session)
                    _mark_completed(session_id, approved=False)
                    return session
                session.brief = classifier.analysis_to_brief(analysis, resolved_type)
            else:
                session.brief = researcher.build_brief(session, resolved_type, api_key)

            # ── GATE 1 — la investigación la audita OTRA IA ──────────────────
            g1 = phase_review.review(
                ROLE_REVIEW_RESEARCH, phase="investigación",
                brief=session.brief, content=_research_content(session),
                focus="Verifica que la investigación esté fundamentada en fuentes reales "
                      "(con URL), sin datos inventados, y que cubra lineamientos y requisitos.",
            )
            session.phase_reviews.append({"attempt": attempt, **g1})
            if not g1["passed"]:
                continue  # VUELVE AL INICIO: reinvestiga

            # ── FASE 2 — REDACCIÓN (IA redactora) ────────────────────────────
            proposal = writer.run(session, [], api_key, provider=ROLE_WRITER)
            session.proposal_versions.append(proposal)
            session.final_proposal = proposal

            # ── GATE 2 — la redacción la audita OTRA IA ──────────────────────
            g2 = phase_review.review(
                ROLE_REVIEW_WRITER, phase="redacción",
                brief=session.brief, content=proposal,
                focus="Verifica secciones completas, cumplimiento de formato y lineamientos, "
                      "rigor y ausencia de relleno o datos inventados.",
            )
            session.phase_reviews.append({"attempt": attempt, **g2})
            if not g2["passed"]:
                continue  # VUELVE AL INICIO

            # ── FASE 3 — ESTRUCTURACIÓN FINANCIERA (IA financiera) ───────────
            if session.brief and session.brief.needs_budget_excel:
                try:
                    session.financial = financial.run(
                        session, proposal, api_key, provider=ROLE_FINANCIAL)
                except Exception:
                    session.financial = None

            # ── FASE 4 — VEREDICTO FINAL 90/90 (Claude) ──────────────────────
            review = reviewer.run(session, proposal, api_key)
            session.review_results.append(review)

            if review.overall_score > best["score"]:
                best = {"score": review.overall_score, "proposal": proposal,
                        "financial": session.financial}

            if review.approved:
                approved = True
                break
            # No aprobó el 90/90 → VUELVE AL INICIO (reinvestiga)

        session.approved = approved

        # Si ningún intento alcanzó el 90, entrega la MEJOR versión (inconclusa).
        if not approved and best["proposal"] is not None:
            session.final_proposal = best["proposal"]
            session.financial = best["financial"]
            if session.proposal_versions and session.proposal_versions[-1] != best["proposal"]:
                session.proposal_versions.append(best["proposal"])
            session.inconclusive_reason = (
                f"No se alcanzó 90/100 tras {session.attempts} intentos. "
                f"Mejor puntaje: {best['score']:.0f}/100. Se entrega la mejor versión."
            )

        save_session(session)
        _mark_completed(session_id, approved=approved)
        return session

    except Exception as e:
        _mark_failed(session_id, f"{type(e).__name__}: {e}")
        raise
