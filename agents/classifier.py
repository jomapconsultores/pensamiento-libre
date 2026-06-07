"""
AGENTE 0 — CLASIFICADOR / INTAKE
─────────────────────────────────
1. DETECTA qué tipo de entregable se solicita (auto), respetando un override manual.
2. INVESTIGA a profundidad (deep_search) el formato exigido, el marco legal/normativo
   y las fuentes necesarias.
3. CONSTRUYE el DocumentBrief universal: tipo, perfiles de experto, secciones,
   FormatSpec exacto (tipo/tamaño de letra, márgenes, interlineado, límites), "qué hay
   que hacer", lineamientos nacionales e internacionales y criterios de evaluación.

Para 'propuesta' el flujo sigue usando el Analista (viabilidad/financiador) y luego se
convierte su AnalysisResult en un DocumentBrief con analysis_to_brief().
"""
import json
import anthropic
from config import MODEL, MAX_TOKENS_ANALYST
from models.schemas import AnalysisResult, DocumentBrief
from models.doc_types import (
    DOC_TYPES, get_doc_type, all_criteria, FormatSpec, DEFAULT_DOC_TYPE,
)
from tools.search import ALL_TOOLS, TOOL_HANDLERS


def _clip(text: str, n: int = 4000) -> str:
    text = (text or "").strip()
    return text if len(text) <= n else text[:n] + "\n[…texto truncado…]"


# ════════════════════════════════════════════════════════════════════════════
#  DETECCIÓN AUTOMÁTICA DEL TIPO
# ════════════════════════════════════════════════════════════════════════════
_DETECT_SYSTEM = """
Eres un clasificador experto de documentos profesionales y académicos. Dado lo que el usuario
pide (y, si existen, una plantilla y documentos de apoyo), determinas el TIPO de entregable.
Respondes SOLO con la clave exacta del tipo, sin texto adicional.
"""


