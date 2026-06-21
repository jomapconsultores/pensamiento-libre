"""
Interfaz visual del sistema — diseño profesional con Rich.
Paleta: azul medianoche + ámbar/dorado para acentos + esmeralda/carmesí para estados.
"""
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.text import Text
from rich.columns import Columns
from rich.align import Align
from rich import box
from rich.rule import Rule
from rich.padding import Padding
from contextlib import contextmanager

console = Console(highlight=False)

# ── Paleta ────────────────────────────────────────────────────────────────────
_C_GOLD    = "dark_goldenrod"
_C_BLUE    = "steel_blue1"
_C_DIM     = "grey62"
_C_OK      = "bright_green"
_C_WARN    = "yellow3"
_C_ERR     = "bright_red"
_C_HEAD    = "bold white"
_C_ACCENT  = "cornflower_blue"


def _bar(value: float, width: int = 20) -> str:
    """Barra de progreso Unicode (█ y ░) sin dependencias extra."""
    filled = round(value / 100 * width)
    filled = max(0, min(width, filled))
    if value >= 85:
        color = _C_OK
    elif value >= 65:
        color = _C_WARN
    else:
        color = _C_ERR
    bar = "█" * filled + "░" * (width - filled)
    return f"[{color}]{bar}[/{color}]"


def _score_cell(value: float, threshold: float = 0.0) -> str:
    if value >= 90:
        return f"[{_C_OK}]{value:.0f}/100[/{_C_OK}]"
    elif value >= 75:
        return f"[{_C_WARN}]{value:.0f}/100[/{_C_WARN}]"
    else:
        return f"[{_C_ERR}]{value:.0f}/100[/{_C_ERR}]"


# ── Banner ────────────────────────────────────────────────────────────────────
def banner():
    console.print()
    title = Text()
    title.append("  AGENTE MAP  ", style=f"bold {_C_GOLD}")
    title.append("· Inteligencia Artificial para el Desarrollo\n", style=_C_DIM)
    title.append("  Propuestas de Financiamiento Internacional No Reembolsable\n",
                 style=f"bold {_C_BLUE}")
    title.append(f"  FUNDACION JOMAP  ·  CMAJ ASOCIADOS  ·  Cuenca, Ecuador\n",
                 style=_C_DIM)
    title.append(f"  BID · CAF · Banco Mundial · PNUD · GIZ · USAID · UE · y más",
                 style=f"dim {_C_DIM}")
    console.print(Panel(
        Align.center(title),
        border_style=_C_GOLD,
        padding=(1, 6),
        box=box.DOUBLE_EDGE,
    ))
    console.print()


# ── Separadores de fase ───────────────────────────────────────────────────────
def phase(title: str, icon: str = "▶"):
    console.print()
    console.print(Rule(
        f"[bold {_C_GOLD}]{icon}  {title}[/bold {_C_GOLD}]",
        style=_C_GOLD,
        align="left",
    ))
    console.print()


def section(title: str):
    """Sub-sección dentro de una fase."""
    console.print(f"\n  [bold {_C_ACCENT}]┌─ {title}[/bold {_C_ACCENT}]")


# ── Mensajes de estado ────────────────────────────────────────────────────────
def info(msg: str):
    console.print(f"  [{_C_BLUE}]›[/{_C_BLUE}]  {msg}")


def success(msg: str):
    console.print(f"  [{_C_OK}]✔[/{_C_OK}]  {msg}")


def warning(msg: str):
    console.print(f"  [{_C_WARN}]⚠[/{_C_WARN}]  {msg}")


def error(msg: str):
    console.print(f"  [{_C_ERR}]✖[/{_C_ERR}]  {msg}")


def detail(label: str, value: str):
    console.print(f"  [{_C_DIM}]│[/{_C_DIM}]  [{_C_DIM}]{label}:[/{_C_DIM}]  {value}")


# ── Spinner ───────────────────────────────────────────────────────────────────
@contextmanager
def spinner(msg: str):
    with Progress(
        SpinnerColumn(spinner_name="dots2", style=_C_GOLD),
        TextColumn(f"  [{_C_DIM}]{msg}[/{_C_DIM}]"),
        transient=True,
        console=console,
    ) as progress:
        progress.add_task("", total=None)
        yield


