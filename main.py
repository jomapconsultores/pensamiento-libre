"""
SISTEMA MULTIAGENTE DE PROPUESTAS DE FINANCIAMIENTO NO REEMBOLSABLE
Ecuador · Nacional e Internacional · CAF · BID · BM · UE · PNUD · GIZ · USAID

Flujo:
  Usuario → Agente 1 (Analista) → Agente 2 (Redactor) → Agente 3 (Revisor)
                                         ↑_____________________|  (ciclo hasta aprobar)
"""
import os
import sys
import uuid
from pathlib import Path

from config import ANTHROPIC_API_KEY, MAX_REVIEW_CYCLES
from models.schemas import ProjectSession
from models.doc_types import DOC_TYPES, get_doc_type, list_doc_types
from utils import display
from utils.output import save_session
from tools.file_reader import read_file, list_supported_files
import agents.analyst as analyst
import agents.classifier as classifier
import agents.writer as writer
import agents.reviewer as reviewer
import agents.financial as financial


# ── Startup check ─────────────────────────────────────────────────────────
def check_setup() -> str:
    key = ANTHROPIC_API_KEY or os.getenv("ANTHROPIC_API_KEY", "")
    if not key or key.startswith("sk-ant-XXXXX"):
        display.setup_guide()
        sys.exit(0)
    return key


# ── Input menu ────────────────────────────────────────────────────────────
def select_mode() -> tuple[str, str]:
    """Returns (mode, user_input)"""
    display.console.print("[bold cyan]¿Cómo deseas ingresar el proyecto?[/bold cyan]\n")
    display.console.print("  [bold yellow]1[/bold yellow]  Buscar oportunidades automáticamente (el agente busca)")
    display.console.print("  [bold yellow]2[/bold yellow]  Escribir/pegar idea o propuesta en consola")
    display.console.print("  [bold yellow]3[/bold yellow]  Cargar archivo (.txt, .docx, .pdf)")
    display.console.print("  [bold yellow]0[/bold yellow]  Salir\n")

    while True:
        choice = input("  Selecciona [1/2/3/0]: ").strip()

        if choice == "0":
            display.console.print("[dim]Hasta luego.[/dim]")
            sys.exit(0)

        elif choice == "1":
            display.console.print()
            display.console.print(
                "[dim]Describe el área o tema que te interesa "
                "(ej: 'educación rural', 'cambio climático', 'emprendimiento mujeres'):[/dim]"
            )
            topic = input("  Tema: ").strip()
            if not topic:
                topic = "desarrollo sostenible Ecuador"
            return "search", topic

        elif choice == "2":
            display.console.print()
            display.console.print(
                "[dim]Pega o escribe tu idea/propuesta. "
                "Cuando termines, escribe una línea con solo '---' y presiona Enter:[/dim]\n"
            )
            lines = []
            while True:
                line = input()
                if line.strip() == "---":
                    break
                lines.append(line)
            text = "\n".join(lines).strip()
            if not text:
                display.error("No ingresaste ningún texto. Intenta de nuevo.")
                continue
            return "text", text

        elif choice == "3":
            return _file_mode()

        else:
            display.error("Opción inválida. Escribe 1, 2, 3 o 0.")


def _file_mode() -> tuple[str, str]:
    display.console.print()
    files = list_supported_files(".")
    if files:
        display.console.print("[dim]Archivos disponibles en el directorio actual:[/dim]")
        for i, f in enumerate(files, 1):
            display.console.print(f"  [yellow]{i}.[/yellow] {f}")
        display.console.print()

    while True:
        path = input("  Ruta del archivo (o número de la lista): ").strip()
        if not path:
            display.error("Ingresa una ruta válida.")
            continue

        # If user entered a number from the list
        if path.isdigit() and files:
            idx = int(path) - 1
            if 0 <= idx < len(files):
                path = files[idx]
            else:
                display.error("Número fuera de rango.")
                continue

        try:
            content = read_file(path)
            display.success(f"Archivo cargado: {path} ({len(content):,} caracteres)")
            return "file", content
        except (FileNotFoundError, ValueError, ImportError) as e:
            display.error(str(e))


def _pick_file(prompt_label: str):
    """Selector de archivo reutilizable. Devuelve (nombre, texto) o None si se cancela."""
    files = list_supported_files(".")
    if files:
        display.console.print("[dim]Archivos disponibles en el directorio actual:[/dim]")
        for i, f in enumerate(files, 1):
            display.console.print(f"  [yellow]{i}.[/yellow] {f}")
    path = input(f"  {prompt_label} (ruta, número, o Enter para omitir): ").strip()
    if not path:
        return None
    if path.isdigit() and files:
        idx = int(path) - 1
        if 0 <= idx < len(files):
            path = files[idx]
        else:
            display.error("Número fuera de rango.")
            return None
    try:
        content = read_file(path)
        from pathlib import Path as _P
        display.success(f"Cargado: {path} ({len(content):,} caracteres)")
        return (_P(path).name, content)
    except (FileNotFoundError, ValueError, ImportError) as e:
        display.error(str(e))
        return None


