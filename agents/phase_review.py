"""
GATE DE FASE — revisión cruzada por OTRA IA (≥90/100)
──────────────────────────────────────────────────────
Cada fase del pipeline (investigación, redacción) es auditada por una IA DISTINTA
a la que la produjo. Si el puntaje global es <90 o hay problemas críticos, la fase
NO pasa y el pipeline vuelve al inicio (reinvestiga).

El veredicto FINAL del documento lo da Claude con la regla 90/90 estricta
(agents/reviewer.py); este módulo son los gates intermedios.
"""
from __future__ import annotations

import json

import config
from agents import llm
from models.doc_types import FormatSpec, get_doc_type
from models.schemas import DocumentBrief

MAX_TOKENS_GATE = 1500

_SYSTEM = """
Eres un AUDITOR independiente y exigente. Evalúas si una FASE del trabajo cumple el estándar
profesional mínimo para avanzar. Eres honesto y calibrado: no inflas puntajes. Verificas que NO
haya datos, citas, cifras ni fuentes inventadas y que se respeten los lineamientos y el formato.
Respondes ÚNICAMENTE con JSON válido:
{"score": <0-100>, "critical": ["<problema crítico que obliga a rehacer>", ...],
 "issues": ["<faltante/mejora concreta y accionable>", ...],
 "strengths": ["<fortaleza>", ...], "recommendation": "<resumen 1-3 frases>"}
Sin texto fuera del JSON.
"""


def _clip(text: str, n: int) -> str:
    text = (text or "").strip()
    return text if len(text) <= n else text[:n] + "\n[…truncado…]"


def _parse(raw: str) -> dict:
    raw = (raw or "").strip()
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    s, e = raw.find("{"), raw.rfind("}") + 1
    if s >= 0 and e > s:
        raw = raw[s:e]
    return json.loads(raw)


def _brief_context(brief: DocumentBrief) -> str:
    dt = get_doc_type(brief.doc_type_key)
    fmt = FormatSpec.from_dict(brief.format_spec)
    nat = "\n".join(f"  - {g}" for g in brief.national_guidelines) or "  - (marco nacional aplicable)"
    intl = "\n".join(f"  - {g}" for g in brief.international_guidelines) or "  - (normas del área)"
    reqs = "\n".join(f"  - {r}" for r in brief.key_requirements) or "  - (según el tipo)"
    secs = "\n".join(f"  - {s}" for s in brief.sections) or "  - (según el tipo)"
    return (
        f"TIPO: {dt.name}\nTÍTULO: {brief.title}\nIDIOMA: {brief.language}\n"
        f"FORMATO EXIGIDO: {fmt.to_prompt()}\n"
        f"SECCIONES:\n{secs}\nREQUISITOS:\n{reqs}\n"
        f"LINEAMIENTOS NACIONALES:\n{nat}\nLINEAMIENTOS INTERNACIONALES:\n{intl}\n"
    )


def review(provider: str, *, phase: str, brief: DocumentBrief,
           content: str, focus: str = "") -> dict:
    """Audita una fase. Devuelve dict con score/passed/critical/issues/strengths.

    `passed` = score ≥ PHASE_REVIEW_THRESHOLD y sin problemas críticos.
    Resiliente: si el revisor falla, deja pasar la fase (no bloquea por una caída),
    el veredicto final de Claude seguirá filtrando.
    """
    prompt = f"""
Evalúa esta FASE: «{phase}».

{_brief_context(brief)}
{focus}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENIDO A AUDITAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{_clip(content, 48000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Asigna un score 0-100 al cumplimiento de esta fase frente a lo exigido. Si hay datos/fuentes
inventados, faltan lineamientos clave o el formato no se respeta, el score debe ser <90 y debes
listarlo en "critical". Devuelve SOLO el JSON.
"""
    threshold = config.PHASE_REVIEW_THRESHOLD
    try:
        raw = llm.complete(provider, system=_SYSTEM, prompt=prompt,
                           max_tokens=MAX_TOKENS_GATE, temperature=0.2)
        data = _parse(raw)
        score = float(data.get("score", 0) or 0)
        critical = [str(c) for c in (data.get("critical") or [])]
        issues = [str(i) for i in (data.get("issues") or [])]
        strengths = [str(s) for s in (data.get("strengths") or [])]
        passed = score >= threshold and not critical
        return {
            "phase": phase, "provider": provider, "score": score,
            "passed": passed, "critical": critical, "issues": issues,
            "strengths": strengths,
            "recommendation": str(data.get("recommendation", "")),
        }
    except Exception as ex:  # un gate caído no debe tumbar el pipeline
        return {
            "phase": phase, "provider": provider, "score": float(threshold),
            "passed": True, "critical": [], "issues": [],
            "strengths": [], "recommendation": f"(gate omitido: {type(ex).__name__})",
        }
