"""
AGENTE 1' — INVESTIGADOR WEB (proveedor-agnóstico, NO-Claude)
─────────────────────────────────────────────────────────────
Hace la búsqueda en web y la investigación que antes hacía Claude, pero con una
IA constructora (por defecto DeepSeek, configurable con ROLE_RESEARCH).

Como Mistral/Codestral/DeepSeek exponen una API tipo chat/completions sin el
tool-use propio del SDK de Anthropic, la búsqueda se orquesta en código:
  1) La IA propone consultas dirigidas (o se usa el paquete de queries base).
  2) `deep_search` (DuckDuckGo, GRATIS) ejecuta las queries y DESCARGA páginas reales.
  3) La IA lee esa evidencia y produce el JSON de análisis / brief.

Reutiliza el esquema y el system-prompt de agents/analyst.py para mantener
idéntico el formato que consumen el redactor y el revisor.
"""
from __future__ import annotations

import json
import re

import config
from agents import llm
import agents.analyst as analyst
from models.doc_types import get_doc_type, all_criteria, FormatSpec
from models.schemas import AnalysisResult, DocumentBrief, ProjectSession
from tools.search import (
    execute_deep_search, execute_fetch_page, opportunity_queries,
)
from config import (
    MAX_TOKENS_ANALYST, SEARCH_FETCH_PAGES, VIABILITY_THRESHOLD,
)


# ── Utilidades ───────────────────────────────────────────────────────────────
def _clip(text: str, n: int) -> str:
    text = (text or "").strip()
    return text if len(text) <= n else text[:n] + "\n[…truncado…]"


def _support_block(session: ProjectSession) -> str:
    docs = getattr(session, "support_docs", None) or []
    if not docs:
        return ""
    joined = "\n\n".join(f"=== {n} ===\n{(t or '')[:6000]}" for n, t in docs)
    return f"\n\nDOCUMENTOS ADJUNTOS POR EL USUARIO (analízalos como material fuente real):\n{joined}\n"


def _propose_queries(provider: str, topic: str, base: list[str]) -> list[str]:
    """La IA investigadora propone consultas dirigidas. Si falla, usa `base`."""
    sys = ("Eres un investigador experto en financiamiento internacional. Devuelves "
           "ÚNICAMENTE un JSON: {\"queries\": [\"...\", ...]} con 8-12 consultas variadas "
           "(español + inglés + francés/portugués si aplica) para encontrar convocatorias, "
           "bases, requisitos y elegibilidad. Sin texto extra.")
    prompt = (f"Tema del usuario: \"{topic}\"\n\n"
              "Propón 8-12 consultas potentes (incluye nombres de financiadores como "
              "BID/CAF/UE/PNUD/GIZ/USAID/GEF/GCF y términos de 'bases/requisitos/elegibilidad').\n"
              "Devuelve SOLO el JSON {\"queries\": [...]}.")
    try:
        raw = llm.complete(provider, system=sys, prompt=prompt, max_tokens=1200, temperature=0.4)
        data = _parse_json(raw)
        qs = [str(q).strip() for q in (data.get("queries") or []) if str(q).strip()]
        # Combina las propuestas con la base, sin duplicar, conservando orden.
        out, seen = [], set()
        for q in qs + base:
            if q not in seen:
                seen.add(q)
                out.append(q)
        return out[:14] or base
    except Exception:
        return base


def _parse_json(raw: str) -> dict:
    from utils.json_utils import robust_json_loads
    return robust_json_loads(raw)