def select_doc_type(user_input: str, template_text: str, support_docs: list, api_key: str) -> str:
    """Menú de tipo de documento con detección automática + override manual."""
    display.console.print("\n[bold cyan]¿Qué tipo de documento quieres generar?[/bold cyan]\n")
    display.console.print("  [bold yellow]0[/bold yellow]  Detección automática (recomendado)")
    types = list_doc_types()
    for i, dt in enumerate(types, 1):
        display.console.print(f"  [bold yellow]{i}[/bold yellow]  {dt.name} [dim]— {dt.description}[/dim]")

    choice = input("\n  Selecciona [0 para auto]: ").strip()

    if choice and choice.isdigit() and 1 <= int(choice) <= len(types):
        key = types[int(choice) - 1].key
        display.info(f"Tipo seleccionado: [bold]{get_doc_type(key).name}[/bold]")
        return key

    # Detección automática
    with display.spinner("Clasificando el tipo de documento solicitado"):
        try:
            key = classifier.detect_type(user_input, template_text, support_docs, api_key)
        except Exception as e:
            display.warning(f"No se pudo autodetectar ({e}). Usando 'generico'.")
            key = "generico"
    display.info(f"Tipo detectado: [bold]{get_doc_type(key).name}[/bold]")
    confirm = input("  Enter para confirmar, o número de la lista para cambiar: ").strip()
    if confirm.isdigit() and 1 <= int(confirm) <= len(types):
        key = types[int(confirm) - 1].key
        display.info(f"Cambiado a: [bold]{get_doc_type(key).name}[/bold]")
    return key


def load_optional_inputs() -> tuple[str, list]:
    """Plantilla modelo OPCIONAL + documentos de apoyo (varios)."""
    template_text = ""
    support_docs = []

    display.console.print(
        "\n[dim]Puedes subir una PLANTILLA/MODELO opcional a imitar (no es obligatorio).[/dim]"
    )
    if input("  ¿Subir plantilla modelo? [s/N]: ").strip().lower() in ("s", "si", "sí", "y"):
        picked = _pick_file("Plantilla modelo")
        if picked:
            template_text = picked[1]

    display.console.print(
        "\n[dim]Puedes subir DOCUMENTOS DE APOYO (material fuente). Añade los que quieras.[/dim]"
    )
    if input("  ¿Subir documentos de apoyo? [s/N]: ").strip().lower() in ("s", "si", "sí", "y"):
        while True:
            picked = _pick_file("Documento de apoyo")
            if picked:
                support_docs.append(picked)
            if input("  ¿Añadir otro documento de apoyo? [s/N]: ").strip().lower() not in ("s", "si", "sí", "y"):
                break

    return template_text, support_docs


