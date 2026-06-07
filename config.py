import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# ── API ────────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

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
