"""
AGENTE 3 — REVISOR Y CONTROLADOR DE CALIDAD (multi-formato)
Evalúa CUALQUIER tipo de entregable con máximo rigor, usando los criterios propios del
tipo de documento (definidos en el DocumentBrief) más el cumplimiento de formato y de
lineamientos nacionales e internacionales. Aplica la REGLA 90/90:
  aprueba SOLO si cada elemento ≥ 90 Y el global ≥ 90 (y sin problemas críticos).
La extensión (palabras/caracteres/páginas) se verifica de forma mecánica, no por el LLM.
"""
import json
import anthropic
from config import MODEL, MAX_TOKENS_REVIEWER, APPROVAL_THRESHOLD, ELEMENT_THRESHOLD
from models.schemas import DocumentBrief, ReviewResult
from models.doc_types import FormatSpec, get_doc_type
from tools.document_builder import text_stats


SYSTEM_PROMPT = """
Eres un panel de evaluación de máxima exigencia: reúnes a un evaluador senior de organismos
multilaterales (BID/Banco Mundial/Unión Europea), un árbitro PhD de revista indexada Q1, un
jurista especialista en normativa pública internacional y un editor académico con 25 años de
experiencia. Tu estándar es el más alto posible — calibrado, honesto y sin concesiones. No inflás
puntajes para complacer; si algo no es excelente, tu dictamen lo dice con precisión quirúrgica,
con las correcciones exactas que el redactor necesita para subsanarlo en el siguiente ciclo.

Tu valor está en la precisión del diagnóstico: identificas exactamente qué eleva un documento a
la excelencia y qué lo detiene. Cada corrección que emites es específica, accionable e indica
concretamente dónde y cómo intervenir — no correcciones genéricas como "mejorar la redacción",
sino "el párrafo 3 de la sección de justificación carece de datos cuantitativos que respalden
la magnitud del problema; agregar cifra oficial de [fuente] con año".

REGLA 90/90 (ESTRICTA — SIN EXCEPCIONES):
Un documento se aprueba ÚNICAMENTE si cumple AMBAS condiciones de forma simultánea:
  (a) CADA UNO de los criterios evaluados alcanza ≥ 90/100, Y
  (b) el puntaje GLOBAL es ≥ 90/100.
Si aunque sea UN solo criterio queda por debajo de 90, el resultado es NO aprobado — sin importar
cuán alto sea el promedio global. Un financiador internacional rechazará una propuesta con una sola
sección débil; el revisor aplica el mismo estándar.

Evalúas exactamente los criterios indicados (propios del tipo de documento) más el cumplimiento
de formato y de lineamientos nacionales e internacionales/organizacionales.

Responde ÚNICAMENTE con JSON válido siguiendo el esquema indicado. Sin texto extra.
"""


def _clip(text: str, n: int) -> str:
    text = (text or "").strip()
    return text if len(text) <= n else text[:n] + "\n[…truncado…]"


