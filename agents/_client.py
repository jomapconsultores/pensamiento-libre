"""Cliente Anthropic compartido con políticas de retry para tier free/bajo.

Los agentes hacen llamadas grandes (8–16 k tokens) muy seguidas; en planes con
~30 k tokens/min de input es fácil chocar el rate limit. Centralizamos aquí:

- max_retries alto: el SDK ya implementa backoff exponencial y respeta
  el header Retry-After del servidor. Subimos el techo de reintentos
  para sobrevivir a varios minutos de saturación.
- timeout generoso: durante backoff la conexión puede estar abierta
  esperando, no queremos que se caiga por timeout corto.
"""
from __future__ import annotations

import anthropic

DEFAULT_MAX_RETRIES = 10
DEFAULT_TIMEOUT_SEC = 600.0  # 10 min


def make_client(api_key: str) -> anthropic.Anthropic:
    return anthropic.Anthropic(
        api_key=api_key,
        max_retries=DEFAULT_MAX_RETRIES,
        timeout=DEFAULT_TIMEOUT_SEC,
    )
