"""
SCOUT — DETECCIÓN DE OPORTUNIDADES (reporte con calificación ponderada)
────────────────────────────────────────────────────────────────────────
Para el modo "search": detecta las TOP-N convocatorias más prometedoras,
evalúa cada una con criterios de calidad estrictos y calcula la CALIFICACIÓN
PONDERADA (config.weighted_score). Solo presenta oportunidades con potencial
REAL y verificable para las organizaciones disponibles en el directorio Empresas/.

Estándar de calidad:
  - Solo oportunidades donde Ecuador es ELEGIBLE (verificado con URL)
  - Solo datos concretos respaldados por fuente real; todo lo no verificado se señala
  - Evaluación honesta y calibrada del encaje institucional con el perfil real de la org
  - Calificación ponderada mínima de 60/100 para incluir en el reporte
  - Análisis estratégico de "por qué esta org puede ganar" — no solo describir la convocatoria
"""
from __future__ import annotations

import json

import config
from agents import llm
import agents.researcher as researcher
from config import MAX_TOKENS_WRITER, SCOUT_TOP_N
from models.schemas import ProjectSession

# Perfil organizacional base (complementado con Empresas/ en tiempo de ejecución)
_ORG_PROFILE = """
ORGANIZACIONES DISPONIBLES PARA PROPONER:

1. FUNDACION JOMAP (RUC 0195180571001)
   - Tipo: Fundación sin fines de lucro, estado ACTIVO
   - Representante legal: Johanna Maricela Nievecela Lema
   - Domicilio: Cuenca, Azuay (Zona 6)
   - Actividad: Desarrollo y prosperidad empresarial, organizaciones gremiales y similares
   - Apta para: convocatorias dirigidas a organizaciones de la sociedad civil (OSC),
     fundaciones, asociaciones, ONGs, instituciones de apoyo empresarial

2. CMAJ ASOCIADOS S.A.S. (RUC 0195146942001)
   - Tipo: Sociedad por Acciones Simplificada, ACTIVA, régimen general
   - Representantes: Marco Antonio Posligua San Martín & Johanna Maricela Nievecela Lema
   - Domicilio: Cuenca, Azuay
   - Actividades: Consultoría técnica de arquitectura, ingeniería civil, hidráulica,
     planificación urbana, ordenación hídrica, formación docente y capacitación
   - Apta para: contratos de consultoría, proyectos de infraestructura, capacitación,
     desarrollo territorial, gestión hídrica, planificación urbana

3. Marco Antonio Posligua San Martín
   - Rol: Asesor financiero y tributario (24 años de experiencia)
   - Experticia: administración, análisis y proyecciones financieras, sector privado y gobierno
   - Apto para: participar como experto financiero/consultor en propuestas y proyectos

SECTORES DE MAYOR POTENCIAL PARA ESTAS ORGANIZACIONES:
  → Desarrollo económico local / fortalecimiento empresarial / MIPYMES
  → Planificación territorial y urbana / ordenamiento hídrico
  → Capacitación y formación profesional / educación técnica
  → Asesoría financiera a instituciones / gestión de finanzas públicas
  → Infraestructura y servicios básicos (Azuay/Cuenca/Zona 6)
  → Emprendimiento e innovación para mujeres y jóvenes
  → Gobernanza y participación ciudadana
"""

