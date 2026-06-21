"""Exportación de oficios/peticiones a Word (.docx)."""
from __future__ import annotations

import io
import tempfile
from pathlib import Path


def oficio_to_docx(row: dict) -> bytes:
    """Genera un .docx a partir del contenido de un oficio y devuelve bytes."""
    from tools.document_builder import build_word_plain
    content = row.get("content") or ""
    subject = row.get("subject") or "Oficio"

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "oficio.docx"
        build_word_plain(content, subject, out)
        return out.read_bytes()
