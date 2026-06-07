"""
AGENTE 2 — REDACTOR / EDITORIALISTA EXPERTO MULTIDISCIPLINARIO
Produce CUALQUIER tipo de entregable de alto nivel (propuesta, artículo científico,
TDR/compras públicas, peer-review, tesis, documento legal/técnico) a partir del
DocumentBrief. Adopta los perfiles de experto indicados, respeta el formato exacto y
usa la plantilla (si existe) como referencia de estilo y los documentos de apoyo como fuente.
"""
import anthropic
from config import MODEL, MAX_TOKENS_WRITER
from models.schemas import DocumentBrief, ProjectSession


SYSTEM_PROMPT = """
Eres un colectivo de expertos de élite encarnado en un solo redactor: combinas el dominio técnico
de especialistas PhD del área, el rigor de un metodólogo, la precisión de un jurista y la pluma de
un editorialista y corrector de estilo de primer nivel. Has publicado en revistas indexadas, ganado
convocatorias internacionales, redactado pliegos y TDR jurídicamente blindados y dirigido tesis
doctorales. Tu sello: máxima profundidad técnica + un TOQUE HUMANO, claro, elegante y profesional.

PRINCIPIOS INNEGOCIABLES:
- Adopta exactamente los PERFILES DE EXPERTO indicados en el brief; piensa y escribe como ellos.
- Cumple AL PIE DE LA LETRA el formato exigido (estructura, secciones, estilo de cita) y los
  límites de extensión (páginas/palabras/caracteres). Si hay límite, autorregúlate para respetarlo.
- Rigor académico/científico/legal del más alto nivel: afirmaciones fundamentadas, datos con fuente,
  razonamiento explícito. NUNCA inventes datos, citas, referencias, artículos legales ni resultados.
  Si falta evidencia, decláralo o usa fuentes reales del brief/documentos de apoyo.
- Estilo humano y profesional: prosa fluida y precisa; evita relleno, clichés y frases vacías.
- Respeta el estilo de cita pedido (APA 7, Vancouver, IEEE, etc.) y referencia de forma consistente.
- Si se entrega una PLANTILLA, imita su estructura, tono y formato. Si hay DOCUMENTOS DE APOYO,
  extrae de ellos el contenido y cítalos cuando corresponda.

Genera el documento COMPLETO en Markdown limpio (encabezados #, ##, ###; tablas con |; listas),
en el idioma indicado, listo para entregar al más alto nivel. No añadas comentarios fuera del documento.
"""


def _clip(text: str, n: int) -> str:
    text = (text or "").strip()
    return text if len(text) <= n else text[:n] + "\n[…truncado…]"


