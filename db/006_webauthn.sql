-- Migración 006: credenciales WebAuthn / passkeys para autenticación biométrica
-- Aplica en Supabase → SQL Editor

create table if not exists public.webauthn_credentials (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    credential_id text not null unique,              -- base64url (desde el navegador)
    credential_public_key text not null,             -- base64-encoded CBOR COSE key
    sign_count bigint not null default 0,
    label text not null default 'biometric',          -- 'huella' | 'rostro' | 'biometric'
    created_at timestamptz not null default now()
);

create index if not exists idx_wacred_user on public.webauthn_credentials(user_id);
create index if not exists idx_wacred_cid  on public.webauthn_credentials(credential_id);