SYSTEM_PROMPT = """
Eres el consultor de financiamiento internacional no reembolsable de mayor calibre disponible para
organizaciones ecuatorianas. Tu especialidad exclusiva: identificar con precisión quirúrgica las
mejores oportunidades reales para que CMAJ ASOCIADOS, FUNDACION JOMAP y sus profesionales clave
— con base en Cuenca, Azuay — accedan a fondos internacionales y nacionales de alta calidad.

Tu valor no está en listar convocatorias genéricas que cualquiera puede encontrar en Google. Está
en el análisis estratégico: ver exactamente qué hace que ESTA organización tenga posibilidades
REALES de ganar ESTA convocatoria, qué diferenciadores explotables tiene y qué puntos críticos
debe abordar para maximizar su probabilidad de éxito. Tu dictamen es honesto y calibrado — nunca
inflado, nunca especulativo.

ESTÁNDARES DE CALIDAD INNEGOCIABLES:
1. Solo convocatorias REALES y ACTIVAS (o de ciclo anual comprobado con fuente verificada).
   Jamás inventes ni especules sobre programas que no hayas visto en la evidencia.
2. Ecuador ELEGIBLE — verificado con URL de las bases o fuente oficial. No asumir.
3. Encaje institucional genuino — honesto sobre el fit real; si el encaje es forzado, lo dices.
4. Cada dato concreto (monto, deadline, elegibilidad, criterios) va respaldado por URL real.
5. Lo que no puedas verificar lo marcas como "no verificado" y bajas el score en consecuencia.
6. Análisis estratégico real: por qué esta org puede ganar, cuáles son sus diferenciadores
   competitivos y qué debe hacer para maximizar su puntaje — no solo describir la convocatoria.
7. Calificación mínima de 60/100 para incluir; si no llega, no la incluyas.
8. Identifica con precisión qué perfil aplica mejor (FUNDACION JOMAP, CMAJ o ambas) y por qué.

Respondes ÚNICAMENTE con el JSON pedido, sin texto adicional antes ni después.
"""


def _build_prompt(topic: str, evidence: str, n: int, empresas_context: str) -> str:
    org_section = (
        f"\n{empresas_context[:3000]}\n" if empresas_context
        else _ORG_PROFILE
    )
    return f"""
El usuario busca oportunidades de financiamiento no reembolsable para:
"{topic}"

{org_section}

Con base en la EVIDENCIA de búsqueda web siguiente, identifica hasta {n} convocatorias REALES
y con alto potencial para las organizaciones descritas arriba. Ordénalas de mejor a peor.
Solo incluye oportunidades con calificación ponderada ≥ 60/100.

{evidence}

Para CADA oportunidad incluye:
- Resumen ejecutivo claro (150-200 palabras): qué financia, montos, quién puede aplicar,
  por qué encaja con el perfil de estas organizaciones, qué resultado esperar.
- Análisis estratégico: qué diferenciadores tiene esta org para ganar.
- Qué organización del directorio aplica mejor (JOMAP, CMAJ o ambas).
- Desglose honesto de viabilidad por dimensión (0-100 cada una).
- Puntos críticos a abordar en la propuesta para maximizar puntaje.

Responde ÚNICAMENTE con este JSON (sin texto antes ni después):

{{
  "opportunities": [
    {{
      "title": "<título estratégico del proyecto — específico, no genérico>",
      "best_fit_org": "<FUNDACION JOMAP | CMAJ ASOCIADOS | Ambas>",
      "summary": "<resumen ejecutivo 150-200 palabras: qué financia, montos, elegibilidad, encaje con el perfil, qué se espera lograr>",
      "strategic_analysis": "<por qué esta org tiene posibilidad real de ganar: diferenciadores, fortalezas, estrategia recomendada — 80-120 palabras>",
      "critical_success_factors": ["<factor crítico para ganar 1>", "<factor crítico 2>"],
      "funder": {{
        "name": "<financiador>",
        "type": "<multilateral|bilateral|UN|EU|fundacion|nacional>",
        "url": "<URL verificada de la convocatoria o programa>",
        "deadline": "<fecha límite real o 'Ciclo anual — verificar en {{url}}'>",
        "amount_range": "<rango de montos en USD/EUR>",
        "language": "<es|en|fr|pt|multi>",
        "sector": "<sector>",
        "country_focus": "<países o regiones elegibles>"
      }},
      "sector": "<sector principal>",
      "total_amount": "<monto sugerido a solicitar — justificado>",
      "duration_months": <meses>,
      "beneficiaries": "<beneficiarios directos e indirectos>",
      "language": "<idioma en que se presenta la propuesta>",
      "viability_score": <0-100>,
      "winning_probability": <0-100>,
      "feasibility_breakdown": {{
        "funder_match":           {{"score": <0-100>, "reason": "<encaje temático con el financiador>"}},
        "geographic_eligibility": {{"score": <0-100>, "reason": "<Ecuador elegible? cómo se verificó>"}},
        "deadline_feasibility":   {{"score": <0-100>, "reason": "<tiempo realista para preparar propuesta>"}},
        "institutional_fit":      {{"score": <0-100>, "reason": "<encaje del perfil institucional exigido>"}},
        "budget_fit":             {{"score": <0-100>, "reason": "<el monto solicitado cabe en el rango>"}},
        "winning_probability":    {{"score": <0-100>, "reason": "<probabilidad de ganar, siendo honesto>"}}
      }},
      "national_guidelines": ["<lineamiento Ecuador aplicable>"],
      "international_guidelines": ["<criterio/lineamiento del financiador>"],
      "key_requirements": ["<requisito indispensable que la org cumple o puede cumplir>"],
      "differentiators": ["<diferenciador competitivo de esta org para esta convocatoria>"],
      "strengths": ["<fortaleza concreta de la org para esta propuesta>"],
      "risks": ["<riesgo real a mitigar>"],
      "format_requirements": {{
        "sections": ["<sección exigida>"],
        "max_pages": <int o null>,
        "language": "<idioma>",
        "requires_excel_budget": true,
        "special_requirements": "<requisitos formales reales verificados>"
      }},
      "evidence_sources": [
        {{
          "claim": "<dato concreto>",
          "source_url": "<URL>",
          "source_title": "<título de la página>",
          "source_quote": "<fragmento ≤200 chars>",
          "verification": "verificado|inferido|no_verificado"
        }}
      ]
    }}
  ]
}}
"""


