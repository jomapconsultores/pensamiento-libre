-- Índices faltantes en created_at para consultas ORDER BY created_at desc
-- Mirroring el patrón existente de donations/contact_messages (ver 20260606_initial.sql)

create index if not exists memberships_created_idx on public.memberships (created_at desc);
create index if not exists service_payments_created_idx on public.service_payments (created_at desc);
create index if not exists newsletter_subscribers_created_idx on public.newsletter_subscribers (created_at desc);
