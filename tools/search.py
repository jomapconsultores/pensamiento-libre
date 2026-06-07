"""
MOTOR DE BÚSQUEDA PROFUNDA DE OPORTUNIDADES DE FINANCIAMIENTO
─────────────────────────────────────────────────────────────
Capas de búsqueda:
  1. web_search   — búsqueda de texto (DuckDuckGo) por query individual.
  2. news_search  — noticias recientes (convocatorias anunciadas).
  3. deep_search  — orquesta MÚLTIPLES queries + descarga el contenido real
                    de las páginas más relevantes (bases de convocatoria),
                    deduplica por dominio/URL y devuelve evidencia rica.
  4. fetch_page   — descarga y limpia el texto de una URL concreta para que el
                    agente lea los requisitos formales reales del financiador.
"""
import json
import re
import time
import html
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

from config import (
    SEARCH_MAX_RESULTS, SEARCH_SAFE, SEARCH_MAX_QUERIES,
    SEARCH_FETCH_PAGES, SEARCH_FETCH_CHARS, SEARCH_TIMEOUT,
)

_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
       "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# Dominios con alta señal de convocatorias reales (se priorizan al deduplicar)
HIGH_SIGNAL_DOMAINS = (
    "iadb.org", "caf.com", "worldbank.org", "undp.org", "un.org",
    "europa.eu", "ec.europa.eu", "giz.de", "usaid.gov", "aecid.es",
    "reliefweb.int", "devex.com", "ungm.org", "grants.gov", "thegef.org",
    "greenclimate.fund", "ifad.org", "fao.org", "unicef.org", "paho.org",
    "gob.ec", "senescyt.gob.ec", "ambiente.gob.ec", "agenciaregulacion",
    "fundacionavina.org", "fordfoundation.org", "gatesfoundation.org",
)


# ── Tool definitions for Claude API ────────────────────────────────────────
WEB_SEARCH_TOOL = {
    "name": "web_search",
    "description": (
        "Búsqueda web puntual de convocatorias de financiamiento no reembolsable, "
        "programas de cooperación y proyectos similares. Usa una sola query. "
        "Para una exploración amplia y profunda usa 'deep_search' en su lugar."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Consulta (es/en/fr/pt)."},
            "max_results": {"type": "integer", "default": 8},
        },
        "required": ["query"],
    },
}

DEEP_SEARCH_TOOL = {
    "name": "deep_search",
    "description": (
        "BÚSQUEDA PROFUNDA. Ejecuta varias queries a la vez, combina resultados de "
        "texto y noticias, DESCARGA el contenido real de las páginas más relevantes "
        "(bases de la convocatoria, formularios, requisitos) y devuelve evidencia "
        "consolidada y deduplicada. Úsalo como herramienta principal para investigar "
        "a fondo una oportunidad: pasa 4-10 queries en español e inglés."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "queries": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Lista de 4 a 10 consultas variadas (es/en/fr/pt).",
            },
            "fetch_pages": {
                "type": "integer",
                "description": "Cuántas páginas top descargar y leer (por defecto 6).",
                "default": SEARCH_FETCH_PAGES,
            },
        },
        "required": ["queries"],
    },
}

FETCH_PAGE_TOOL = {
    "name": "fetch_page",
    "description": (
        "Descarga y limpia el texto de una URL concreta (p. ej. la página de bases "
        "de una convocatoria) para leer requisitos formales, fechas, montos, criterios "
        "de elegibilidad y formato exigido. Úsalo cuando deep_search devuelva una URL "
        "prometedora que necesites leer a fondo."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "url": {"type": "string", "description": "URL completa a descargar."},
        },
        "required": ["url"],
    },
}


# ── Low-level helpers ──────────────────────────────────────────────────────
def _domain(url: str) -> str:
    m = re.search(r"https?://([^/]+)/?", url or "")
    return m.group(1).lower().replace("www.", "") if m else ""


def _is_high_signal(url: str) -> bool:
    d = _domain(url)
    return any(sig in d for sig in HIGH_SIGNAL_DOMAINS)


def _strip_html(raw: str, max_chars: int) -> str:
    """Convierte HTML en texto legible sin dependencias externas."""
    raw = re.sub(r"(?is)<script.*?</script>", " ", raw)
    raw = re.sub(r"(?is)<style.*?</style>", " ", raw)
    raw = re.sub(r"(?is)<noscript.*?</noscript>", " ", raw)
    raw = re.sub(r"(?is)<!--.*?-->", " ", raw)
    # Saltos en bloques
    raw = re.sub(r"(?i)</(p|div|li|tr|h[1-6]|section|article)>", "\n", raw)
    raw = re.sub(r"(?i)<br\s*/?>", "\n", raw)
    text = re.sub(r"(?s)<[^>]+>", " ", raw)
    text = html.unescape(text)
    text = re.sub(r"[ \t\f\v]+", " ", text)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
    text = text.strip()
    if len(text) > max_chars:
        text = text[:max_chars] + " […]"
    return text


# ── Search executors ───────────────────────────────────────────────────────
def execute_web_search(query: str, max_results: int = SEARCH_MAX_RESULTS) -> str:
    try:
        from ddgs import DDGS
        time.sleep(0.4)  # evitar rate limit
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results, safesearch=SEARCH_SAFE))
        if not results:
            return json.dumps({"error": "Sin resultados", "query": query}, ensure_ascii=False)
        return json.dumps(results, ensure_ascii=False, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "query": query}, ensure_ascii=False)


