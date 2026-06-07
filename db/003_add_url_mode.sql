-- Migración 003: aceptar 'url' como input_mode.
alter table public.sessions drop constraint if exists sessions_input_mode_check;
alter table public.sessions
    add constraint sessions_input_mode_check
    check (input_mode in ('search','text','file','url'));
