"""Lectura de sesiones guardadas en Supabase.

Cierra el bucle de persistencia: el agente las inserta vía repository.py,
y desde aquí las puedes listar/recuperar para revisar o reanalizar.
"""
from __future__ import annotations

from typing import Any, Optional

from utils.supabase_client import get_client


def list_sessions(limit: int = 20, *, approved_only: bool = False) -> list[dict[str, Any]]:
    """Devuelve las sesiones más recientes con campos resumidos."""
    sb = get_client(service_role=True)
    q = (
        sb.table("sessions")
        .select(
            "id, session_id, doc_type_key, approved, current_cycle, "
            "created_at, brief, analysis"
        )
        .order("created_at", desc=True)
        .limit(limit)
    )
    if approved_only:
        q = q.eq("approved", True)
    rows = q.execute().data or []

    # Aplana los campos más útiles del JSON anidado para facilitar el listado.
    for r in rows:
        brief = r.pop("brief", None) or {}
        analysis = r.pop("analysis", None) or {}
        r["title"] = brief.get("title") or analysis.get("project_title")
        funder = analysis.get("funder") or {}
        r["funder"] = funder.get("name")
    return rows


def get_session(session_id: str) -> Optional[dict[str, Any]]:
    """Recupera una sesión completa (con borradores y revisiones)."""
    sb = get_client(service_role=True)
    sess = (
        sb.table("sessions").select("*").eq("session_id", session_id).limit(1).execute()
    )
    if not sess.data:
        return None
    row = sess.data[0]
    row_uuid = row["id"]

    versions = (
        sb.table("proposal_versions")
        .select("cycle, content, char_count, created_at")
        .eq("session_id", row_uuid)
        .order("cycle")
        .execute()
        .data
        or []
    )
    reviews = (
        sb.table("reviews")
        .select("*")
        .eq("session_id", row_uuid)
        .order("cycle")
        .execute()
        .data
        or []
    )
    row["proposal_versions"] = versions
    row["reviews"] = reviews
    return row
