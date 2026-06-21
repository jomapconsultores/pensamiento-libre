"""Exportación de oficios/peticiones a PDF."""
from __future__ import annotations

import tempfile
from pathlib import Path


def oficio_to_pdf(row: dict) -> bytes:
    """Genera un PDF a partir del contenido de un oficio y devuelve bytes."""
    from tools.document_builder import build_pdf
    content = row.get("content") or ""
    subject = row.get("subject") or "Oficio"
    entity = row.get("entity") or ""

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "oficio.pdf"
        build_pdf(content, subject, out, subtitle=entity)
        return out.read_bytes()
