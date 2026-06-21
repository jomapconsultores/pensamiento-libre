-- Migración 007: tabla de oficios y peticiones
-- Aplicar en Supabase SQL Editor (proyecto rzdpfhflkzwylaaplgml)

create table if not exists public.oficios (
    id             uuid        primary key default gen_random_uuid(),
    oficio_id      text        not null unique,
    owner_user_id  uuid        references public.users(id) on delete set null,
    entity         text        not null,
    doc_type       text        not null default 'peticion',
    subject        text        not null,
    requester_name text        not null,
    requester_id   text        not null default '',
    requester_role text        not null default '',
    requester_address text     not null default '',
    requester_phone   text     not null default '',
    request_detail text        not null,
    extra_legal    text        not null default '',
    extra_facts    text        not null default '',
    doc_number     text        not null default '',
    city           text        not null default 'Cuenca',
    content        text        not null default '',
    created_at     timestamptz not null default now()
);

create index if not exists idx_oficios_owner on public.oficios(owner_user_id);
create index if not exists idx_oficios_created on public.oficios(created_at desc);
