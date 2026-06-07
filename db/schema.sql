-- =============================================================================
-- agente_map — esquema para guardar sesiones de propuestas
--
-- Cómo aplicarlo:
--   1. Abre https://supabase.com/dashboard/project/oxbbldnksxcxodcfljal/sql/new
--   2. Pega todo este archivo y haz clic en "Run".
--   3. Verifica con:   py test_supabase.py
--      (debe listar sessions, proposal_versions, reviews)
--
-- RLS está activado sin políticas: solo la clave service_role / secret puede
-- leer y escribir. Eso encaja con el agente CLI que corre en local.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ── sessions ────────────────────────────────────────────────────────────────
create table if not exists public.sessions (
    id                 uuid primary key default gen_random_uuid(),
    session_id         text not null unique,                  -- el id corto (8 chars) de ProjectSession
    user_input         text not null,
    input_mode         text not null check (input_mode in ('search','text','file')),
    doc_type_key       text not null,
    language           text not null default 'es',

    approved           boolean not null default false,
    current_cycle      int not null default 0,

    output_path        text,
    word_path          text,
    excel_path         text,

    template_text      text,                                  -- plantilla modelo opcional
    support_docs       jsonb not null default '[]'::jsonb,    -- [{name, text}]

    analysis           jsonb,                                 -- AnalysisResult serializado
    brief              jsonb,                                 -- DocumentBrief serializado
    financial          jsonb,                                 -- FinancialPackage serializado

    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create index if not exists sessions_created_at_idx on public.sessions (created_at desc);
create index if not exists sessions_doc_type_idx  on public.sessions (doc_type_key);

-- ── proposal_versions (borrador por ciclo) ─────────────────────────────────
create table if not exists public.proposal_versions (
    id          uuid primary key default gen_random_uuid(),
    session_id  uuid not null references public.sessions(id) on delete cascade,
    cycle       int  not null,
    content     text not null,
    char_count  int  generated always as (length(content)) stored,
    created_at  timestamptz not null default now(),
    unique (session_id, cycle)
);

create index if not exists proposal_versions_session_idx on public.proposal_versions (session_id);

-- ── reviews (una por ciclo) ────────────────────────────────────────────────
create table if not exists public.reviews (
    id                    uuid primary key default gen_random_uuid(),
    session_id            uuid not null references public.sessions(id) on delete cascade,
    cycle                 int  not null,
    approved              boolean not null,
    overall_score         numeric(5,2) not null,

    criterion_scores      jsonb not null default '{}'::jsonb,
    format_check          jsonb not null default '{}'::jsonb,
    strengths             jsonb not null default '[]'::jsonb,
    corrections           jsonb not null default '[]'::jsonb,
    critical_issues       jsonb not null default '[]'::jsonb,
    compliance_checklist  jsonb not null default '[]'::jsonb,
    failing_elements      jsonb not null default '[]'::jsonb,

    recommendation        text,
    created_at            timestamptz not null default now(),
    unique (session_id, cycle)
);

create index if not exists reviews_session_idx on public.reviews (session_id);

-- ── trigger: updated_at automático en sessions ────────────────────────────
create or replace function public._touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists sessions_touch_updated_at on public.sessions;
create trigger sessions_touch_updated_at
    before update on public.sessions
    for each row execute function public._touch_updated_at();

-- ── RLS: bloqueo total para anon/authenticated; service_role lo salta ─────
alter table public.sessions          enable row level security;
alter table public.proposal_versions enable row level security;
alter table public.reviews           enable row level security;
-- Sin políticas: nadie excepto service_role puede tocar estas tablas.
-- Si en el futuro expones esto vía web, añade aquí las policies que toquen.