def detect_type(user_input: str, template_text: str, support_docs: list, api_key: str) -> str:
    options = "\n".join(f"- {k}: {dt.description}" for k, dt in DOC_TYPES.items())
    support_join = "\n".join(f"[{n}] {_clip(t, 800)}" for n, t in (support_docs or []))
    prompt = f"""
TIPOS DISPONIBLES (clave: descripción):
{options}

SOLICITUD DEL USUARIO:
{_clip(user_input, 2500)}

PLANTILLA/MODELO (opcional):
{_clip(template_text, 1200) or "(ninguna)"}

DOCUMENTOS DE APOYO (opcional):
{support_join or "(ninguno)"}

Devuelve ÚNICAMENTE la clave del tipo más adecuado (p. ej. articulo_cientifico).
Si nada encaja con claridad, responde: generico
"""
    from agents._client import make_client
    client = make_client(api_key)
    resp = client.messages.create(
        model=MODEL, max_tokens=20, system=_DETECT_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    key = ""
    for b in resp.content:
        if hasattr(b, "text"):
            key += b.text
    key = key.strip().lower().split()[0] if key.strip() else DEFAULT_DOC_TYPE
    return key if key in DOC_TYPES else DEFAULT_DOC_TYPE


# ════════════════════════════════════════════════════════════════════════════
#  CONSTRUCCIÓN DEL BRIEF (tipos no-propuesta) — con investigación profunda
# ════════════════════════════════════════════════════════════════════════════
_BRIEF_SYSTEM = """
Eres un director editorial y experto multidisciplinario del MÁS ALTO NIVEL. Coordinas a varios
especialistas (científicos, juristas, metodólogos, editores) para producir entregables impecables.
Tu tarea AHORA es definir CON PRECISIÓN qué hay que hacer y bajo qué formato y normas.

Usa deep_search y fetch_page para investigar a fondo:
- El FORMATO exigido (tipo y tamaño de letra, márgenes, interlineado, límites de páginas/palabras/
  caracteres, estilo de cita) según la revista, organismo, institución o normativa aplicable.
- El MARCO LEGAL/NORMATIVO NACIONAL (Ecuador) e INTERNACIONAL/ORGANIZACIONAL pertinente.
- FUENTES y referencias reales y verificables que el redactor deberá usar (no inventes fuentes).

Sé exigente y específico. Si el usuario subió una plantilla, respeta su estructura y formato.
Responde ÚNICAMENTE con el JSON pedido, sin texto adicional.
"""


def _run_research_loop(client: anthropic.Anthropic, prompt: str) -> str:
    messages = [{"role": "user", "content": prompt}]
    while True:
        response = client.messages.create(
            model=MODEL, max_tokens=MAX_TOKENS_ANALYST, system=_BRIEF_SYSTEM,
            tools=ALL_TOOLS, messages=messages,
        )
        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            results = []
            for tc in [b for b in response.content if b.type == "tool_use"]:
                handler = TOOL_HANDLERS.get(tc.name)
                out = handler(**tc.input) if handler else json.dumps({"error": "tool not found"})
                results.append({"type": "tool_result", "tool_use_id": tc.id, "content": out})
            messages.append({"role": "user", "content": results})
            continue
        for block in response.content:
            if hasattr(block, "text"):
                return block.text
        return ""


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    s, e = raw.find("{"), raw.rfind("}") + 1
    if s >= 0 and e > s:
        raw = raw[s:e]
    return json.loads(raw)


def build_brief(session, doc_type_key: str, api_key: str) -> DocumentBrief:
    dt = get_doc_type(doc_type_key)
    default_fmt = dt.format.as_dict()
    support_join = "\n\n".join(f"=== {n} ===\n{_clip(t, 3500)}" for n, t in (session.support_docs or []))

    prompt = f"""
TIPO DE DOCUMENTO: {dt.name} (clave: {dt.key})
DESCRIPCIÓN: {dt.description}
PERFILES DE EXPERTO BASE: {", ".join(dt.personas)}
SECCIONES SUGERIDAS: {", ".join(dt.sections)}
EXIGENCIA DE RIGOR: {dt.rigor_notes}

FORMATO POR DEFECTO DE ESTE TIPO (ajústalo SOLO si hay evidencia en los requisitos o la plantilla):
{json.dumps(default_fmt, ensure_ascii=False)}

SOLICITUD DEL USUARIO:
{_clip(session.user_input, 4000)}

PLANTILLA/MODELO OPCIONAL A IMITAR (formato y estructura):
{_clip(session.template_text, 3000) or "(ninguna)"}

DOCUMENTOS DE APOYO (material fuente para el contenido):
{support_join or "(ninguno)"}

INVESTIGA con deep_search/fetch_page el formato exigido, el marco normativo y las fuentes reales.
Luego responde ÚNICAMENTE con este JSON (sin texto extra):

{{
  "title": "<título preciso del entregable>",
  "language": "es|en|fr|pt",
  "personas": ["<perfil experto 1>", "<perfil 2>"],
  "sections": ["<sección 1>", "<sección 2>"],
  "format_spec": {{
    "font_name": "<tipo de letra>",
    "font_size": <pt>,
    "line_spacing": <1.0|1.15|1.5|2.0>,
    "margin_top_cm": <cm>, "margin_bottom_cm": <cm>,
    "margin_left_cm": <cm>, "margin_right_cm": <cm>,
    "alignment": "justify|left",
    "citation_style": "<APA 7|Vancouver|IEEE|... o ''>",
    "max_pages": <int o null>, "min_pages": <int o null>,
    "max_words": <int o null>, "min_words": <int o null>,
    "max_chars": <int o null>,
    "notes": "<otras exigencias formales reales>"
  }},
  "instructions": "<QUÉ hay que hacer exactamente, brief detallado para el redactor, ≥200 palabras>",
  "national_guidelines": ["<lineamiento legal/normativo nacional Ecuador 1>"],
  "international_guidelines": ["<norma internacional/organizacional/editorial 1>"],
  "key_requirements": ["<requisito indispensable 1>"],
  "quality_markers": ["<marca de excelencia/diferenciador 1>"],
  "source_notes": "<fuentes y referencias reales encontradas, con datos verificables>"
}}
"""
    from agents._client import make_client
    client = make_client(api_key)
    raw = _run_research_loop(client, prompt)
    data = _parse_json(raw)

    fmt = FormatSpec.from_dict({**default_fmt, **(data.get("format_spec") or {})})
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


# ════════════════════════════════════════════════════════════════════════════
#  CONVERSOR: AnalysisResult (propuesta) → DocumentBrief
# ════════════════════════════════════════════════════════════════════════════
def analysis_to_brief(analysis: AnalysisResult, doc_type_key: str = "propuesta") -> DocumentBrief:
    dt = get_doc_type(doc_type_key)
    fmt = dt.format.as_dict()
    fr = analysis.format_requirements or {}
    # Refinar formato con lo detectado por el analista
    if fr.get("font_size"):
        try:
            fmt["font_size"] = float(str(fr["font_size"]).replace("pt", "").strip())
        except ValueError:
            pass
    if fr.get("max_pages"):
        try:
            fmt["max_pages"] = int(fr["max_pages"])
        except (ValueError, TypeError):
            pass
    if fr.get("language"):
        fmt["language"] = fr["language"]
    if fr.get("special_requirements"):
        fmt["notes"] = (fmt.get("notes", "") + " " + str(fr["special_requirements"])).strip()

    sections = fr.get("sections") or dt.sections
    return DocumentBrief(
        doc_type_key=dt.key,
        title=analysis.project_title,
        language=analysis.language or "es",
        personas=dt.personas,
        sections=sections,
        format_spec=fmt,
        instructions=analysis.recommendations,
        national_guidelines=analysis.national_guidelines,
        international_guidelines=analysis.international_guidelines,
        key_requirements=analysis.key_requirements,
        quality_markers=analysis.differentiators,
        source_notes="; ".join(analysis.comparable_projects),
        needs_budget_excel=analysis.requires_excel or dt.needs_budget_excel,
        evaluation_criteria=all_criteria(dt),
        rigor_notes=dt.rigor_notes,
        raw=analysis.raw_analysis,
    )
