# -*- coding: utf-8 -*-
"""Diagrama de flujo del sistema agente_map (flujo por fases con gates ≥90)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

CLAUDE   = "#1F3A5F"   # Claude (clasifica + veredicto final)
DEEPSEEK = "#0E7C6B"   # DeepSeek (investiga / revisa redacción)
MISTRAL  = "#C2571A"   # Mistral (redacta / revisa investigación)
CODESTRAL= "#6A3FA0"   # Codestral (financiero)
VERDE    = "#1B5E20"   # salida / aprobado
ROJO     = "#9A2A2A"   # gate <90 -> vuelve al inicio
GRIS     = "#5B6470"

fig, ax = plt.subplots(figsize=(13, 18))
ax.set_xlim(0, 100); ax.set_ylim(0, 158); ax.axis("off")
fig.patch.set_facecolor("white")

def box(x, y, w, h, text, color, tc="white", fs=10.5, bold=True):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6,rounding_size=2.2",
                 linewidth=1.6, edgecolor=color, facecolor=color))
    ax.text(x+w/2, y+h/2, text, ha="center", va="center", color=tc,
            fontsize=fs, fontweight="bold" if bold else "normal")

def gate(x, y, w, h, text, fs=9.5):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=2",
                 linewidth=1.8, edgecolor=ROJO, facecolor="white"))
    ax.text(x+w/2, y+h/2, text, ha="center", va="center", color=ROJO,
            fontsize=fs, fontweight="bold")

def arrow(x1, y1, x2, y2, color="#333", lw=2.2, ls="-"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>",
                 mutation_scale=20, linewidth=lw, color=color, linestyle=ls))

def lab(x, y, t, color="#333", fs=9, ha="center", bold=False, style="normal"):
    ax.text(x, y, t, ha=ha, va="center", color=color, fontsize=fs,
            fontweight="bold" if bold else "normal", style=style)

# Título
ax.text(50, 155, "agente_map · Flujo por fases con control de calidad 90/100",
        ha="center", fontsize=18, fontweight="bold", color=CLAUDE)
ax.text(50, 151.5, "Cada fase la produce una IA y la AUDITA otra distinta · si una fase no llega a 90/100, VUELVE AL INICIO (hasta 5 intentos)",
        ha="center", fontsize=10.5, color=GRIS, style="italic")

# ENTRADA
box(33, 143, 34, 6, "Usuario → POST /propuestas\n(texto · archivo · URL · búsqueda)", GRIS, fs=10.5)
arrow(50, 143, 50, 137)

# FASE 0 — Claude clasifica
box(28, 130, 44, 6.5, "FASE 0 · CLASIFICACIÓN — Claude\nDetecta el tipo de documento", CLAUDE, fs=10)
arrow(50, 130, 50, 123.5)

# Punto de REINICIO (ancla a la izquierda)
lab(4, 119, "◀ VUELVE\nAL INICIO", color=ROJO, fs=9, ha="left", bold=True)

# FASE 1 — DeepSeek investiga + busca web
box(20, 115, 60, 8,
    "FASE 1 · INVESTIGACIÓN — DeepSeek\nBusca en web (DuckDuckGo, gratis) · lee bases · viabilidad · fuentes reales",
    DEEPSEEK, fs=10)
arrow(50, 115, 50, 109)
# corte por no viable
arrow(80, 119, 90, 119, color=ROJO, lw=1.6, ls=(0,(4,3)))
lab(92, 116.5, "no viable\n→ detiene", color=ROJO, fs=8, ha="left")

# GATE 1 — Mistral revisa la investigación
gate(28, 101.5, 44, 6.5, "GATE 1 · revisa MISTRAL  ·  ¿investigación ≥ 90/100?")
arrow(50, 101.5, 50, 95.5, color=VERDE)
lab(58, 98.5, "✓ ≥90", color=VERDE, fs=9, bold=True)
# fallo gate1 -> inicio
arrow(28, 104.7, 8, 104.7, color=ROJO, lw=2)
arrow(8, 104.7, 8, 119, color=ROJO, lw=2)
arrow(8, 119, 20, 119, color=ROJO, lw=2)
lab(17, 107.5, "<90", color=ROJO, fs=8.5, bold=True)

# FASE 2 — DeepSeek redacta (económico)
box(20, 87, 60, 7.5, "FASE 2 · REDACCIÓN — DeepSeek\nEscribe el documento completo (secciones, formato, lineamientos)",
    DEEPSEEK, fs=10)
arrow(50, 87, 50, 81)

# GATE 2 — Mistral revisa la redacción
gate(28, 73.5, 44, 6.5, "GATE 2 · revisa MISTRAL  ·  ¿redacción ≥ 90/100?")
arrow(50, 73.5, 50, 67.5, color=VERDE)
lab(58, 70.5, "✓ ≥90", color=VERDE, fs=9, bold=True)
# fallo gate2 -> inicio
arrow(28, 76.7, 8, 76.7, color=ROJO, lw=2)
arrow(8, 76.7, 8, 119, color=ROJO, lw=2)
lab(11.5, 96, "reinvestiga\n(otro intento)", color=ROJO, fs=8, ha="left", style="italic")

# FASE 3 — Codestral financiero
box(24, 59, 52, 7, "FASE 3 · FINANCIERO — Codestral\nPresupuesto · marco lógico · cronograma (si aplica)",
    CODESTRAL, fs=10)
arrow(50, 59, 50, 53)

# FASE 4 — Claude veredicto final 90/90
box(24, 44.5, 52, 8,
    "FASE 4 · VEREDICTO FINAL — Claude\nRegla 90/90: cada criterio ≥90 Y global ≥90", CLAUDE, fs=10.5)
# rechazo final -> inicio
arrow(24, 48.5, 8, 48.5, color=ROJO, lw=2.2)
arrow(8, 48.5, 8, 119, color=ROJO, lw=2.2)
lab(13, 44, "RECHAZA\n→ vuelve al inicio", color=ROJO, fs=8.5, ha="left", bold=True)
arrow(50, 44.5, 50, 38, color=VERDE, lw=2.4)
lab(60, 41, "APRUEBA ✓", color=VERDE, fs=10, bold=True)

# SALIDA
box(10, 31, 38, 6.5, "Guarda en Supabase\n(estado: aprobado)", VERDE, fs=9.5)
box(52, 31, 38, 6.5, "Genera Word (.docx) + Excel (.xlsx)\non-demand para descarga", VERDE, fs=9.5)
arrow(50, 38, 29, 37.5); arrow(50, 38, 71, 37.5)

# Nota inconcluso
ax.add_patch(FancyBboxPatch((20, 23.5), 60, 5, boxstyle="round,pad=0.4,rounding_size=1.5",
             linewidth=1.4, edgecolor=ROJO, facecolor="#FBEDED"))
ax.text(50, 26, "Si tras 5 intentos ninguna versión llega a 90 → se entrega la MEJOR versión, marcada como «inconclusa».",
        ha="center", va="center", color=ROJO, fontsize=9.5, fontweight="bold")

# Leyenda
ax.text(50, 19, "Qué IA hace cada tarea", ha="center", fontsize=11, fontweight="bold", color=CLAUDE)
leg = [
    (CLAUDE,   "Claude — clasifica (Fase 0) y da el veredicto final 90/90 (Fase 4)"),
    (DEEPSEEK, "DeepSeek — investiga en web (Fase 1) y redacta el documento (Fase 2)"),
    (MISTRAL,  "Mistral — audita la investigación (Gate 1) y la redacción (Gate 2)"),
    (CODESTRAL,"Codestral — estructura presupuesto / marco lógico (Fase 3)"),
    (ROJO,     "Gate <90/100 → VUELVE AL INICIO (reinvestiga) · máx. 5 intentos"),
]
y = 15.5
for color, txt in leg:
    ax.add_patch(FancyBboxPatch((20, y-1.0), 3, 2, boxstyle="round,pad=0.1,rounding_size=0.6",
                 facecolor=color, edgecolor=color))
    ax.text(25, y, txt, ha="left", va="center", fontsize=9.3, color="#222")
    y -= 3.0

ax.text(50, -0.5, "Costo aprox. por propuesta: US$1–US$3 (sube con más reintentos) · Búsqueda web gratis · 19-jun-2026",
        ha="center", fontsize=9, color=GRIS, style="italic")

plt.tight_layout()
fig.savefig("FLUJO_VISUAL.png", dpi=160, bbox_inches="tight", facecolor="white")
print("OK -> FLUJO_VISUAL.png")
