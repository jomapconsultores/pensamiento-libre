from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.text import Text
from rich import box
from rich.rule import Rule
from contextlib import contextmanager

console = Console()


def banner():
    console.print()
    console.print(Panel(
        "[bold cyan]SISTEMA MULTIAGENTE DE PROPUESTAS[/bold cyan]\n"
        "[dim]Financiamiento No Reembolsable · Nacional e Internacional[/dim]\n"
        "[dim]Ecuador · CAF · BID · Banco Mundial · UE · PNUD · GIZ · USAID y más[/dim]",
        border_style="cyan",
        padding=(1, 4)
    ))
    console.print()


def phase(title: str, icon: str = ""):
    console.print()
    console.rule(f"[bold yellow]{icon}  {title}[/bold yellow]", style="yellow")
    console.print()


def info(msg: str):
    console.print(f"[cyan]  ›[/cyan] {msg}")


def success(msg: str):
    console.print(f"[green]  ✓[/green] {msg}")


def warning(msg: str):
    console.print(f"[yellow]  ⚠[/yellow] {msg}")


def error(msg: str):
    console.print(f"[red]  ✗[/red] {msg}")


@contextmanager
def spinner(msg: str):
    with Progress(
        SpinnerColumn(),
        TextColumn(f"[cyan]{msg}...[/cyan]"),
        transient=True,
        console=console
    ) as progress:
        progress.add_task("", total=None)
        yield


def analysis_report(analysis):
    score = analysis.viability_score
    prob = analysis.winning_probability
    score_color = "green" if score >= 75 else "yellow" if score >= 55 else "red"
    prob_color = "green" if prob >= 60 else "yellow" if prob >= 35 else "red"

    table = Table(box=box.ROUNDED, border_style="cyan", show_header=False, padding=(0, 1))
    table.add_column("Campo", style="bold", width=28)
    table.add_column("Valor", width=55)

    table.add_row("Proyecto", f"[bold]{analysis.project_title}[/bold]")
    table.add_row("Financiador", f"{analysis.funder.name}  [{analysis.funder.type}]")
    table.add_row("Monto disponible", analysis.total_amount)
    table.add_row("Duración", f"{analysis.duration_months} meses")
    table.add_row("Sector", analysis.sector)
    table.add_row("Idioma propuesta", analysis.language)
    table.add_row("Beneficiarios", analysis.beneficiaries)
    table.add_row(
        "Viabilidad",
        f"[{score_color}]{score:.0f}/100[/{score_color}]"
    )
    table.add_row(
        "Prob. de ganar",
        f"[{prob_color}]{prob:.0f}%[/{prob_color}]"
    )
    table.add_row(
        "Decisión",
        _go_badge(analysis.go_no_go)
    )

    console.print(Panel(table, title="[bold]REPORTE DE ANÁLISIS[/bold]", border_style="cyan"))

    if analysis.strengths:
        console.print("\n[bold green]Fortalezas identificadas:[/bold green]")
        for s in analysis.strengths:
            console.print(f"  [green]✓[/green] {s}")

    if analysis.risks:
        console.print("\n[bold yellow]Riesgos y consideraciones:[/bold yellow]")
        for r in analysis.risks:
            console.print(f"  [yellow]⚠[/yellow] {r}")

    console.print()


def brief_report(brief):
    from models.doc_types import get_doc_type, FormatSpec
    dt = get_doc_type(brief.doc_type_key)
    fmt = FormatSpec.from_dict(brief.format_spec)

    table = Table(box=box.ROUNDED, border_style="cyan", show_header=False, padding=(0, 1))
    table.add_column("Campo", style="bold", width=22)
    table.add_column("Valor", width=62)
    table.add_row("Tipo de documento", f"[bold]{dt.name}[/bold]")
    table.add_row("Título", brief.title)
    table.add_row("Idioma", brief.language)
    table.add_row("Formato", fmt.to_prompt())
    table.add_row("Requiere Excel", "Sí" if brief.needs_budget_excel else "No")
    console.print(Panel(table, title="[bold]BRIEF DEL ENTREGABLE[/bold]", border_style="cyan"))

    if brief.personas:
        console.print("\n[bold cyan]Perfiles de experto:[/bold cyan]")
        for p in brief.personas:
            console.print(f"  [cyan]•[/cyan] {p}")
    if brief.sections:
        console.print("\n[bold]Secciones a producir:[/bold]")
        console.print("  " + " · ".join(brief.sections))
    if brief.national_guidelines or brief.international_guidelines:
        console.print("\n[bold yellow]Lineamientos a cumplir:[/bold yellow]")
        for g in (brief.national_guidelines + brief.international_guidelines):
            console.print(f"  [yellow]›[/yellow] {g}")
    console.print()


