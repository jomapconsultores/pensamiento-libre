-- Migración 002: estado de ejecución para sesiones lanzadas vía API.
-- status: pending | running | approved | failed
alter table public.sessions
    add column if not exists status        text not null default 'pending'
        check (status in ('pending','running','approved','failed')),
    add column if not exists error_message text,
    add column if not exists started_at    timestamptz,
    add column if not exists completed_at  timestamptz;

create index if not exists sessions_status_idx on public.sessions (status);

-- Sesiones ya guardadas desde la CLI (approved=true/false) se etiquetan retroactivamente.
update public.sessions
   set status = case when approved then 'approved' else 'failed' end
 where status = 'pending' and completed_at is null and current_cycle > 0;