def _gather_evidence(session: ProjectSession, seed: dict | None = None) -> str:
    """Ejecuta la búsqueda en web y devuelve la evidencia como texto para la IA.

    Si `seed` (una oportunidad ya elegida en el scouting) está presente, la búsqueda
    se ENFOCA en ese financiador/convocatoria: descarga su URL y dirige las queries a
    sus bases, requisitos, formato y elegibilidad.
    """
    provider = config.ROLE_RESEARCH
    topic = (session.user_input or "").strip()
    mode = session.input_mode

    pieces: list[str] = []

    # En modo URL: descarga primero los enlaces entregados por el usuario.
    if mode == "url":
        urls = re.findall(r"https?://\S+", topic)
        for u in urls[:6]:
            page = execute_fetch_page(u)
            pieces.append(f"=== PÁGINA ENTREGADA: {u} ===\n{_clip(page, 6000)}")

    # Oportunidad elegida (scouting → generación): foco en esa entidad.
    if seed:
        funder = (seed.get("funder") or {})
        fname = funder.get("name", "")
        furl = funder.get("url", "")
        if furl and furl.startswith("http"):
            page = execute_fetch_page(furl)
            pieces.append(f"=== BASES DE LA CONVOCATORIA ELEGIDA: {furl} ===\n{_clip(page, 7000)}")
        base = [
            f"{fname} {topic} bases requisitos formato elegibilidad",
            f"{fname} convocatoria {topic} presupuesto plantilla cofinanciamiento",
            f"{fname} {topic} Ecuador criterios de evaluación deadline",
        ] + opportunity_queries(topic)[:6]
        queries = base[:12]
        try:
            evidence = execute_deep_search(queries, fetch_pages=SEARCH_FETCH_PAGES)
        except Exception as ex:
            evidence = json.dumps({"error": f"deep_search falló: {ex}"}, ensure_ascii=False)
        pieces.append("=== EVIDENCIA DE BÚSQUEDA WEB (enfocada) ===\n" + _clip(evidence, 18000))
        return "\n\n".join(pieces)

    # Búsqueda profunda: usa el paquete base de 35+ queries directamente.
    # Se eliminó el round-trip extra de _propose_queries (LLM call que añadía
    # 5-15s sin mejorar significativamente los resultados vs. el paquete base).
    base = opportunity_queries(topic)
    queries = base
    try:
        evidence = execute_deep_search(queries, fetch_pages=SEARCH_FETCH_PAGES)
    except Exception as ex:  # la búsqueda nunca debe tumbar el pipeline
        evidence = json.dumps({"error": f"deep_search falló: {ex}", "queries": queries},
                              ensure_ascii=False)
    pieces.append("=== EVIDENCIA DE BÚSQUEDA WEB (deep_search) ===\n" + _clip(evidence, 22000))

    return "\n\n".join(pieces)


# ════════════════════════════════════════════════════════════════════════════
#  INVESTIGACIÓN DE PROPUESTAS  →  AnalysisResult
# ════════════════════════════════════════════════════════════════════════════
def run(session: ProjectSession, api_key: str | None = None,
        seed: dict | None = None) -> AnalysisResult:
    """Investiga (web) y produce el análisis de viabilidad con la IA ROLE_RESEARCH.

    Si `seed` (oportunidad elegida en el scouting) está presente, el análisis se
    centra en ESA convocatoria con sus requisitos reales (no re-busca otra)."""
    provider = config.ROLE_RESEARCH
    evidence = _gather_evidence(session, seed=seed)

    seed_block = ""
    if seed:
        seed_block = (
            "\n\nOPORTUNIDAD ELEGIDA POR EL USUARIO (analízala a fondo; NO cambies de "
            "financiador ni de convocatoria):\n" + json.dumps(seed, ensure_ascii=False)[:4000] + "\n"
        )

    # Contexto organizacional (carpeta Empresas/) — para direccionar la propuesta
    empresas_block = ""
    try:
        from utils.empresas import context_block as _eb
        empresas_block = _eb()
        if empresas_block:
            empresas_block = "\n\n" + empresas_block
    except Exception:
        pass

    # Reutiliza el esquema JSON completo del analista (modo "analizar documento"),
    # entregándole la evidencia ya recolectada como material fuente.
    document = (
        f"TEMA / SOLICITUD DEL USUARIO:\n{session.user_input}\n"
        f"{seed_block}\n"
        f"{evidence}"
        f"{_support_block(session)}"
        f"{empresas_block}\n\n"
        "INSTRUCCIÓN: NO inventes datos. Usa SOLO la evidencia de arriba; cada dato "
        "concreto (financiador, deadline, monto, elegibilidad, criterios) debe estar "
        "respaldado por una URL real presente en la evidencia. Si un dato no aparece, "
        "márcalo como 'no verificado' y baja viability_score en consecuencia.\n"
        "Al identificar la organización ejecutora/proponente, usa los datos REALES de "
        "la sección ORGANIZACIONES E INDIVIDUOS DISPONIBLES (si existe arriba)."
    )
    prompt = analyst._build_analysis_prompt(document)

    raw, used = llm.complete_builder(
        provider, system=analyst.SYSTEM_PROMPT, prompt=prompt,
        max_tokens=MAX_TOKENS_ANALYST, anthropic_key=api_key, temperature=0.3)
    data = analyst._parse_result(raw)
    result = analyst.result_from_data(data, raw)
    session.builder_log.append({"phase": "research", "requested": provider, "used": used})
    return result


