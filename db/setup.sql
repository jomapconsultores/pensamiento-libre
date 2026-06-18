create extension if not exists pgcrypto;

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    name text,
    password_hash text not null,
    password_salt text not null,
    role text not null,
    status text not null,
    created_at timestamptz not null default now(),
    last_login_at timestamptz
);
create index if not exists users_email_idx on public.users (email);

create table if not exists public.sessions (
    id uuid primary key default gen_random_uuid(),
    session_id text not null unique,
    user_input text not null,
    input_mode text not null,
    doc_type_key text not null,
    language text,
    status text,
    approved boolean not null default false,
    current_cycle int not null default 0,
    error_message text,
    owner_user_id uuid references public.users(id) on delete set null,
    output_path text,
    word_path text,
    excel_path text,
    template_text text,
    support_docs jsonb,
    analysis jsonb,
    brief jsonb,
    financial jsonb,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists sessions_created_at_idx on public.sessions (created_at desc);
create index if not exists sessions_owner_idx on public.sessions (owner_user_id);

create table if not exists public.proposal_versions (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.sessions(id) on delete cascade,
    cycle int not null,
    content text not null,
    char_count int generated always as (length(content)) stored,
    created_at timestamptz not null default now(),
    unique (session_id, cycle)
);
create index if not exists proposal_versions_session_idx on public.proposal_versions (session_id);

create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.sessions(id) on delete cascade,
    cycle int not null,
    approved boolean not null,
    overall_score numeric,
    criterion_scores jsonb,
    format_check jsonb,
    strengths jsonb,
    corrections jsonb,
    critical_issues jsonb,
    compliance_checklist jsonb,
    failing_elements jsonb,
    recommendation text,
    created_at timestamptz not null default now(),
    unique (session_id, cycle)
);
create index if not exists reviews_session_idx on public.reviews (session_id);

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.proposal_versions enable row level security;
alter table public.reviews enable row level security;
