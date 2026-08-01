-- ============================================================================
-- 20260801_cuentas_admin.sql
-- Desarrollado por Marco Antonio Posligua San Martín
--
-- CUENTAS DEL PANEL ADMINISTRATIVO.
--
-- Hasta ahora el panel se protegía con una sola clave compartida en variables de
-- entorno (Basic Auth). Eso no permite saber quién hizo qué, ni que cada persona
-- —administradores, socios, funcionarios— tenga sus propios datos y su propia
-- clave, ni cambiarla sin tocar el despliegue.
--
-- Esta tabla da cuentas nominales. La clave compartida sigue funcionando como
-- arranque (para crear la primera cuenta) y puede retirarse después borrando
-- ADMIN_USERNAME / ADMIN_PASSWORD del entorno.
--
-- Idempotente. Aplicar en el editor SQL de Supabase.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id                     uuid primary key default gen_random_uuid(),
  email                  text not null unique,
  full_name              text not null default '',
  phone                  text,
  position               text,
  -- "salt:hash" PBKDF2-SHA256, calculado en la aplicación (src/lib/auth.ts).
  password_hash          text,
  role                   text not null default 'funcionario',   -- admin | socio | funcionario
  is_active              boolean not null default true,
  -- Clave temporal puesta por un administrador: obliga a cambiarla al entrar.
  must_change_password   boolean not null default false,
  temp_password_expires  timestamptz,
  password_updated_at    timestamptz,
  password_reset_by      uuid,
  last_login_at          timestamptz,
  created_at             timestamptz default now()
);

create index if not exists idx_admin_users_email on public.admin_users (lower(email));

-- Bitácora de cambios de clave (nunca guarda la clave, solo el hecho).
create table if not exists public.admin_password_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.admin_users(id) on delete cascade,
  action       text not null,               -- 'reset_admin' | 'self_change'
  executed_by  uuid,
  created_at   timestamptz default now()
);
create index if not exists idx_admin_password_log_user
  on public.admin_password_log (user_id, created_at desc);

-- La aplicación entra con la service_role key desde el servidor; el cliente
-- anónimo no debe ver nada de esto.
alter table public.admin_users        enable row level security;
alter table public.admin_password_log enable row level security;
