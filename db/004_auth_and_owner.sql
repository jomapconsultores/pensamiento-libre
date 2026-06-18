-- =============================================================================
-- agente_map — migración 004: usuarios (auth propia) + dueño de cada sesión
--
-- Cómo aplicarlo:
--   1. Supabase → SQL Editor → New query
--   2. Pega este archivo y "Run".
--
-- Aditiva e idempotente (create ... if not exists / add column if not exists).
-- RLS activado sin políticas: solo service_role accede (igual que las demás).
-- =============================================================================

create extension if not exists "pgcrypto";

-- ── users ─────────────────────────────────────────────────────────────────
create table if not exists public.users (
    id             uuid primary key default gen_random_uuid(),
    email          text not null unique,
    name           text not null default '',
    password_hash  text not null,
    password_salt  text not null,
    role           text not null default 'user'
                     check (role in ('admin','user')),
    status         text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
    created_at     timestamptz not null default now(),
    last_login_at  timestamptz
);

create index if not exists users_email_idx  on public.users (email);
create index if not exists users_status_idx on public.users (status);

alter table public.users enable row level security;
-- Sin políticas: solo service_role (el backend) puede leer/escribir.

-- ── dueño de cada sesión ────────────────────────────────────────────────────
alter table public.sessions
    add column if not exists owner_user_id uuid references public.users(id) on delete set null;

create index if not exists sessions_owner_idx on public.sessions (owner_user_id);
