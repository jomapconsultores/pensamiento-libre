import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# ── API ────────────────────────────────────────────────────────────────────
# Revisor / Analista / Clasificador → Anthropic (usan tool-use de búsqueda web).
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# ── Constructores no-Claude (redactor + financiero) ─────────────────────────
# Mistral, Codestral y DeepSeek exponen una API compatible con OpenAI
# (chat/completions), por lo que comparten cliente HTTP en agents/llm.py.
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
CODESTRAL_API_KEY = os.getenv("CODESTRAL_API_KEY", "")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")

MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "mistral-large-latest")
CODESTRAL_MODEL = os.getenv("CODESTRAL_MODEL", "codestral-latest")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

MISTRAL_BASE_URL = os.getenv("MISTRAL_BASE_URL", "https://api.mistral.ai/v1")
CODESTRAL_BASE_URL = os.getenv("CODESTRAL_BASE_URL", "https://codestral.mistral.ai/v1")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")

LLM_TIMEOUT_SEC = float(os.getenv("LLM_TIMEOUT_SEC", "600"))

# Rotación de constructores por ciclo de redacción:
#   ciclo 1 → Mistral, ciclo 2 → Codestral, ciclo 3 → DeepSeek, ciclo 4 → Mistral…
# El corrector (revisor) SIEMPRE es Claude.
BUILDER_ROTATION = [
    p.strip() for p in os.getenv(
        "BUILDER_ROTATION", "mistral,codestral,deepseek"
    ).split(",") if p.strip()
]


def builder_for_cycle(cycle: int) -> str:
    """Devuelve el proveedor constructor que toca en este ciclo (1-indexed)."""
    if not BUILDER_ROTATION:
        return "anthropic"
    return BUILDER_ROTATION[(max(1, cycle) - 1) % len(BUILDER_ROTATION)]

# ── Auth multiusuario ───────────────────────────────────────────────────────
# Secreto para firmar tokens de sesión. Si no se define, cae en AGENTE_MAP_API_KEY.
AUTH_SECRET = os.getenv("AUTH_SECRET", "") or os.getenv("AGENTE_MAP_API_KEY", "")
AUTH_TOKEN_TTL_HOURS = int(os.getenv("AUTH_TOKEN_TTL_HOURS", "168"))  # 7 días
# La X-API-Key maestra (AGENTE_MAP_API_KEY) entra como administrador (bootstrap).

# ── Supabase ───────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
SUPABASE_SERVICE_ROLE_JWT = os.getenv("SUPABASE_SERVICE_ROLE_JWT", "")

MAX_TOKENS_ANALYST = 8000
MAX_TOKENS_WRITER = 16000
MAX_TOKENS_REVIEWER = 8000
MAX_TOKENS_FINANCIAL = 8000

# ── Pipeline ───────────────────────────────────────────────────────────────
MAX_REVIEW_CYCLES = 5
# Verificación exigente: se requiere ≥90 en CADA elemento Y ≥90 global.
APPROVAL_THRESHOLD = 90       # Score global mínimo para aprobar propuesta (0-100)
ELEMENT_THRESHOLD = 90        # Score mínimo EXIGIDO en cada criterio individual (0-100)
VIABILITY_THRESHOLD = 55      # Score mínimo de viabilidad para continuar (0-100)

# ── Search ─────────────────────────────────────────────────────────────────
SEARCH_MAX_RESULTS = 12       # resultados por query individual
SEARCH_SAFE = "moderate"
SEARCH_MAX_QUERIES = 14       # nº máximo de queries en una búsqueda profunda
SEARCH_FETCH_PAGES = 6        # nº de páginas cuyo contenido se descarga y analiza
SEARCH_FETCH_CHARS = 6000     # caracteres máx. extraídos por página descargada
SEARCH_TIMEOUT = 12           # timeout (s) al descargar una página

# ── Documentos de salida ─────────────────────────────────────────────────────
GENERATE_WORD = True          # genera la propuesta final en .docx
GENERATE_EXCEL = True         # genera cálculos (presupuesto/marco lógico) en .xlsx

# ── Major funders tracked ──────────────────────────────────────────────────
FUNDERS = [
    # Multilateral
    "BID", "CAF", "Banco Mundial", "BCIE", "FIDA", "FONPLATA",
    # UN System
    "PNUD", "UNICEF", "OPS", "FAO", "UNESCO", "PNUMA", "ONU Mujeres",
    "UNFPA", "ACNUR", "PMA",
    # Bilateral
    "USAID", "GIZ", "AECID", "JICA", "AFD", "COSUDE", "UKAID",
    "Países Bajos", "Canadá IDRC", "Korea KOICA",
    # EU
    "Unión Europea", "Horizon Europe", "DEVCO", "DG CLIMA",
    # Foundations
    "Gates Foundation", "Ford Foundation", "Avina", "Kellogg",
    "Wellcome Trust", "Bloomberg Philanthropies",
    # Ecuador
    "SENESCYT", "INIAP", "MAG Ecuador", "MAATE",
    # Regional
    "OTCA", "IUCN", "IICA",
]
