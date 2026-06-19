"""Estado y saldo de los proveedores de IA.

Solo DeepSeek expone un endpoint público de saldo (/user/balance). Para Anthropic,
Mistral y Codestral no hay API pública de saldo: se reporta si la clave está
configurada y se remite a la consola del proveedor.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request

import config


def _get(url: str, key: str, timeout: int = 12) -> dict:
    req = urllib.request.Request(url)
    req.add_header("Authorization", "Bearer " + key)
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def provider_status() -> list[dict]:
    """Devuelve el estado de cada proveedor: configurado, saldo (si lo expone) y nota."""
    out: list[dict] = []

    # ── Claude (Anthropic) — sin endpoint público de saldo ──
    out.append({
        "provider": "Claude (Anthropic)", "model": config.MODEL,
        "configured": bool(config.ANTHROPIC_API_KEY), "balance": None, "unit": None,
        "note": "Saldo no expuesto por API. Revisa la consola de Anthropic.",
    })

    # ── DeepSeek — expone /user/balance ──
    ds = {"provider": "DeepSeek", "model": config.DEEPSEEK_MODEL,
          "configured": bool(config.DEEPSEEK_API_KEY), "balance": None, "unit": None, "note": ""}
    if config.DEEPSEEK_API_KEY:
        try:
            base = config.DEEPSEEK_BASE_URL.split("/v1")[0].rstrip("/")
            d = _get(base + "/user/balance", config.DEEPSEEK_API_KEY)
            infos = d.get("balance_infos") or []
            if infos:
                ds["balance"] = infos[0].get("total_balance")
                ds["unit"] = infos[0].get("currency")
            ds["note"] = "disponible" if d.get("is_available") else "saldo agotado"
        except urllib.error.HTTPError as e:
            ds["note"] = f"HTTP {e.code}"
        except Exception as e:  # noqa: BLE001
            ds["note"] = f"error: {type(e).__name__}"
    else:
        ds["note"] = "sin API key"
    out.append(ds)

    # ── Mistral / Codestral — sin endpoint público de saldo ──
    for name, key, model in (("Mistral", config.MISTRAL_API_KEY, config.MISTRAL_MODEL),
                             ("Codestral", config.CODESTRAL_API_KEY, config.CODESTRAL_MODEL)):
        out.append({
            "provider": name, "model": model, "configured": bool(key),
            "balance": None, "unit": None,
            "note": ("Saldo no expuesto por API. Revisa la consola del proveedor."
                     if key else "sin API key"),
        })
    return out
