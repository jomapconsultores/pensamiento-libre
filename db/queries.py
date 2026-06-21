"""Lectura de sesiones guardadas en Supabase.

Cierra el bucle de persistencia: el agente las inserta vía repository.py,
y desde aquí las puedes listar/recuperar para revisar o reanalizar.
"""
from __future__ import annotations

from typing import Any, Optional

from utils.supabase_client import get_client


def list_sessions(limit: int = 20, *, approved_only: bool = False,
                  owner_user_id: Optional[str] = None) -> list[dict[str, Any]]:
    """Devuelve las sesiones más recientes con campos resumidos.

    Si `owner_user_id` se pasa, filtra solo las de ese dueño (vista por usuario).
    Si es None, devuelve todas (vista admin / clave maestra)."""
    sb = get_client(service_role=True)
    q = (
        sb.table("sessions")
        .select(
            "id, session_id, doc_type_key, approved, current_cycle, "
            "status, input_mode, user_input, completed_at, error_message, "
            "created_at, owner_user_id, brief, analysis"
        )
        .order("created_at", desc=True)
        .limit(limit)
    )
    if approved_only:
        q = q.eq("approved", True)
    if owner_user_id is not None:
        q = q.eq("owner_user_id", owner_user_id)
    rows = q.execute().data or []

    # Aplana los campos más útiles del JSON anidado para facilitar el listado.
    for r in rows:
        brief    = r.pop("brief", None) or {}
        analysis = r.pop("analysis", None) or {}
        real_title = brief.get("title") or analysis.get("project_title")
        r["title"]  = real_title or _auto_title(r, bool(analysis.get("alternatives")))
        funder = analysis.get("funder") or {}
        r["funder"] = funder.get("name")
    return rows


_DOC_LABELS = {
    "propuesta":          "Propuesta",
    "articulo_cientifico":"Artículo científico",
    "tesis":              "Tesis",
    "tdr":                "TDR",
    "informe":            "Informe",
    "peer_review":        "Revisión de pares",
    "legal_tecnico":      "Doc. legal/técnico",
    "auto":               "Documento",
}


def _auto_title(row: dict, is_scouting: bool = False) -> str:
    import datetime
    created_raw = row.get("created_at")
    try:
        dt = datetime.datetime.fromisoformat(str(created_raw).replace("Z", "+00:00"))
        meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
        fecha = f"{dt.day} {meses[dt.month-1]} {dt.year}"
    except Exception:
        fecha = str(created_raw or "")[:10]

    key = (row.get("doc_type_key") or "auto").lower()
    tipo = "Búsqueda de oportunidades" if is_scouting else _DOC_LABELS.get(key, key.replace("_", " ").title())

    inp = (row.get("user_input") or "").strip().replace("\n", " ").replace("\r", "")
    if inp:
        if len(inp) > 55:
            cut = inp[:55]; sp = cut.rfind(" ")
            inp = (cut[:sp] if sp > 20 else cut) + "…"
        return f"{tipo} — {inp} ({fecha})"
    return f"{tipo} ({fecha})"


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
