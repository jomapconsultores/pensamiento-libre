"""Persistencia de ProjectSession en Supabase.

Mapping:
    sessions          ← ProjectSession (analysis, brief, financial como jsonb)
    proposal_versions ← ProjectSession.proposal_versions[*]
    reviews           ← ProjectSession.review_results[*]

Usa la clave service_role (salta RLS). No-op silencioso si SUPABASE_URL no está
configurada. Lanza SupabaseSaveError si la conexión existe pero algo falla.
"""
from __future__ import annotations

from dataclasses import asdict, is_dataclass
from typing import Any

import config
from models.schemas import ProjectSession
from utils.supabase_client import get_client


class SupabaseSaveError(RuntimeError):
    pass


def is_enabled() -> bool:
    return bool(config.SUPABASE_URL and config.SUPABASE_SECRET_KEY)


def _dump(obj: Any) -> Any:
    """Serializa dataclasses (anidados) a dict/list/primitivos JSON-friendly."""
    if obj is None:
        return None
    if is_dataclass(obj):
        return asdict(obj)
    if isinstance(obj, dict):
        return {k: _dump(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_dump(v) for v in obj]
    return obj


def _session_row(s: ProjectSession) -> dict:
    return {
        "session_id":    s.session_id,
        "user_input":    s.user_input,
        "input_mode":    s.input_mode,
        "doc_type_key":  s.doc_type_key,
        "language":      (s.brief.language if s.brief else None) or "es",
        "approved":      s.approved,
        "current_cycle": s.current_cycle,
        "output_path":   s.output_path,
        "word_path":     s.word_path,
        "excel_path":    s.excel_path,
        "template_text": s.template_text or None,
        "support_docs":  [{"name": n, "text": t} for n, t in (s.support_docs or [])],
        "owner_user_id": s.owner_user_id,
        "analysis":      _dump(s.analysis),
        "brief":         _dump(s.brief),
        "financial":     _dump(s.financial),
    }


def _proposal_rows(session_uuid: str, s: ProjectSession) -> list[dict]:
    return [
        {"session_id": session_uuid, "cycle": i, "content": content}
        for i, content in enumerate(s.proposal_versions, start=1)
    ]


def _review_rows(session_uuid: str, s: ProjectSession) -> list[dict]:
    rows = []
    for r in s.review_results:
        rows.append({
            "session_id":           session_uuid,
            "cycle":                r.cycle,
            "approved":             r.approved,
            "overall_score":        float(r.overall_score),
            "criterion_scores":     _dump(r.criterion_scores),
            "format_check":         _dump(r.format_check),
            "strengths":            _dump(r.strengths),
            "corrections":          _dump(r.corrections),
            "critical_issues":      _dump(r.critical_issues),
            "compliance_checklist": _dump(r.compliance_checklist),
            "failing_elements":     _dump(r.failing_elements),
            "recommendation":       r.recommendation,
        })
    return rows


def update_progress(session_id: str, phase: str, label: str, icon: str = "⚙",
                    status: str = "running", detail: str = "") -> None:
    """Escribe el paso actual del pipeline en la BD (no bloquea si falla)."""
    if not is_enabled():
        return
    try:
        import datetime
        from utils.supabase_client import get_client
        sb = get_client(service_role=True)
        # Recuperar pasos actuales
        row = sb.table("sessions").select("progress_steps").eq(
            "session_id", session_id).limit(1).execute()
        steps: list = (row.data[0].get("progress_steps") or []) if row.data else []
        # Actualizar paso existente si ya existe la misma fase, o añadir nuevo
        ts = datetime.datetime.utcnow().isoformat() + "Z"
        new_step = {"phase": phase, "label": label, "icon": icon,
                    "status": status, "detail": detail, "ts": ts}
        idx = next((i for i, s in enumerate(steps) if s.get("phase") == phase), -1)
        if idx >= 0:
            steps[idx] = new_step
        else:
            steps.append(new_step)
        sb.table("sessions").update(
            {"current_phase": f"{icon} {label}", "progress_steps": steps}
        ).eq("session_id", session_id).execute()
    except Exception:
        pass  # el progreso no debe tumbar el pipeline


def is_pause_requested(session_id: str) -> bool:
    """True si el usuario solicitó pausa (el pipeline lo verifica antes de cada fase)."""
    if not is_enabled():
        return False
    try:
        from utils.supabase_client import get_client
        sb = get_client(service_role=True)
        row = sb.table("sessions").select("pause_requested").eq(
            "session_id", session_id).limit(1).execute()
        return bool((row.data or [{}])[0].get("pause_requested", False))
    except Exception:
        return False


def request_pause(session_id: str) -> bool:
    """Activa el flag de pausa. El pipeline lo detecta y se detiene limpiamente."""
    if not is_enabled():
        return False
    try:
        from utils.supabase_client import get_client
        sb = get_client(service_role=True)
        sb.table("sessions").update({"pause_requested": True}).eq(
            "session_id", session_id).execute()
        return True
    except Exception as e:
        raise SupabaseSaveError(f"{type(e).__name__}: {e}") from e


def cancel_session(session_id: str) -> bool:
    """Cancela un trabajo (lo marca como fallido/cancelado, conservando el registro).
    Devuelve True si existía. Idempotente si Supabase está apagado."""
    if not is_enabled():
        return False
    try:
        sb = get_client(service_role=True)
        sess = sb.table("sessions").select("id").eq("session_id", session_id).limit(1).execute()
        if not sess.data:
            return False
        sb.table("sessions").update(
            {"status": "failed", "error_message": "Cancelado por el usuario",
             "completed_at": "now()"}
        ).eq("session_id", session_id).execute()
        return True
    except Exception as e:  # noqa: BLE001
        raise SupabaseSaveError(f"{type(e).__name__}: {e}") from e


def delete_session(session_id: str) -> bool:
    """Borra una sesión y sus borradores/revisiones. Devuelve True si existía.
    Idempotente: si no existe o Supabase está apagado, devuelve False sin error."""
    if not is_enabled():
        return False
    try:
        sb = get_client(service_role=True)
        sess = (
            sb.table("sessions").select("id").eq("session_id", session_id).limit(1).execute()
        )
        if not sess.data:
            return False
        row_uuid = sess.data[0]["id"]
        sb.table("proposal_versions").delete().eq("session_id", row_uuid).execute()
        sb.table("reviews").delete().eq("session_id", row_uuid).execute()
        sb.table("sessions").delete().eq("session_id", session_id).execute()
        return True
    except Exception as e:  # noqa: BLE001
        raise SupabaseSaveError(f"{type(e).__name__}: {e}") from e


def save_session(session: ProjectSession) -> str | None:
    """Persiste la sesión completa en Supabase. Devuelve el uuid de la sesión.

    Upsert por session_id (texto corto) → si ya existe, actualiza y reemplaza
    los borradores/revisiones existentes para evitar duplicados al reintentar.
    """
    if not is_enabled():
        return None

    try:
        sb = get_client(service_role=True)

        # Upsert session
        row = _session_row(session)
        resp = (
            sb.table("sessions")
            .upsert(row, on_conflict="session_id")
            .execute()
        )
        if not resp.data:
            raise SupabaseSaveError("upsert sessions devolvió data vacía")
        session_uuid = resp.data[0]["id"]

        # Reemplazar borradores y revisiones (idempotente ante reintentos)
        sb.table("proposal_versions").delete().eq("session_id", session_uuid).execute()
        sb.table("reviews").delete().eq("session_id", session_uuid).execute()

        prop_rows = _proposal_rows(session_uuid, session)
        if prop_rows:
            sb.table("proposal_versions").insert(prop_rows).execute()

        rev_rows = _review_rows(session_uuid, session)
        if rev_rows:
            sb.table("reviews").insert(rev_rows).execute()

        return session_uuid

    except SupabaseSaveError:
        raise
    except Exception as e:
        raise SupabaseSaveError(f"{type(e).__name__}: {e}") from e
