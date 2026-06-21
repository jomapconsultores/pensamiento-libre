"""
CONSENSO DEL EQUIPO CONSTRUCTOR (agentes 1°, 2° y 3°: Mistral, Codestral, DeepSeek)
─────────────────────────────────────────────────────────────────────────────────
Antes de pasar el documento a Claude (veredicto final), los tres constructores lo
REVISAN entre sí y verifican que TODO esté cumplido a cabalidad: desde la búsqueda
/investigación (afirmaciones fundamentadas, sin inventar) hasta el documento
(requisitos, secciones, formato y calidad del más alto nivel).

Regla de consenso: solo se da por listo si TODOS los constructores disponibles dicen
que está completo. Si alguno detecta faltantes, se devuelven como correcciones para
que el redactor lo mejore y se vuelva a someter al consenso.
"""
from __future__ import annotations

import json

import config
from agents import llm
from models.doc_types import FormatSpec, get_doc_type
from models.schemas import DocumentBrief


SYSTEM_PROMPT = """
Eres un revisor de élite del equipo constructor. Tu trabajo es verificar con MÁXIMO RIGOR que el
entregable esté cumplido A CABALIDAD antes de enviarlo al verificador final. Revisas cuatro frentes:
1) INVESTIGACIÓN/BÚSQUEDA: las afirmaciones están fundamentadas en fuentes reales del brief; NO hay
   datos, citas ni cifras inventadas; lo exigido por la convocatoria/normativa está cubierto.
2) REQUISITOS Y SECCIONES: están todas las secciones y requisitos clave del brief.
3) FORMATO: cumple tipo de letra, extensión y estilo de cita exigidos.
4) CALIDAD: nivel profesional/académico impecable, coherente y sin relleno.

Sé estricto y honesto: si algo falta o es débil, márcalo como NO completo.
Responde ÚNICAMENTE con JSON válido:
{"complete": true|false, "confidence": <0-100>, "issues": ["<faltante/mejora concreta y accionable>", ...]}
Sin texto fuera del JSON.
"""

MAX_TOKENS_PEER = 2000


def _clip(text: str, n: int) -> str:
    text = (text or "").strip()
    return text if len(text) <= n else text[:n] + "\n[…truncado…]"


def _build_prompt(brief: DocumentBrief, proposal: str) -> str:
    dt = get_doc_type(brief.doc_type_key)
    fmt = FormatSpec.from_dict(brief.format_spec)
    sections = "\n".join(f"  - {s}" for s in brief.sections) or "  - (según el tipo)"
    reqs = "\n".join(f"  - {r}" for r in brief.key_requirements) or "  - (según el tipo)"
    nat = "\n".join(f"  - {g}" for g in brief.national_guidelines) or "  - (marco nacional aplicable)"
    intl = "\n".join(f"  - {g}" for g in brief.international_guidelines) or "  - (normas del área)"
    return f"""
Verifica si este entregable está cumplido A CABALIDAD (búsqueda + documento).

TIPO: {dt.name}
TÍTULO: {brief.title}
IDIOMA: {brief.language}

SECCIONES QUE DEBE TENER:
{sections}

REQUISITOS CRÍTICOS:
{reqs}

LINEAMIENTOS NACIONALES:
{nat}

LINEAMIENTOS INTERNACIONALES/ORGANIZACIONALES:
{intl}

FORMATO EXIGIDO: {fmt.to_prompt()}

FUENTES REALES DISPONIBLES (la base de la investigación; NO se deben inventar otras):
{_clip(brief.source_notes, 2500) or "  - (usar fuentes reales del área)"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTO A VERIFICAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{_clip(proposal, 45000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Devuelve SOLO el JSON con complete/confidence/issues.
"""


def _parse(raw: str) -> dict:
    from utils.json_utils import robust_json_loads
    return robust_json_loads(raw)


def _verdict(provider: str, prompt: str) -> dict:
    raw = llm.complete(provider, system=SYSTEM_PROMPT, prompt=prompt,
                       max_tokens=MAX_TOKENS_PEER, temperature=0.2)
    data = _parse(raw)
    return {
        "complete": bool(data.get("complete", False)),
        "confidence": float(data.get("confidence", 0) or 0),
        "issues": [str(i) for i in (data.get("issues") or [])],
    }


def consensus(session, proposal: str, api_key: str | None = None) -> tuple[bool, list, list]:
    """Los 3 constructores revisan el documento. Devuelve (ok, correcciones, detalles).

    ok = True solo si TODOS los constructores disponibles lo dan por completo.
    correcciones = unión de los faltantes detectados (con prefijo del agente).
    """
    brief: DocumentBrief = session.brief
    prompt = _build_prompt(brief, proposal)

    verdicts: list = []
    for provider in config.BUILDER_ROTATION:
        if not llm._builder_key(provider):
            continue
        try:
            v = _verdict(provider, prompt)
            verdicts.append({"provider": provider, **v})
        except Exception:
            continue  # un revisor caído no bloquea el consenso

    if not verdicts:
        return True, [], []  # sin revisores disponibles → no bloquear; decide Claude

    corrections: list = []
    all_complete = True
    for v in verdicts:
        if not v["complete"]:
            all_complete = False
        corrections.extend(f"[{v['provider']}] {i}" for i in v["issues"])

    session.peer_log.append({"cycle": session.current_cycle, "verdicts": verdicts})
    return all_complete, corrections, verdicts
