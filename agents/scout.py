"""
SCOUT — DETECCIÓN DE OPORTUNIDADES (reporte con calificación ponderada)
────────────────────────────────────────────────────────────────────────
Para el modo "search": en lugar de elegir una sola convocatoria, detecta las
TOP-N (def 5) más prometedoras, resume cada una y calcula su CALIFICACIÓN
PONDERADA (config.weighted_score). El usuario revisa el reporte (descargable en
Word) y luego elige una o varias para generar las propuestas completas.

La búsqueda en web la hace la misma IA investigadora (ROLE_RESEARCH, def DeepSeek)
sobre la evidencia recolectada por deep_search (DuckDuckGo, gratis).
"""
from __future__ import annotations

import json

import config
from agents import llm
import agents.researcher as researcher
from config import MAX_TOKENS_WRITER, SCOUT_TOP_N
from models.schemas import ProjectSession


SYSTEM_PROMPT = """
Eres un consultor senior en financiamiento internacional no reembolsable para Ecuador. Detectas las
MEJORES oportunidades reales y las presentas con rigor: cada dato concreto (financiador, deadline,
monto, elegibilidad, criterios, formato) debe estar respaldado por una URL real de la evidencia.
NO inventes convocatorias, fechas ni montos: si un dato no aparece en la evidencia, márcalo como
"no verificado". Respondes ÚNICAMENTE con el JSON pedido, sin texto adicional.
"""


def _build_prompt(topic: str, evidence: str, n: int) -> str:
    return f"""
El usuario busca oportunidades de financiamiento no reembolsable para:
"{topic}"

A partir de la EVIDENCIA de búsqueda web de abajo, identifica hasta {n} convocatorias/oportunidades
REALES y ACTIVAS (o de ciclo anual) para las que Ecuador sea elegible, ordenadas de mejor a peor.

{evidence}

Para CADA oportunidad incluye un resumen ejecutivo claro (120-180 palabras) que permita entenderla
sin leer las bases, y el desglose de viabilidad por dimensión (0-100 cada una). Responde ÚNICAMENTE
con este JSON (sin texto antes ni después):

{{
  "opportunities": [
    {{
      "title": "<título sugerido del proyecto para esta convocatoria>",
      "summary": "<resumen ejecutivo 120-180 palabras: qué financia, a quién, por qué encaja con el tema y con Ecuador, qué exige>",
      "funder": {{
        "name": "<financiador>", "type": "<multilateral|bilateral|UN|EU|fundacion|nacional>",
        "url": "<URL de la convocatoria>", "deadline": "<fecha límite o 'A verificar en {{url}}'>",
        "amount_range": "<rango de montos>", "language": "<es|en|fr|pt|multi>",
        "sector": "<sector>", "country_focus": "<países elegibles>"
      }},
      "sector": "<sector principal>", "total_amount": "<monto sugerido a solicitar>",
      "duration_months": <meses>, "beneficiaries": "<beneficiarios>", "language": "<idioma propuesta>",
      "viability_score": <0-100>, "winning_probability": <0-100>,
      "feasibility_breakdown": {{
        "funder_match":          {{"score": <0-100>, "reason": "<por qué el tema encaja>"}},
        "geographic_eligibility":{{"score": <0-100>, "reason": "<Ecuador elegible? probarlo>"}},
        "deadline_feasibility":  {{"score": <0-100>, "reason": "<tiempo para preparar?>"}},
        "institutional_fit":     {{"score": <0-100>, "reason": "<perfil del proponente exigido>"}},
        "budget_fit":            {{"score": <0-100>, "reason": "<el ask cabe en el rango>"}}
      }},
      "national_guidelines": ["<lineamiento nacional Ecuador 1>"],
      "international_guidelines": ["<lineamiento/criterio del financiador 1>"],
      "key_requirements": ["<requisito crítico 1>"],
      "differentiators": ["<diferenciador 1>"],
      "strengths": ["<fortaleza 1>"], "risks": ["<riesgo 1>"],
      "format_requirements": {{
        "sections": ["<sección exigida 1>"], "max_pages": <int o null>,
        "language": "<idioma>", "requires_excel_budget": true/false,
        "special_requirements": "<otros requisitos formales reales>"
      }},
      "evidence_sources": [
        {{"claim": "<dato concreto>", "source_url": "<URL>", "source_title": "<título>",
          "source_quote": "<fragmento ≤200 chars>", "verification": "verificado|inferido|no_verificado"}}
      ]
    }}
  ]
}}
"""


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


def run(session: ProjectSession, api_key: str | None = None) -> list[dict]:
    """Devuelve una lista RANKeada (mejor primero) de oportunidades detectadas,
    cada una con su `weighted_score` (calificación ponderada 0-100)."""
    provider = config.ROLE_RESEARCH
    topic = (session.user_input or "").strip()
    evidence = researcher._gather_evidence(session)

    prompt = _build_prompt(topic, researcher._clip(evidence, 24000), SCOUT_TOP_N)
    raw, used = llm.complete_builder(
        provider, system=SYSTEM_PROMPT, prompt=prompt,
        max_tokens=MAX_TOKENS_WRITER, anthropic_key=api_key, temperature=0.3)
    data = _parse(raw)

    opps = data.get("opportunities") or []
    cleaned: list[dict] = []
    for o in opps:
        if not isinstance(o, dict) or not (o.get("funder") or {}).get("name"):
            continue
        o["weighted_score"] = config.weighted_score(
            o.get("feasibility_breakdown", {}), o.get("winning_probability", 0))
        cleaned.append(o)

    # Ranking por calificación ponderada (desc) y recorte al top-N.
    cleaned.sort(key=lambda x: x.get("weighted_score", 0), reverse=True)
    cleaned = cleaned[:SCOUT_TOP_N]

    session.builder_log.append({"phase": "scout", "requested": provider, "used": used,
                                "found": len(cleaned)})
    return cleaned