def _build_prompt(brief: DocumentBrief, proposal: str, cycle: int, stats: dict) -> str:
    dt = get_doc_type(brief.doc_type_key)
    fmt = FormatSpec.from_dict(brief.format_spec)
    criteria = brief.evaluation_criteria
    criteria_block = "\n".join(f'  - "{c}"' for c in criteria)
    # plantilla JSON de scores
    scores_json = ",\n".join(f'    "{c}": <0-100>' for c in criteria)

    nat_str = "\n".join(f"  - {g}" for g in brief.national_guidelines) or "  - (marco nacional aplicable)"
    intl_str = "\n".join(f"  - {g}" for g in brief.international_guidelines) or "  - (normas del organismo/área)"

    stats_str = (
        f"palabras={stats['word_count']}, caracteres={stats['char_count']}, "
        f"páginas estimadas={stats['page_estimate']}, dentro de límites={stats['within_limits']}"
    )
    stats_issues = "; ".join(stats["issues"]) if stats["issues"] else "ninguno"

    return f"""
Evalúa el siguiente entregable con máximo rigor, aplicando la REGLA 90/90.

TIPO DE DOCUMENTO: {dt.name}
TÍTULO: {brief.title}
IDIOMA REQUERIDO: {brief.language}
CICLO: {cycle}
UMBRAL: ≥{APPROVAL_THRESHOLD} global Y ≥{ELEMENT_THRESHOLD} en CADA criterio.

FORMATO EXIGIDO: {fmt.to_prompt()}
MEDICIÓN AUTOMÁTICA DE EXTENSIÓN (ya calculada, tómala como dato duro): {stats_str}
INCUMPLIMIENTOS DE EXTENSIÓN DETECTADOS: {stats_issues}
(Si hay incumplimientos de extensión, el criterio "Cumplimiento de Formato" NO puede llegar a 90.)

LINEAMIENTOS NACIONALES (Ecuador) A VERIFICAR:
{nat_str}

LINEAMIENTOS INTERNACIONALES/ORGANIZACIONALES A VERIFICAR:
{intl_str}

CRITERIOS A CALIFICAR (cada uno 0-100):
{criteria_block}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTO A EVALUAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{_clip(proposal, 60000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde ÚNICAMENTE con este JSON (sin texto antes ni después):

{{
  "overall_score": <0-100>,
  "criterion_scores": {{
{scores_json}
  }},
  "failing_elements": ["<criterio < 90 y por qué>"],
  "compliance_checklist": ["<ítem normativo/editorial verificado y su estado>"],
  "strengths": ["<fortaleza concreta 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "critical_issues": ["<problema crítico que impide aprobación, si lo hay>"],
  "corrections": ["<corrección específica y accionable 1 (ataca primero lo < 90)>", "<2>", "<3>", "<4>", "<5>"],
  "recommendation": "<resumen de 100-150 palabras explicando la decisión>"
}}

NOTA: NO incluyas "approved": el sistema lo calcula con la regla 90/90.
Califica TODOS los criterios listados. Si alguno < 90, corrections debe traer todo lo necesario.
"""


def _parse_result(raw: str) -> dict:
    raw = raw.strip()
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start >= 0 and end > start:
        raw = raw[start:end]
    return json.loads(raw)


def run(session, proposal: str, api_key: str) -> ReviewResult:
    from agents._client import make_client
    client = make_client(api_key)
    brief: DocumentBrief = session.brief
    cycle = session.current_cycle

    stats = text_stats(proposal, brief.format_spec)
    prompt = _build_prompt(brief, proposal, cycle, stats)

    response = client.messages.create(
        model=MODEL, max_tokens=MAX_TOKENS_REVIEWER, system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    data = _parse_result(response.content[0].text)

    # Normalizar puntajes para EXACTAMENTE los criterios del brief
    raw_scores = data.get("criterion_scores", {}) or {}
    criterion_scores = {}
    for c in brief.evaluation_criteria:
        criterion_scores[c] = float(raw_scores.get(c, 0) or 0)

    result = ReviewResult(
        approved=False,  # se recalcula con la regla 90/90
        overall_score=float(data.get("overall_score", 0) or 0),
        cycle=cycle,
        criterion_scores=criterion_scores,
        format_check=stats,
        strengths=data.get("strengths", []),
        corrections=data.get("corrections", []),
        critical_issues=data.get("critical_issues", []),
        compliance_checklist=data.get("compliance_checklist", []),
        recommendation=data.get("recommendation", ""),
    )

    # ── Penalización mecánica de formato: si la extensión incumple, ese criterio cae a <90 ──
    fmt_label = next((c for c in criterion_scores if c.lower().startswith("cumplimiento de formato")), None)
    if fmt_label and not stats["within_limits"]:
        criterion_scores[fmt_label] = min(criterion_scores[fmt_label], 80.0)

    # ── REGLA 90/90 (calculada en código) ──────────────────────────────────
    result.failing_elements = [
        f"{name}: {score:.0f}/100" for name, score in criterion_scores.items()
        if score < ELEMENT_THRESHOLD
    ]
    if not stats["within_limits"]:
        result.failing_elements.append("Extensión fuera de límites: " + "; ".join(stats["issues"]))

    all_ok = all(s >= ELEMENT_THRESHOLD for s in criterion_scores.values())
    result.approved = (
        result.overall_score >= APPROVAL_THRESHOLD
        and all_ok
        and stats["within_limits"]
        and not result.critical_issues
    )
    return result