# ── Main pipeline ─────────────────────────────────────────────────────────
def run_pipeline(api_key: str):
    display.banner()

    mode, user_input = select_mode()
    template_text, support_docs = load_optional_inputs()
    doc_type_key = select_doc_type(user_input, template_text, support_docs, api_key)

    session = ProjectSession(
        session_id=str(uuid.uuid4())[:8],
        user_input=user_input,
        input_mode=mode,
        doc_type_key=doc_type_key,
        template_text=template_text,
        support_docs=support_docs,
    )

    doc_type = get_doc_type(doc_type_key)

    # ── FASE 1: ANÁLISIS / BRIEF ──────────────────────────────────────────
    if doc_type.is_proposal:
        display.phase("FASE 1 — ANÁLISIS DE VIABILIDAD", "🔍")
        if mode == "search":
            display.info(f"Buscando oportunidades para: [bold]{user_input}[/bold]")
        else:
            display.info("Analizando propuesta/idea...")

        with display.spinner("Agente Analista trabajando (búsqueda profunda + análisis)"):
            try:
                result = analyst.run(session, api_key)
            except Exception as e:
                display.error(f"Error en el análisis: {e}")
                return

        session.analysis = result
        display.analysis_report(result)

        if not result.viable:
            display.no_go(result)
            return

        session.brief = classifier.analysis_to_brief(result, doc_type_key)
    else:
        display.phase(f"FASE 1 — DEFINICIÓN DEL ENTREGABLE ({doc_type.name})", "🔍")
        display.info("Clasificando, investigando formato/normativa y construyendo el brief...")
        with display.spinner("Agente Clasificador trabajando (búsqueda profunda + brief)"):
            try:
                session.brief = classifier.build_brief(session, doc_type_key, api_key)
            except Exception as e:
                display.error(f"Error construyendo el brief: {e}")
                return
        display.brief_report(session.brief)

    display.console.print("\n[bold green]Definición completa. Procediendo a redacción...[/bold green]")
    input("\n  Presiona Enter para continuar → ")

    # ── FASES 2+3: REDACCIÓN + REVISIÓN (ciclo) ───────────────────────────
    corrections = []
    final_proposal = ""
    approved = False

    for cycle in range(1, MAX_REVIEW_CYCLES + 1):
        session.current_cycle = cycle

        # Agent 2: Write
        display.phase(f"FASE 2.{cycle} — REDACCIÓN ({doc_type.name})", "✍️")
        if corrections:
            display.info(f"Aplicando {len(corrections)} correcciones del revisor...")
        else:
            display.info("Redactando el documento completo...")

        with display.spinner(f"Agente Redactor trabajando (ciclo {cycle})"):
            try:
                proposal = writer.run(session, corrections, api_key)
            except Exception as e:
                display.error(f"Error en redacción: {e}")
                break

        session.proposal_versions.append(proposal)
        final_proposal = proposal
        display.success(f"Propuesta redactada ({len(proposal):,} caracteres)")

        # Agent 3: Review
        display.phase(f"FASE 3.{cycle} — CONTROL DE CALIDAD", "🔬")
        display.info("Evaluando propuesta con máximo rigor...")

        with display.spinner(f"Agente Revisor evaluando (ciclo {cycle})"):
            try:
                review = reviewer.run(session, proposal, api_key)
            except Exception as e:
                display.error(f"Error en revisión: {e}")
                break

        session.review_results.append(review)
        display.review_report(review, cycle)

        if review.approved:
            approved = True
            display.success(
                f"[bold green]¡PROPUESTA APROBADA en ciclo {cycle}![/bold green] "
                f"Score: {review.overall_score:.0f}/100"
            )
            break

        corrections = review.corrections
        if cycle < MAX_REVIEW_CYCLES:
            display.warning(
                f"Ciclo {cycle} completado. Enviando {len(corrections)} correcciones al redactor..."
            )
        else:
            display.warning(
                f"Se alcanzaron los {MAX_REVIEW_CYCLES} ciclos máximos. "
                "Se guarda la mejor versión disponible."
            )

    # ── GUARDAR RESULTADOS ────────────────────────────────────────────────
    session.final_proposal = final_proposal
    session.approved = approved

    # ── FASE 4: ESTRUCTURACIÓN FINANCIERA (Word + Excel vinculados) ────────
    if session.brief and session.brief.needs_budget_excel:
        display.phase("FASE 4 — ESTRUCTURACIÓN FINANCIERA Y EXCEL VINCULADO", "📊")
        display.info("Este entregable requiere cálculos en Excel: estructurando presupuesto.")
        with display.spinner("Agente Financiero estructurando presupuesto y marco lógico"):
            try:
                session.financial = financial.run(session, final_proposal, api_key)
                display.success(
                    f"Estructurados {len(session.financial.budget_items)} rubros de presupuesto y "
                    f"{len(session.financial.logframe_rows)} filas de marco lógico."
                )
            except Exception as e:
                display.warning(f"No se pudo estructurar el Excel (se continúa sin cálculos): {e}")
                session.financial = None
    else:
        display.phase("FASE 4 — GENERACIÓN DE DOCUMENTOS", "📄")
        display.info("Este entregable no requiere Excel; se genera el Word con formato exigido.")

    display.phase("GUARDANDO RESULTADOS", "💾")
    with display.spinner("Guardando documentos (MD, TXT, Word, Excel)"):
        output_path = save_session(session)

    if approved:
        display.approved_banner(output_path)
    else:
        display.max_cycles_warning(output_path)

    _show_final_summary(session, output_path)


def _show_final_summary(session: ProjectSession, output_path: str):
    display.console.print("\n[bold]ARCHIVOS GENERADOS:[/bold]")
    for f in sorted(Path(output_path).iterdir()):
        size = f.stat().st_size
        tag = ""
        if f.suffix == ".docx":
            tag = "  [bold green]← WORD (propuesta)[/bold green]"
        elif f.suffix == ".xlsx":
            tag = "  [bold green]← EXCEL (cálculos vinculados)[/bold green]"
        display.console.print(f"  [cyan]{f.name}[/cyan]  [dim]({size:,} bytes)[/dim]{tag}")

    if session.review_results:
        last = session.review_results[-1]
        color = "green" if last.overall_score >= 90 else "yellow"
        display.console.print(
            f"\n[bold]Score final:[/bold] [{color}]{last.overall_score:.0f}/100[/{color}] "
            f"[dim](umbral 90 global y 90 por elemento)[/dim]"
        )
        if last.failing_elements:
            display.console.print("[yellow]  Elementos por debajo de 90:[/yellow]")
            for e in last.failing_elements:
                display.console.print(f"    [yellow]•[/yellow] {e}")

    display.console.print(
        f"\n[dim]Ciclos completados: {session.current_cycle}/{MAX_REVIEW_CYCLES}[/dim]"
    )
    display.console.print(f"[dim]Sesión ID: {session.session_id}[/dim]\n")


# ── Entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        api_key = check_setup()
        run_pipeline(api_key)
    except KeyboardInterrupt:
        display.console.print("\n\n[dim]Sesión interrumpida por el usuario.[/dim]\n")
        sys.exit(0)
