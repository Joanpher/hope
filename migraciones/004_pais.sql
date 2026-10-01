-- =============================================================================
--  Fundación Esperanza — Soporte multi-país
--  Archivo : migraciones/004_pais.sql
--  Uso     : Supabase → SQL Editor → pegar y ejecutar, DESPUÉS de 001 (y 002, 003).
--
--  NO destructivo: conserva todos los datos.
--
--  POR QUÉ
--  -------
--  La aplicación pasa a operar en varios países. Cada usuario elige su país al
--  registrarse (código ISO 3166-1 alfa-2, ver src/lib/countries.ts) y ese dato
--  queda disponible para el panel administrativo.
--
--  Los usuarios existentes (todos de República Dominicana hasta ahora) se
--  rellenan con 'DO' para no dejar la columna en null.
-- =============================================================================

begin;

alter table public.users
  add column if not exists country text not null default 'DO';

comment on column public.users.country is
  'Código ISO 3166-1 alfa-2 del país del usuario (ver src/lib/countries.ts). Todos los montos de aid_requests se interpretan en USD, sin importar el país.';

create index if not exists users_country_idx on public.users (country);

commit;


-- ─── Verificación ────────────────────────────────────────────────────────────
-- Todas las filas deben tener "country" no nulo.

select country, count(*) as usuarios
from public.users
group by country
order by country;
