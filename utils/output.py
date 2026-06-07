import json
from datetime import datetime
from pathlib import Path
from models.schemas import ProjectSession
from config import OUTPUT_DIR, GENERATE_WORD, GENERATE_EXCEL
from tools import document_builder


def _safe_name(text: str, max_len: int = 40) -> str:
    safe = "".join(c if c.isalnum() or c in " _-" else "_" for c in text)
    return safe[:max_len].strip().replace(" ", "_")


def save_session(session: ProjectSession) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    prefix = _safe_name(session.doc_type_key, 20)
    if session.analysis:
        prefix = _safe_name(session.analysis.funder.name, 20)
    title = (
        session.brief.title if session.brief
        else (session.analysis.project_title if session.analysis else "documento")
    )
    folder_name = f"{timestamp}_{prefix}_{_safe_name(title)}"
    folder = OUTPUT_DIR / folder_name
    folder.mkdir(parents=True, exist_ok=True)

    # Save analysis report (ruta propuesta) y brief universal
    if session.analysis:
        _save_analysis(folder, session)
    if session.brief:
        _save_brief(folder, session)

    # Save all proposal versions
    for i, proposal in enumerate(session.proposal_versions, 1):
        version_file = folder / f"propuesta_v{i}.md"
        version_file.write_text(proposal, encoding="utf-8")

    # Save all review results
    for review in session.review_results:
        _save_review(folder, review)

    # Save final proposal with prominent name
    if session.final_proposal:
        status = "APROBADA" if session.approved else "MEJOR_VERSION"
        final_file = folder / f"FINAL_{status}.md"
        final_file.write_text(session.final_proposal, encoding="utf-8")

        # Also save as .txt for universal compatibility
        txt_file = folder / f"FINAL_{status}.txt"
        txt_file.write_text(session.final_proposal, encoding="utf-8")

        # ── WORD + EXCEL VINCULADOS ───────────────────────────────────────
        _build_documents(folder, session, status)

    # Save session summary JSON
    _save_summary(folder, session)

    session.output_path = str(folder)

    # Persistencia opcional en Supabase (no rompe el guardado a disco si falla)
    _save_to_supabase(folder, session)

    return str(folder)


def _save_to_supabase(folder: Path, session: ProjectSession):
    try:
        from db import repository
    except ImportError:
        return
    if not repository.is_enabled():
        return
    try:
        session_uuid = repository.save_session(session)
        if session_uuid:
            (folder / "supabase_id.txt").write_text(session_uuid, encoding="utf-8")
    except repository.SupabaseSaveError as e:
        (folder / "ERROR_supabase.txt").write_text(str(e), encoding="utf-8")


def _build_documents(folder: Path, session: ProjectSession, status: str):
    """Genera el .docx (narrativa) y el .xlsx (cálculos) vinculados."""
    excel_name = f"CALCULOS_{status}.xlsx"
    word_name = f"PROPUESTA_{status}.docx"

    # Excel primero (para conocer el nombre que referenciará el Word)
    if GENERATE_EXCEL and session.financial and session.financial.budget_items:
        try:
            path = document_builder.build_excel(
                session.brief, session.financial, folder / excel_name
            )
            if path:
                session.excel_path = path
        except Exception as e:  # no romper el guardado por un fallo de Excel
            (folder / "ERROR_excel.txt").write_text(str(e), encoding="utf-8")

    if GENERATE_WORD:
        try:
            path = document_builder.build_word(
                session.final_proposal, session.brief, session.financial,
                excel_name if session.excel_path else "(no generado)",
                folder / word_name,
            )
            if path:
                session.word_path = path
        except Exception as e:
            (folder / "ERROR_word.txt").write_text(str(e), encoding="utf-8")


def _save_analysis(folder: Path, session: ProjectSession):
    a = session.analysis
    content = f"""# REPORTE DE ANÁLISIS DE VIABILIDAD
Generado: {datetime.now().strftime("%Y-%m-%d %H:%M")}

## Decisión: {a.go_no_go}

| Campo | Valor |
|-------|-------|
| Proyecto | {a.project_title} |
| Financiador | {a.funder.name} ({a.funder.type}) |
| URL | {a.funder.url} |
| Fecha límite | {a.funder.deadline} |
| Monto | {a.total_amount} |
| Duración | {a.duration_months} meses |
| Sector | {a.sector} |
| Idioma | {a.language} |
| Score Viabilidad | {a.viability_score:.0f}/100 |
| Probabilidad de ganar | {a.winning_probability:.0f}% |

## Alineación con Ecuador
- **Marco legal:** {a.ecuador_alignment.legal_framework}
- **Plan Nacional:** {a.ecuador_alignment.plan_nacional}
- **ODS:** {", ".join(a.ecuador_alignment.ods_aligned)}
- **Prioridad nacional:** {"Sí" if a.ecuador_alignment.national_priority else "No"}

## Fortalezas
{chr(10).join("- " + s for s in a.strengths)}

## Riesgos
{chr(10).join("- " + r for r in a.risks)}

## Factores Críticos de Éxito
{chr(10).join("- " + f for f in a.critical_success_factors)}

## Proyectos Comparables
{chr(10).join("- " + p for p in a.comparable_projects)}

## Diferenciadores
{chr(10).join("- " + d for d in a.differentiators)}

## Lineamientos Nacionales (Ecuador) a cumplir
{chr(10).join("- " + g for g in a.national_guidelines) if a.national_guidelines else "- (no especificados)"}

## Lineamientos Internacionales (Financiador) a cumplir
{chr(10).join("- " + g for g in a.international_guidelines) if a.international_guidelines else "- (no especificados)"}

## Requiere presupuesto en Excel
{"Sí — el financiador exige plantilla/Excel" if a.requires_excel else "No exigido (se genera igualmente para respaldo)"}

## Análisis Completo
{a.raw_analysis}

## Instrucciones para el Redactor
{a.recommendations}
"""
    (folder / "00_analisis.md").write_text(content, encoding="utf-8")