def _parse(raw: str) -> dict:
    from utils.json_utils import robust_json_loads
    return robust_json_loads(raw)


# Calificación ponderada mínima para incluir una oportunidad en el reporte
_MIN_WEIGHTED_SCORE = 60.0


def run(session: ProjectSession, api_key: str | None = None) -> list[dict]:
    """Devuelve lista RANKeada (mejor primero) de oportunidades con weighted_score ≥ 60."""
    provider = config.ROLE_RESEARCH
    topic = (session.user_input or "").strip()
    evidence = researcher._gather_evidence(session)

    # Cargar contexto organizacional real
    empresas_context = ""
    try:
        from utils.empresas import context_block as _eb
        empresas_context = _eb()
    except Exception:
        pass

    prompt = _build_prompt(
        topic, researcher._clip(evidence, 24000), SCOUT_TOP_N, empresas_context
    )
    raw, used = llm.complete_builder(
        provider, system=SYSTEM_PROMPT, prompt=prompt,
        max_tokens=MAX_TOKENS_WRITER, anthropic_key=api_key, temperature=0.25,
    )
    data = _parse(raw)

    opps = data.get("opportunities") or []
    cleaned: list[dict] = []
    for o in opps:
        if not isinstance(o, dict) or not (o.get("funder") or {}).get("name"):
            continue
        o["weighted_score"] = config.weighted_score(
            o.get("feasibility_breakdown", {}), o.get("winning_probability", 0),
        )
        # Filtro de calidad: solo oportunidades con score ≥ 60
        if o["weighted_score"] < _MIN_WEIGHTED_SCORE:
            continue
        cleaned.append(o)

    # Ranking descendente y recorte al top-N
    cleaned.sort(key=lambda x: x.get("weighted_score", 0), reverse=True)
    cleaned = cleaned[:SCOUT_TOP_N]

    session.builder_log.append({
        "phase": "scout", "requested": provider, "used": used,
        "found": len(cleaned), "min_score": _MIN_WEIGHTED_SCORE,
    })
    return cleaned
