"""Carga y cachea los documentos de la carpeta Empresas/ como contexto organizacional.

Los documentos (contratos, estatutos, CVs, registros) se inyectan automáticamente
en los prompts del investigador y el redactor para que:
  - La propuesta se direccione a la organización real disponible.
  - Los campos de identificación (razón social, RUC, representante legal, etc.)
    se llenen con datos verídicos, no inventados.
  - Los CVs de participantes clave se usen para perfiles de equipo.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import config
from tools.file_reader import read_file

_SUPPORTED = {".pdf", ".docx", ".txt", ".md"}
_MAX_CHARS_PER_DOC = 5000


@lru_cache(maxsize=1)
def load() -> list[tuple[str, str]]:
    """Devuelve [(nombre_archivo, contenido)] de todos los docs legibles en Empresas/."""
    d = config.EMPRESAS_DIR
    if not d.exists():
        return []
    docs: list[tuple[str, str]] = []
    for f in sorted(d.iterdir()):
        if f.is_file() and f.suffix.lower() in _SUPPORTED:
            try:
                content = read_file(str(f))
                if content.strip():
                    docs.append((f.name, content[:_MAX_CHARS_PER_DOC]))
            except Exception:
                pass
    return docs


def context_block() -> str:
    """Bloque formateado con el contexto organizacional, listo para insertar en prompts."""
    docs = load()
    if not docs:
        return ""
    lines = [
        "═══════════════════════════════════════════════════════════",
        "ORGANIZACIONES E INDIVIDUOS DISPONIBLES (carpeta Empresas/)",
        "USA estos datos REALES al direccionar la propuesta, llenar",
        "campos de identificación y citar a los participantes clave.",
        "No inventes datos que ya aparecen aquí.",
        "═══════════════════════════════════════════════════════════",
    ]
    for name, content in docs:
        lines.append(f"\n--- {name} ---\n{content}")
    return "\n".join(lines)


def count() -> int:
    """Número de documentos cargados de Empresas/."""
    return len(load())