def _build_prompt(brief: DocumentBrief, session: ProjectSession, corrections: list, cycle: int) -> str:
    from models.doc_types import FormatSpec, get_doc_type
    dt = get_doc_type(brief.doc_type_key)
    fmt = FormatSpec.from_dict(brief.format_spec)

    sections_str = "\n".join(f"  {i+1}. {s}" for i, s in enumerate(brief.sections))
    personas_str = "\n".join(f"  - {p}" for p in brief.personas)
    reqs_str = "\n".join(f"  - {r}" for r in brief.key_requirements) or "  - (según el tipo de documento)"
    quality_str = "\n".join(f"  - {q}" for q in brief.quality_markers) or "  - Excelencia técnica y claridad."
    nat_str = "\n".join(f"  - {g}" for g in brief.national_guidelines) or "  - Marco normativo nacional aplicable."
    intl_str = "\n".join(f"  - {g}" for g in brief.international_guidelines) or "  - Normas internacionales/organizacionales del área."

    template_block = ""
    if session.template_text:
        template_block = f"""
═══════════════════════════════════════════════════════════
PLANTILLA / MODELO A IMITAR (formato, estructura y tono — referencia, NO copiar contenido)
═══════════════════════════════════════════════════════════
{_clip(session.template_text, 4000)}
"""

    support_block = ""
    if session.support_docs:
        joined = "\n\n".join(f"=== {n} ===\n{_clip(t, 3500)}" for n, t in session.support_docs)
        support_block = f"""
═══════════════════════════════════════════════════════════
DOCUMENTOS DE APOYO (material fuente — extrae contenido y cita cuando corresponda)
═══════════════════════════════════════════════════════════
{joined}
"""

    budget_block = ""
    if brief.needs_budget_excel:
        budget_block = """
PRESUPUESTO: incluye una tabla de presupuesto limpia (Categoría | Actividad | Unidad | Cantidad |
Costo unitario | Solicitado/Referencial | Contraparte | Total) con números sin separadores de miles
(ej. 12500.00) cuyos subtotales y total cuadren. Se exportará a Excel con cálculos vivos.
"""

    corrections_block = ""
    if corrections:
        clist = "\n".join(f"  {i+1}. {c}" for i, c in enumerate(corrections))
        corrections_block = f"""
═══════════════════════════════════════════════════════════
CORRECCIONES DEL REVISOR (CICLO {cycle} — APLICA TODAS con precisión quirúrgica)
═══════════════════════════════════════════════════════════
{clist}
Mantén lo que ya estaba bien y eleva los puntos débiles por encima del 90%.
"""

    return f"""
Produce el siguiente entregable al MÁS ALTO NIVEL.

TIPO DE DOCUMENTO: {dt.name}
TÍTULO: {brief.title}
IDIOMA: {brief.language}
EXIGENCIA DE RIGOR: {brief.rigor_notes}

═══════════════════════════════════════════════════════════
PERFILES DE EXPERTO QUE DEBES ENCARNAR
═══════════════════════════════════════════════════════════
{personas_str}

═══════════════════════════════════════════════════════════
QUÉ HAY QUE HACER (brief del clasificador/analista)
═══════════════════════════════════════════════════════════
{brief.instructions}

═══════════════════════════════════════════════════════════
SECCIONES / ESTRUCTURA A PRODUCIR
═══════════════════════════════════════════════════════════
{sections_str}

═══════════════════════════════════════════════════════════
FORMATO EXIGIDO (CÚMPLELO CON RIGOR)
═══════════════════════════════════════════════════════════
{fmt.to_prompt()}

═══════════════════════════════════════════════════════════
REQUISITOS CRÍTICOS
═══════════════════════════════════════════════════════════
{reqs_str}

═══════════════════════════════════════════════════════════
LINEAMIENTOS NACIONALES (Ecuador) — CUMPLIR
═══════════════════════════════════════════════════════════
{nat_str}

═══════════════════════════════════════════════════════════
LINEAMIENTOS INTERNACIONALES / ORGANIZACIONALES — CUMPLIR
═══════════════════════════════════════════════════════════
{intl_str}

═══════════════════════════════════════════════════════════
MARCAS DE EXCELENCIA (lo que eleva este documento)
═══════════════════════════════════════════════════════════
{quality_str}

FUENTES REALES DISPONIBLES (úsalas; no inventes otras):
{_clip(brief.source_notes, 2500) or "  - Usa fuentes reales y verificables del área."}
{template_block}{support_block}{budget_block}{corrections_block}
═══════════════════════════════════════════════════════════
INSTRUCCIÓN FINAL
═══════════════════════════════════════════════════════════
Redacta el documento COMPLETO en {brief.language}, en Markdown limpio, cumpliendo el formato y los
límites de extensión. Será verificado con calificación mínima de 90% por elemento y 90% global,
incluyendo cumplimiento de formato y de lineamientos nacionales e internacionales. Hazlo impecable.
"""


def run(session: ProjectSession, corrections: list, api_key: str) -> str:
    client = anthropic.Anthropic(api_key=api_key)
    brief = session.brief
    prompt = _build_prompt(brief, session, corrections, session.current_cycle)
    response = client.messages.create(
        model=MODEL, max_tokens=MAX_TOKENS_WRITER, system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text