def _save_brief(folder: Path, session: ProjectSession):
    from models.doc_types import get_doc_type, FormatSpec
    b = session.brief
    dt = get_doc_type(b.doc_type_key)
    fmt = FormatSpec.from_dict(b.format_spec)
    content = f"""# BRIEF DEL ENTREGABLE
Generado: {datetime.now().strftime("%Y-%m-%d %H:%M")}

| Campo | Valor |
|-------|-------|
| Tipo de documento | {dt.name} (`{b.doc_type_key}`) |
| Título | {b.title} |
| Idioma | {b.language} |
| Requiere Excel | {"Sí" if b.needs_budget_excel else "No"} |

## Formato exigido
{fmt.to_prompt()}

## Perfiles de experto
{chr(10).join("- " + p for p in b.personas)}

## Secciones / estructura
{chr(10).join(f"{i+1}. {s}" for i, s in enumerate(b.sections))}

## Qué hay que hacer (instrucciones)
{b.instructions}

## Lineamientos Nacionales (Ecuador)
{chr(10).join("- " + g for g in b.national_guidelines) if b.national_guidelines else "- (no especificados)"}

## Lineamientos Internacionales / Organizacionales
{chr(10).join("- " + g for g in b.international_guidelines) if b.international_guidelines else "- (no especificados)"}

## Requisitos críticos
{chr(10).join("- " + r for r in b.key_requirements) if b.key_requirements else "- (según el tipo)"}

## Marcas de excelencia
{chr(10).join("- " + q for q in b.quality_markers) if b.quality_markers else "- (excelencia técnica y de estilo)"}

## Fuentes / referencias encontradas
{b.source_notes or "(usar fuentes reales del área)"}

## Criterios de evaluación (regla 90/90)
{chr(10).join("- " + c for c in b.evaluation_criteria)}
"""
    (folder / "00_brief.md").write_text(content, encoding="utf-8")


def _format_check_md(fc: dict) -> str:
    if not fc:
        return "- (no disponible)"
    base = (f"- Palabras: {fc.get('word_count', 0)} · Caracteres: {fc.get('char_count', 0)} "
            f"· Páginas estimadas: {fc.get('page_estimate', 0)} "
            f"· Dentro de límites: {'Sí' if fc.get('within_limits') else 'No'}")
    issues = fc.get("issues") or []
    if issues:
        base += "\n" + "\n".join("- ⚠ " + i for i in issues)
    return base


def _save_review(folder: Path, review):
    def _row(name, score):
        flag = "✅" if score >= 90 else "❌"
        return f"| {name} | {score:.0f}/100 | {flag} |"

    criteria_rows = "\n".join(
        _row(name, score) for name, score in review.scores_by_criterion().items()
    )

    content = f"""# REVISIÓN CICLO {review.cycle}
Resultado: {"APROBADA (90/90 cumplido)" if review.approved else "REQUIERE CORRECCIONES"}
Score General: {review.overall_score:.0f}/100  (umbral global y por elemento: 90)

## Puntajes por Criterio (regla 90/90)
| Criterio | Puntaje | ≥90 |
|----------|---------|-----|
{criteria_rows}

## Verificación de extensión (formato)
{_format_check_md(review.format_check)}

## Elementos por debajo del umbral (90)
{chr(10).join("- " + e for e in review.failing_elements) if review.failing_elements else "- Ninguno — todos los elementos ≥ 90"}

## Checklist de Cumplimiento Normativo
{chr(10).join("- " + c for c in review.compliance_checklist) if review.compliance_checklist else "- (sin checklist registrado)"}

## Fortalezas
{chr(10).join("- " + s for s in review.strengths)}

## Problemas Críticos
{chr(10).join("- " + c for c in review.critical_issues) if review.critical_issues else "- Ninguno"}

## Correcciones Requeridas
{chr(10).join(f"{i+1}. {c}" for i, c in enumerate(review.corrections)) if review.corrections else "- Ninguna (aprobada)"}

## Recomendación
{review.recommendation}
"""
    (folder / f"revision_ciclo_{review.cycle}.md").write_text(content, encoding="utf-8")


def _save_summary(folder: Path, session: ProjectSession):
    summary = {
        "session_id": session.session_id,
        "timestamp": datetime.now().isoformat(),
        "input_mode": session.input_mode,
        "approved": session.approved,
        "total_cycles": session.current_cycle,
        "final_score": session.review_results[-1].overall_score if session.review_results else None,
        "final_scores_by_criterion": (
            session.review_results[-1].scores_by_criterion() if session.review_results else None
        ),
        "failing_elements": (
            session.review_results[-1].failing_elements if session.review_results else None
        ),
        "doc_type": session.doc_type_key,
        "title": session.brief.title if session.brief else (
            session.analysis.project_title if session.analysis else None),
        "viability_score": session.analysis.viability_score if session.analysis else None,
        "winning_probability": session.analysis.winning_probability if session.analysis else None,
        "funder": session.analysis.funder.name if session.analysis else None,
        "requires_excel": session.brief.needs_budget_excel if session.brief else None,
        "format_check": session.review_results[-1].format_check if session.review_results else None,
        "word_file": session.word_path,
        "excel_file": session.excel_path,
    }
    (folder / "session_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
