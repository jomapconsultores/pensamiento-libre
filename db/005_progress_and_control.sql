-- =============================================================================
-- agente_map — migración 005: control de progreso y pausa del pipeline
--
-- Cómo aplicarlo:
--   1. Supabase → SQL Editor → New query
--   2. Pega este archivo y "Run".
--
-- Aditiva e idempotente (add column if not exists).
-- =============================================================================

-- Fase actual legible (e.g. "FASE 2 — Redacción · ciclo 1")
alter table public.sessions
    add column if not exists current_phase text default '';

-- Historial de pasos del pipeline: [{phase, label, icon, status, detail, ts}]
alter table public.sessions
    add column if not exists progress_steps jsonb default '[]'::jsonb;

-- Flag que el usuario activa desde la UI para que el pipeline se pause limpiamente
alter table public.sessions
    add column if not exists pause_requested boolean not null default false;
