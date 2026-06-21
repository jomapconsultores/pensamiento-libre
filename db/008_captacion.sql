-- Migración 008: tablas de captación activa, prospectos y clientes
-- Aplicar en Supabase SQL Editor (proyecto rzdpfhflkzwylaaplgml)

-- ── Prospectos (resultados de búsqueda de mercado) ─────────────────────────
create table if not exists public.prospectos (
    id                  uuid        primary key default gen_random_uuid(),
    prospecto_id        text        not null unique,
    owner_user_id       uuid        references public.users(id) on delete set null,
    producto            text        not null,
    nombre              text        not null,
    sector              text        not null default '',
    zona                text        not null default '',
    provincia           text        not null default '',
    zona_nivel          smallint    not null default 1,  -- 1=Cuenca ... 8=Nacional
    contacto_web        text        not null default '',
    contacto_email      text        not null default '',
    contacto_telefono   text        not null default '',
    fuente_publica      text        not null default '',  -- directorio/fuente de origen
    fuente_url          text        not null default '',
    relevancia          smallint    not null default 5,   -- 1-10
    razon               text        not null default '',
    estado              text        not null default 'nuevo',
        -- nuevo | contactado | interesado | no_interesado | cliente | descartado
    notas               text        not null default '',
    created_at          timestamptz not null default now()
);

create index if not exists idx_prosp_owner   on public.prospectos(owner_user_id);
create index if not exists idx_prosp_estado  on public.prospectos(estado);
create index if not exists idx_prosp_zona    on public.prospectos(zona_nivel);
create index if not exists idx_prosp_prod    on public.prospectos(producto);

-- ── Clientes (prospectos convertidos o ingresados manualmente) ─────────────
create table if not exists public.clientes (
    id                  uuid        primary key default gen_random_uuid(),
    cliente_id          text        not null unique,
    owner_user_id       uuid        references public.users(id) on delete set null,
    nombre              text        not null,
    sector              text        not null default '',
    zona                text        not null default '',
    contacto_web        text        not null default '',
    contacto_email      text        not null default '',
    contacto_telefono   text        not null default '',
    contacto_direccion  text        not null default '',
    origen              text        not null default 'manual',
        -- manual | prospeccion | importacion
    notas               text        not null default '',
    estado              text        not null default 'activo',
        -- activo | inactivo | bloqueado
    created_at          timestamptz not null default now()
);

create index if not exists idx_cli_owner  on public.clientes(owner_user_id);
create index if not exists idx_cli_estado on public.clientes(estado);