def _go_badge(decision: str) -> str:
    if decision == "GO":
        return "[bold green on dark_green] GO — VIABLE [/bold green on dark_green]"
    elif decision == "NO-GO":
        return "[bold white on red] NO-GO — NO VIABLE [/bold white on red]"
    return "[bold yellow] CONDICIONAL [/bold yellow]"


def review_report(review, cycle: int):
    approved_text = (
        "[bold green]APROBADA[/bold green]"
        if review.approved
        else "[bold red]REQUIERE CORRECCIONES[/bold red]"
    )

    table = Table(box=box.SIMPLE, show_header=True, padding=(0, 1))
    table.add_column("Criterio", style="bold", width=42)
    table.add_column("Puntaje", width=12)
    table.add_column("≥90")

    for name, score in review.scores_by_criterion().items():
        color = "green" if score >= 90 else "yellow" if score >= 75 else "red"
        ok = "[green]✓[/green]" if score >= 90 else "[red]✗[/red]"
        table.add_row(name, f"[{color}]{score:.0f}/100[/{color}]", ok)

    overall_color = "green" if review.overall_score >= 90 else "yellow" if review.overall_score >= 75 else "red"

    console.print(Panel(
        table,
        title=f"[bold]REVISIÓN CICLO {cycle}  —  {approved_text}  —  "
              f"[{overall_color}]{review.overall_score:.0f}/100[/{overall_color}][/bold]",
        border_style="green" if review.approved else "red"
    ))

    if review.critical_issues:
        console.print("\n[bold red]Problemas críticos:[/bold red]")
        for issue in review.critical_issues:
            console.print(f"  [red]✗[/red] {issue}")

    if review.corrections:
        console.print("\n[bold yellow]Correcciones requeridas:[/bold yellow]")
        for i, c in enumerate(review.corrections, 1):
            console.print(f"  [yellow]{i}.[/yellow] {c}")

    if review.strengths:
        console.print("\n[bold green]Aspectos positivos:[/bold green]")
        for s in review.strengths:
            console.print(f"  [green]✓[/green] {s}")

    console.print()


def no_go(analysis):
    console.print(Panel(
        f"[bold red]PROYECTO NO VIABLE[/bold red]\n\n"
        f"Score de viabilidad: [red]{analysis.viability_score:.0f}/100[/red]\n\n"
        f"{analysis.recommendations}",
        border_style="red",
        title="NO-GO"
    ))


def approved_banner(output_path: str):
    console.print()
    console.print(Panel(
        "[bold green]PROPUESTA APROBADA Y LISTA PARA ENVIAR[/bold green]\n\n"
        f"[dim]Archivos guardados en:[/dim]\n[cyan]{output_path}[/cyan]",
        border_style="green",
        padding=(1, 4)
    ))
    console.print()


def max_cycles_warning(output_path: str):
    console.print()
    console.print(Panel(
        "[bold yellow]CICLOS MÁXIMOS ALCANZADOS[/bold yellow]\n\n"
        "Se guardó la mejor versión disponible.\n"
        "Revisa las correcciones pendientes antes de enviar.\n\n"
        f"[dim]Archivos en:[/dim]\n[cyan]{output_path}[/cyan]",
        border_style="yellow",
        padding=(1, 4)
    ))
    console.print()


def setup_guide():
    console.print(Panel(
        "[bold red]API KEY NO CONFIGURADA[/bold red]\n\n"
        "Para usar este sistema necesitas una clave de Anthropic (Claude):\n\n"
        "[bold]Paso 1:[/bold] Ve a [cyan]https://console.anthropic.com/[/cyan]\n"
        "[bold]Paso 2:[/bold] Crea una cuenta y genera una API Key\n"
        "[bold]Paso 3:[/bold] Copia el archivo [yellow].env.example[/yellow] como [yellow].env[/yellow]\n"
        "[bold]Paso 4:[/bold] Pega tu clave en el archivo .env\n"
        "[bold]Paso 5:[/bold] Ejecuta [green]python main.py[/green] nuevamente\n\n"
        "[dim]Nota: El costo aproximado por propuesta generada es de $0.10 - $0.50 USD[/dim]",
        border_style="red",
        title="CONFIGURACIÓN REQUERIDA",
        padding=(1, 4)
    ))