# ── Reporte de análisis ───────────────────────────────────────────────────────
def analysis_report(analysis):
    score = analysis.viability_score
    prob  = analysis.winning_probability

    # Panel principal
    t = Table(
        box=box.SIMPLE,
        show_header=False,
        padding=(0, 2),
        border_style=_C_DIM,
    )
    t.add_column("Campo",  style=f"bold {_C_DIM}", width=24, no_wrap=True)
    t.add_column("Valor",  width=60)

    t.add_row("Título del proyecto",   f"[bold white]{analysis.project_title}[/bold white]")
    t.add_row("", "")
    t.add_row("Financiador",    f"[{_C_BLUE}]{analysis.funder.name}[/{_C_BLUE}]"
                                f"  [{_C_DIM}]{analysis.funder.type}[/{_C_DIM}]")
    t.add_row("URL / Portal",   f"[{_C_DIM}]{analysis.funder.url}[/{_C_DIM}]")
    t.add_row("Monto disponible",  f"[bold]{analysis.total_amount}[/bold]")
    t.add_row("Duración",          f"{analysis.duration_months} meses")
    t.add_row("Sector",            analysis.sector)
    t.add_row("Idioma propuesta",  f"[{_C_ACCENT}]{analysis.language}[/{_C_ACCENT}]")
    t.add_row("Beneficiarios",     analysis.beneficiaries)
    t.add_row("", "")
    t.add_row("Viabilidad",
              f"{_bar(score)}  [{_score_color(score)}]{score:.0f}/100[/{_score_color(score)}]")
    t.add_row("Prob. de ganar",
              f"{_bar(prob)}  [{_score_color(prob)}]{prob:.0f}%[/{_score_color(prob)}]")
    t.add_row("", "")
    t.add_row("Decisión",  _go_badge(analysis.go_no_go))

    console.print(Panel(
        t,
        title=f"[bold {_C_GOLD}]  ANÁLISIS DE VIABILIDAD  [/bold {_C_GOLD}]",
        border_style=_C_GOLD,
        padding=(0, 1),
        box=box.ROUNDED,
    ))

    # Fortalezas y riesgos en columnas
    if analysis.strengths or analysis.risks:
        console.print()
        _two_col_list(
            "Fortalezas",   analysis.strengths,  _C_OK,   "✔",
            "Riesgos",      analysis.risks,       _C_WARN, "▲",
        )

    # Fuentes de evidencia
    if getattr(analysis, "evidence_sources", None):
        verified = [s for s in analysis.evidence_sources
                    if s.get("verification") == "verificado"]
        if verified:
            console.print(f"\n  [{_C_DIM}]Fuentes verificadas: {len(verified)} / "
                          f"{len(analysis.evidence_sources)}[/{_C_DIM}]")
    console.print()


def _score_color(v: float) -> str:
    return _C_OK if v >= 75 else _C_WARN if v >= 50 else _C_ERR


def _two_col_list(t1, l1, c1, ic1, t2, l2, c2, ic2):
    """Dos listas side-by-side en la consola."""
    def _build(title, items, color, icon):
        lines = [f"[bold {color}]{title}[/bold {color}]"]
        for item in (items or [])[:6]:
            lines.append(f"  [{color}]{icon}[/{color}] {item}")
        return "\n".join(lines)
    left  = _build(t1, l1, c1, ic1)
    right = _build(t2, l2, c2, ic2)
    console.print(Columns([
        Padding(left,  (0, 3, 0, 2)),
        Padding(right, (0, 2, 0, 2)),
    ]))


