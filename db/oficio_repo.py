"""Persistencia de oficios/peticiones en Supabase."""
from __future__ import annotations

import uuid
from typing import Any, Optional

from utils.supabase_client import get_client


def save(
    *,
    owner_user_id: str,
    entity: str,
    doc_type: str,
    subject: str,
    requester_name: str,
    requester_id: str = "",
    requester_role: str = "",
    requester_address: str = "",
    requester_phone: str = "",
    request_detail: str,
    extra_legal: str = "",
    extra_facts: str = "",
    doc_number: str = "",
    city: str = "Cuenca",
    content: str = "",
) -> str:
    """Guarda el oficio y devuelve el oficio_id (UUID)."""
    sb = get_client(service_role=True)
    oficio_id = str(uuid.uuid4())
    sb.table("oficios").insert({
        "oficio_id": oficio_id,
        "owner_user_id": owner_user_id,
        "entity": entity,
        "doc_type": doc_type,
        "subject": subject,
        "requester_name": requester_name,
        "requester_id": requester_id,
        "requester_role": requester_role,
        "requester_address": requester_address,
        "requester_phone": requester_phone,
        "request_detail": request_detail,
        "extra_legal": extra_legal,
        "extra_facts": extra_facts,
        "doc_number": doc_number,
        "city": city,
        "content": content,
    }).execute()
    return oficio_id


def list_oficios(*, owner_user_id: Optional[str] = None, limit: int = 50) -> list[dict[str, Any]]:
    sb = get_client(service_role=True)
    q = (
        sb.table("oficios")
        .select("oficio_id, entity, doc_type, subject, requester_name, city, created_at, doc_number")
        .order("created_at", desc=True)
        .limit(limit)
    )
    if owner_user_id:
        q = q.eq("owner_user_id", owner_user_id)
    return q.execute().data or []


def get_oficio(oficio_id: str) -> Optional[dict[str, Any]]:
    sb = get_client(service_role=True)
    rows = (
        sb.table("oficios").select("*").eq("oficio_id", oficio_id).limit(1).execute().data
    )
    return rows[0] if rows else None


def delete_oficio(*, oficio_id: str, owner_user_id: str) -> bool:
    sb = get_client(service_role=True)
    res = (
        sb.table("oficios")
        .delete()
        .eq("oficio_id", oficio_id)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    return bool(res.data)