# ════════════════════════════════════════════════════════════════════════════
#  INVESTIGACIÓN DE OTROS TIPOS  →  DocumentBrief
# ════════════════════════════════════════════════════════════════════════════
_BRIEF_SYSTEM = """
Eres un director editorial e investigador senior de primer orden, con dominio excepcional en
gestión del conocimiento, análisis normativo y arquitectura de documentos de alta complejidad.
Tu especialidad es identificar con exactitud qué debe contener un entregable de alta calidad —
sus secciones obligatorias, su marco legal/normativo nacional e internacional, sus fuentes reales
y su formato preciso — y traducirlo en instrucciones que permiten producir un documento impecable
al primer intento.

Razonas de forma sistemática y sin lagunas: revisas la evidencia disponible, determinas el
estándar real del tipo de documento y defines los criterios de éxito con una claridad que no
deja margen a la interpretación ni al relleno.

NO inventes fuentes ni normas: usa SOLO la evidencia entregada. Si algo no está en la evidencia,
indícalo como "a verificar" — nunca lo fabules. Respondes ÚNICAMENTE con el JSON pedido.
"""


def build_brief(session: ProjectSession, doc_type_key: str,
                api_key: str | None = None) -> DocumentBrief:
    """Investiga (web) y arma el brief universal con la IA ROLE_RESEARCH."""
    provider = config.ROLE_RESEARCH
    dt = get_doc_type(doc_type_key)
    default_fmt = dt.format.as_dict()
    evidence = _gather_evidence(session)
    support_join = "\n\n".join(
        f"=== {n} ===\n{_clip(t, 3500)}" for n, t in (session.support_docs or [])
    )

    prompt = f"""
TIPO DE DOCUMENTO: {dt.name} (clave: {dt.key})
DESCRIPCIÓN: {dt.description}
PERFILES DE EXPERTO BASE: {", ".join(dt.personas)}
SECCIONES SUGERIDAS: {", ".join(dt.sections)}
EXIGENCIA DE RIGOR: {dt.rigor_notes}

FORMATO POR DEFECTO (ajústalo SOLO si la evidencia o la plantilla lo justifican):
{json.dumps(default_fmt, ensure_ascii=False)}

SOLICITUD DEL USUARIO:
{_clip(session.user_input, 4000)}

PLANTILLA/MODELO OPCIONAL A IMITAR:
{_clip(session.template_text, 3000) or "(ninguna)"}

DOCUMENTOS DE APOYO:
{support_join or "(ninguno)"}

{_clip(evidence, 18000)}

Con base en la evidencia anterior, responde ÚNICAMENTE con este JSON (sin texto extra):

{{
  "title": "<título preciso del entregable>",
  "language": "es|en|fr|pt",
  "personas": ["<perfil experto 1>", "<perfil 2>"],
  "sections": ["<sección 1>", "<sección 2>"],
  "format_spec": {{
    "font_name": "<tipo de letra>", "font_size": <pt>,
    "line_spacing": <1.0|1.15|1.5|2.0>,
    "margin_top_cm": <cm>, "margin_bottom_cm": <cm>,
    "margin_left_cm": <cm>, "margin_right_cm": <cm>,
    "alignment": "justify|left", "citation_style": "<APA 7|Vancouver|IEEE|... o ''>",
    "max_pages": <int o null>, "min_pages": <int o null>,
    "max_words": <int o null>, "min_words": <int o null>,
    "max_chars": <int o null>, "notes": "<otras exigencias formales reales>"
  }},
  "instructions": "<QUÉ hay que hacer exactamente, ≥200 palabras>",
  "national_guidelines": ["<lineamiento nacional Ecuador 1>"],
  "international_guidelines": ["<norma internacional/organizacional/editorial 1>"],
  "key_requirements": ["<requisito indispensable 1>"],
  "quality_markers": ["<marca de excelencia 1>"],
  "source_notes": "<fuentes y referencias reales encontradas, con datos verificables>"
}}
"""
    raw, used = llm.complete_builder(
        provider, system=_BRIEF_SYSTEM, prompt=prompt,
        max_tokens=MAX_TOKENS_ANALYST, anthropic_key=api_key, temperature=0.3)
    data = _parse_json(raw)

    fmt = FormatSpec.from_dict({**default_fmt, **(data.get("format_spec") or {})})
    session.builder_log.append({"phase": "research_brief", "requested": provider, "used": used})
    return DocumentBrief(
        doc_type_key=dt.key,
        title=data.get("title", "Documento sin título"),
        language=data.get("language", "es"),
        personas=data.get("personas") or dt.personas,
        sections=data.get("sections") or dt.sections,
        format_spec=fmt.as_dict(),
        instructions=data.get("instructions", ""),
        national_guidelines=data.get("national_guidelines", []),
        international_guidelines=data.get("international_guidelines", []),
        key_requirements=data.get("key_requirements", []),
        quality_markers=data.get("quality_markers", []),
        source_notes=data.get("source_notes", ""),
        needs_budget_excel=dt.needs_budget_excel,
        evaluation_criteria=all_criteria(dt),
        rigor_notes=dt.rigor_notes,
        raw=raw,
    )
