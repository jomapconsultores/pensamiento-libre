-- Migración inicial Fundación Pensamiento Libre
-- Pegar este archivo completo en Supabase Dashboard → SQL Editor → New query → Run

-- Extensiones útiles
create extension if not exists "uuid-ossp";

-- =========================
-- 1. Mensajes de contacto
-- =========================
create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  topic text not null default 'general',
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_email_idx on public.contact_messages (email);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

-- =========================
-- 2. Donaciones
-- =========================
create table if not exists public.donations (
  id uuid primary key default uuid_generate_v4(),
  stripe_session_id text unique not null,
  stripe_customer_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  donor_email text,
  recurring boolean not null default false,
  status text not null default 'completed',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists donations_email_idx on public.donations (donor_email);
create index if not exists donations_created_idx on public.donations (created_at desc);

-- =========================
-- 3. Membresías
-- =========================
create table if not exists public.memberships (
  id uuid primary key default uuid_generate_v4(),
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  tier text not null,                         -- 'basic' | 'premium' | otro
  status text not null,                       -- active | canceled | past_due...
  member_email text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memberships_email_idx on public.memberships (member_email);
create index if not exists memberships_status_idx on public.memberships (status);

-- Trigger para auto-actualizar updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists memberships_updated_at on public.memberships;
create trigger memberships_updated_at
before update on public.memberships
for each row execute function public.set_updated_at();

-- =========================
-- 4. Newsletter
-- =========================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  source text default 'web',
  created_at timestamptz not null default now()
);

create index if not exists newsletter_email_idx on public.newsletter_subscribers (email);

-- =========================
-- 5. Pagos por servicios (talleres, consultas)
-- =========================
create table if not exists public.service_payments (
  id uuid primary key default uuid_generate_v4(),
  stripe_session_id text unique not null,
  stripe_customer_id text,
  service_id text not null,                   -- 'taller' | 'consulta'
  amount_cents integer not null,
  currency text not null default 'usd',
  buyer_email text,
  status text not null default 'completed',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists service_payments_email_idx on public.service_payments (buyer_email);
create index if not exists service_payments_service_idx on public.service_payments (service_id);

-- =========================
-- Row Level Security (RLS)
-- =========================
-- Activamos RLS en todas las tablas; las escrituras se hacen con service_role desde el servidor.
-- Cliente público (anon) NO puede leer ni escribir directamente.

alter table public.contact_messages enable row level security;
alter table public.donations enable row level security;
alter table public.memberships enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.service_payments enable row level security;

-- Política que sí permite insertar a anon en newsletter (suscripción pública desde el navegador)
drop policy if exists "anon puede suscribirse" on public.newsletter_subscribers;
create policy "anon puede suscribirse"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

-- (Opcional) si en el futuro creas usuarios admin, agrega políticas SELECT aquí.
