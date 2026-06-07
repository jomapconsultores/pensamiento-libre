"""
AGENTE 4 — ESTRUCTURADOR FINANCIERO Y DE MARCO LÓGICO
─────────────────────────────────────────────────────
Toma la propuesta final aprobada y extrae datos ESTRUCTURADOS (presupuesto,
marco lógico, cronograma) en JSON. Esa misma data alimenta el Excel (cálculos
vivos con fórmulas) y se referencia en el Word, garantizando que ambos coincidan.
"""
import json
import anthropic
from config import MODEL, MAX_TOKENS_FINANCIAL
from models.schemas import DocumentBrief, FinancialPackage


SYSTEM_PROMPT = """
Eres un especialista en formulación financiera y marco lógico de proyectos de cooperación
internacional. Tu trabajo es CONVERTIR una propuesta ya redactada en datos estructurados y
exactos, listos para una hoja de cálculo Excel y para una matriz de marco lógico.

REGLAS:
- Extrae los datos REALES de la propuesta. No inventes rubros que no existan; si falta un dato,
  estima de forma coherente con el resto y márcalo de forma razonable.
- Los montos deben ser NÚMEROS puros (sin símbolos, sin separadores de miles): 12500.00, no "$12.500".
- El presupuesto debe ser internamente consistente: cantidad × costo_unitario debe poder
  multiplicarse y los totales deben cuadrar con el monto total del proyecto.
- Separa lo solicitado al financiador de la contraparte/cofinanciamiento cuando exista.
- El marco lógico debe seguir la jerarquía: Impacto → Efecto(s) → Producto(s) → Actividad(es).
- El cronograma debe indicar en qué meses ocurre cada actividad (números de mes).

Responde ÚNICAMENTE con JSON válido. Sin texto adicional.
"""


def _build_prompt(brief: DocumentBrief, proposal: str) -> str:
    return f"""
Documento: {brief.title}
Idioma: {brief.language}
Moneda: USD (salvo que el documento indique otra)

A partir del siguiente DOCUMENTO, extrae los datos estructurados (presupuesto, marco lógico
y cronograma) tal como aparezcan en él.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPUESTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{proposal}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde ÚNICAMENTE con este JSON (sin texto antes ni después):

{{
  "currency": "USD",
  "budget_items": [
    {{
      "categoria": "<p.ej. Personal / Equipos / Capacitación / Viajes / Operación>",
      "actividad": "<actividad o concepto>",
      "unidad": "<p.ej. mes, persona, taller, unidad>",
      "cantidad": <número>,
      "costo_unitario": <número>,
      "fuente_solicitada": <monto solicitado al financiador, número>,
      "contraparte": <monto de contraparte/cofinanciamiento, número o 0>
    }}
  ],
  "logframe_rows": [
    {{
      "nivel": "Impacto | Efecto | Producto | Actividad",
      "resumen_narrativo": "<texto>",
      "indicador": "<indicador SMART>",
      "linea_base": "<valor o 'Por establecer'>",
      "meta": "<valor meta>",
      "fuente_verificacion": "<fuente>",
      "supuestos": "<supuestos/riesgos>"
    }}
  ],
  "schedule_rows": [
    {{
      "actividad": "<actividad>",
      "responsable": "<responsable>",
      "meses": [<números de mes en que ocurre, p.ej. 1,2,3>],
      "entregable": "<entregable o hito>"
    }}
  ],
  "cofinancing_notes": "<resumen del esquema de cofinanciamiento, 1-3 frases>",
  "budget_narrative": "<nota breve que justifique la estructura del presupuesto, 2-4 frases>"
}}

Incluye TODOS los rubros del presupuesto y TODAS las filas del marco lógico que aparezcan.
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


def _num(v) -> float:
    try:
        if isinstance(v, str):
            v = v.replace(",", "").replace("$", "").replace("USD", "").strip()
        return float(v)
    except (ValueError, TypeError):
        return 0.0


def run(session, proposal: str, api_key: str) -> FinancialPackage:
    client = anthropic.Anthropic(api_key=api_key)
    brief: DocumentBrief = session.brief
    prompt = _build_prompt(brief, proposal)

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS_FINANCIAL,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    data = _parse_result(response.content[0].text)

    # Normalizar números del presupuesto
    budget_items = []
    for it in data.get("budget_items", []):
        budget_items.append({
            "categoria": str(it.get("categoria", "")),
            "actividad": str(it.get("actividad", "")),
            "unidad": str(it.get("unidad", "")),
            "cantidad": _num(it.get("cantidad", 0)),
            "costo_unitario": _num(it.get("costo_unitario", 0)),
            "fuente_solicitada": _num(it.get("fuente_solicitada", 0)),
            "contraparte": _num(it.get("contraparte", 0)),
        })

    return FinancialPackage(
        currency=str(data.get("currency", "USD")),
        budget_items=budget_items,
        logframe_rows=data.get("logframe_rows", []),
        schedule_rows=data.get("schedule_rows", []),
        cofinancing_notes=str(data.get("cofinancing_notes", "")),
        budget_narrative=str(data.get("budget_narrative", "")),
    )