# ── Brief report ──────────────────────────────────────────────────────────────
def brief_report(brief):
    from models.doc_types import get_doc_type, FormatSpec
    dt  = get_doc_type(brief.doc_type_key)
    fmt = FormatSpec.from_dict(brief.format_spec)

    t = Table(box=box.SIMPLE, show_header=False, padding=(0, 2), border_style=_C_DIM)
    t.add_column("Campo", style=f"bold {_C_DIM}", width=22, no_wrap=True)
    t.add_column("Valor", width=60)
    t.add_row("Tipo de documento", f"[bold {_C_BLUE}]{dt.name}[/bold {_C_BLUE}]")
    t.add_row("Título",            f"[bold]{brief.title}[/bold]")
    t.add_row("Idioma",            brief.language)
    t.add_row("Formato",           fmt.to_prompt())
    t.add_row("Excel / Presupuesto",
              f"[{_C_OK}]Sí[/{_C_OK}]" if brief.needs_budget_excel
              else f"[{_C_DIM}]No[/{_C_DIM}]")

    console.print(Panel(
        t,
        title=f"[bold {_C_GOLD}]  BRIEF DEL ENTREGABLE  [/bold {_C_GOLD}]",
        border_style=_C_GOLD,
        padding=(0, 1),
        box=box.ROUNDED,
    ))
    if brief.personas:
        console.print(f"\n  [bold {_C_ACCENT}]Perfiles de experto:[/bold {_C_ACCENT}]")
        for p in brief.personas:
            console.print(f"    [{_C_ACCENT}]·[/{_C_ACCENT}] {p}")
    if brief.sections:
        console.print(f"\n  [bold {_C_DIM}]Secciones:[/bold {_C_DIM}]")
        for i, s in enumerate(brief.sections, 1):
            console.print(f"    [{_C_DIM}]{i:02d}[/{_C_DIM}]  {s}")
    console.print()


# ── Badge GO / NO-GO ──────────────────────────────────────────────────────────
def _go_badge(decision: str) -> str:
    if decision == "GO":
        return f"[bold white on {_C_OK}]  ✔  GO — VIABLE  [/bold white on {_C_OK}]"
    elif decision == "NO-GO":
        return f"[bold white on {_C_ERR}]  ✖  NO-GO — NO VIABLE  [/bold white on {_C_ERR}]"
    return f"[bold black on {_C_WARN}]  ◆  CONDICIONAL  [/bold black on {_C_WARN}]"


# ── Reporte de revisión ───────────────────────────────────────────────────────
def review_report(review, cycle: int):
    approved = review.approved
    border   = _C_OK if approved else _C_ERR
    status   = (f"[bold {_C_OK}]✔  APROBADA[/bold {_C_OK}]" if approved
                else f"[bold {_C_ERR}]✖  REQUIERE CORRECCIONES[/bold {_C_ERR}]")

    t = Table(box=box.SIMPLE, show_header=True, padding=(0, 2))
    t.add_column("Criterio de evaluación", style="bold", width=44)
    t.add_column("Puntaje",  width=14)
    t.add_column("Barra",    width=22, no_wrap=True)
    t.add_column("≥ 90",     width=4)

    for name, score in review.scores_by_criterion().items():
        ok_icon = f"[{_C_OK}]✔[/{_C_OK}]" if score >= 90 else f"[{_C_ERR}]✖[/{_C_ERR}]"
        t.add_row(name, _score_cell(score), _bar(score, 16), ok_icon)

    t.add_section()
    ov = review.overall_score
    t.add_row(
        "[bold]PUNTAJE GLOBAL[/bold]",
        f"[bold]{_score_cell(ov)}[/bold]",
        _bar(ov, 16),
        f"[bold][{_C_OK if ov >= 90 else _C_ERR}]{'✔' if ov >= 90 else '✖'}[/{_C_OK if ov >= 90 else _C_ERR}][/bold]",
    )

    console.print(Panel(
        t,
        title=f"[bold {_C_GOLD}]  REVISIÓN — CICLO {cycle}  ·  {status}  [/bold {_C_GOLD}]",
        border_style=border,
        padding=(0, 1),
        box=box.ROUNDED,
    ))

    if review.critical_issues:
        console.print(f"\n  [bold {_C_ERR}]Problemas críticos:[/bold {_C_ERR}]")
        for issue in review.critical_issues:
            console.print(f"    [{_C_ERR}]▶[/{_C_ERR}] {issue}")

    if review.corrections:
        console.print(f"\n  [bold {_C_WARN}]Correcciones requeridas:[/bold {_C_WARN}]")
        for i, c in enumerate(review.corrections, 1):
            console.print(f"    [{_C_DIM}]{i:02d}[/{_C_DIM}]  {c}")

    if review.strengths:
        console.print(f"\n  [bold {_C_OK}]Aspectos destacados:[/bold {_C_OK}]")
        for s in review.strengths[:4]:
            console.print(f"    [{_C_OK}]✔[/{_C_OK}] {s}")

    if review.recommendation:
        console.print(f"\n  [{_C_DIM}]Recomendación:[/{_C_DIM}] {review.recommendation}")
    console.print()