def execute_news_search(query: str, max_results: int = 6) -> str:
    try:
        from ddgs import DDGS
        time.sleep(0.4)
        with DDGS() as ddgs:
            results = list(ddgs.news(query, max_results=max_results))
        if not results:
            return json.dumps({"error": "Sin noticias", "query": query}, ensure_ascii=False)
        return json.dumps(results, ensure_ascii=False, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "query": query}, ensure_ascii=False)


def execute_fetch_page(url: str) -> str:
    try:
        req = Request(url, headers={"User-Agent": _UA, "Accept-Language": "es,en;q=0.8"})
        with urlopen(req, timeout=SEARCH_TIMEOUT) as resp:
            ctype = resp.headers.get("Content-Type", "")
            if "html" not in ctype and "text" not in ctype and ctype:
                return json.dumps(
                    {"url": url, "note": f"Contenido no textual ({ctype}). No descargado."},
                    ensure_ascii=False,
                )
            charset = "utf-8"
            m = re.search(r"charset=([\w-]+)", ctype)
            if m:
                charset = m.group(1)
            raw = resp.read(2_000_000).decode(charset, errors="replace")
        text = _strip_html(raw, SEARCH_FETCH_CHARS)
        return json.dumps({"url": url, "domain": _domain(url), "text": text}, ensure_ascii=False)
    except (HTTPError, URLError) as e:
        return json.dumps({"url": url, "error": f"No se pudo descargar: {e}"}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"url": url, "error": str(e)}, ensure_ascii=False)


def execute_deep_search(queries: list, fetch_pages: int = SEARCH_FETCH_PAGES) -> str:
    """Orquesta varias queries, combina texto+noticias, descarga páginas top y deduplica."""
    if isinstance(queries, str):
        queries = [queries]
    queries = [q for q in queries if q and q.strip()][:SEARCH_MAX_QUERIES]

    seen_urls: set = set()
    hits: list = []

    for q in queries:
        for kind, raw in (("web", execute_web_search(q, SEARCH_MAX_RESULTS)),
                          ("news", execute_news_search(q, 5))):
            try:
                items = json.loads(raw)
            except Exception:
                continue
            if isinstance(items, dict):  # error payload
                continue
            for it in items:
                url = it.get("href") or it.get("url") or it.get("link") or ""
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                hits.append({
                    "query": q,
                    "kind": kind,
                    "title": it.get("title") or it.get("source") or "",
                    "url": url,
                    "snippet": (it.get("body") or it.get("excerpt") or it.get("description") or "")[:400],
                    "date": it.get("date", ""),
                    "high_signal": _is_high_signal(url),
                })

    # Priorizar dominios de alta señal para la descarga de contenido
    hits.sort(key=lambda h: (not h["high_signal"], h["kind"] != "web"))

    fetched = 0
    for h in hits:
        if fetched >= max(0, int(fetch_pages)):
            break
        if not h["high_signal"]:
            continue
        page = json.loads(execute_fetch_page(h["url"]))
        if "text" in page and len(page["text"]) > 200:
            h["page_content"] = page["text"]
            fetched += 1

    # Si no se llenó con alta señal, descargar las primeras URLs restantes
    if fetched < max(0, int(fetch_pages)):
        for h in hits:
            if fetched >= int(fetch_pages):
                break
            if "page_content" in h:
                continue
            page = json.loads(execute_fetch_page(h["url"]))
            if "text" in page and len(page["text"]) > 200:
                h["page_content"] = page["text"]
                fetched += 1

    summary = {
        "queries_ejecutadas": queries,
        "total_resultados_unicos": len(hits),
        "paginas_descargadas": fetched,
        "resultados": hits[:40],
    }
    return json.dumps(summary, ensure_ascii=False, indent=2)


# ── Registry exposed to the agent ──────────────────────────────────────────
TOOL_HANDLERS = {
    "web_search": execute_web_search,
    "deep_search": execute_deep_search,
    "fetch_page": execute_fetch_page,
}

ALL_TOOLS = [DEEP_SEARCH_TOOL, WEB_SEARCH_TOOL, FETCH_PAGE_TOOL]


# ── Pre-built deep query packs for opportunity hunting ─────────────────────
def opportunity_queries(topic: str) -> list:
    """Genera un paquete amplio de queries para una búsqueda profunda por tema."""
    t = topic.strip()
    base = [
        f"convocatoria financiamiento no reembolsable Ecuador {t} 2025 2026",
        f"fondos concursables {t} Ecuador organizaciones sociedad civil 2025 2026",
        f"grants non-refundable funding Ecuador {t} 2025 2026 open call",
        f"call for proposals {t} Ecuador Latin America 2025 2026",
        f"BID BID-LAB FOMIN convocatoria {t} Ecuador",
        f"CAF cooperación técnica {t} Ecuador 2025 2026",
        f"PNUD UNDP UNICEF {t} Ecuador convocatoria sociedad civil",
        f"Unión Europea EU cooperación {t} Ecuador grant 2025 2026",
        f"GIZ USAID AECID AFD cooperación {t} Ecuador convocatoria",
        f"appel à propositions {t} Équateur financement 2025 2026",
        f"GEF GCF Fondo Verde Clima {t} Ecuador" if any(
            k in t.lower() for k in ("ambient", "clima", "agua", "biodivers", "bosque")
        ) else f"fundaciones internacionales {t} Ecuador grant 2025",
        f"requisitos bases convocatoria {t} Ecuador formato presupuesto elegibilidad",
    ]
    # Dedup conservando orden
    seen, out = set(), []
    for q in base:
        if q not in seen:
            seen.add(q)
            out.append(q)
    return out


# Compatibilidad retro
OPPORTUNITY_QUERIES = opportunity_queries("desarrollo sostenible Ecuador")