# ── No-go ─────────────────────────────────────────────────────────────────────
def no_go(analysis):
    console.print(Panel(
        f"[bold {_C_ERR}]ANÁLISIS: NO-GO — PROYECTO NO VIABLE[/bold {_C_ERR}]\n\n"
        f"  Score de viabilidad:  [{_C_ERR}]{analysis.viability_score:.0f}/100[/{_C_ERR}]\n\n"
        f"[{_C_DIM}]{analysis.recommendations}[/{_C_DIM}]",
        border_style=_C_ERR,
        box=box.ROUNDED,
        padding=(1, 3),
    ))


# ── Banners finales ───────────────────────────────────────────────────────────
def approved_banner(output_path: str):
    console.print()
    console.print(Panel(
        Align.center(
            f"[bold {_C_OK}]✔  PROPUESTA APROBADA  ✔[/bold {_C_OK}]\n\n"
            f"[{_C_DIM}]Lista para enviar al financiador.[/{_C_DIM}]\n\n"
            f"[{_C_DIM}]Archivos guardados en:[/{_C_DIM}]\n"
            f"[{_C_BLUE}]{output_path}[/{_C_BLUE}]"
        ),
        border_style=_C_OK,
        box=box.DOUBLE_EDGE,
        padding=(1, 6),
    ))
    console.print()


def max_cycles_warning(output_path: str):
    console.print()
    console.print(Panel(
        Align.center(
            f"[bold {_C_WARN}]⚠  CICLOS MÁXIMOS ALCANZADOS[/bold {_C_WARN}]\n\n"
            f"[{_C_DIM}]Se guardó la mejor versión disponible.\n"
            f"Revisa las correcciones antes de enviar al financiador.[/{_C_DIM}]\n\n"
            f"[{_C_DIM}]Archivos en:[/{_C_DIM}]\n"
            f"[{_C_BLUE}]{output_path}[/{_C_BLUE}]"
        ),
        border_style=_C_WARN,
        box=box.ROUNDED,
        padding=(1, 6),
    ))
    console.print()


# ── Setup guide ───────────────────────────────────────────────────────────────
def setup_guide():
    console.print(Panel(
        f"[bold {_C_ERR}]API KEY NO CONFIGURADA[/bold {_C_ERR}]\n\n"
        f"  Para activar el sistema necesitas una clave de Anthropic (Claude):\n\n"
        f"  [bold]1.[/bold]  Ve a [{_C_BLUE}]https://console.anthropic.com/[/{_C_BLUE}]\n"
        f"  [bold]2.[/bold]  Crea una cuenta y genera una API Key\n"
        f"  [bold]3.[/bold]  Copia [{_C_WARN}].env.example[/{_C_WARN}] "
        f"como [{_C_WARN}].env[/{_C_WARN}]\n"
        f"  [bold]4.[/bold]  Pega tu clave en el archivo .env\n"
        f"  [bold]5.[/bold]  Ejecuta [{_C_OK}]py main.py[/{_C_OK}] nuevamente\n\n"
        f"  [{_C_DIM}]Costo aproximado por propuesta: $0.10 – $0.50 USD[/{_C_DIM}]",
        border_style=_C_ERR,
        box=box.ROUNDED,
        title=f"[bold {_C_ERR}]  CONFIGURACIÓN REQUERIDA  [/bold {_C_ERR}]",
        padding=(1, 4),
    ))
