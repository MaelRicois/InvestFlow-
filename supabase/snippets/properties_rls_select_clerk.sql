-- À exécuter dans Supabase → SQL Editor si la lecture sur `properties` est bloquée
-- (après avoir branché Clerk comme fournisseur JWT tiers sur Supabase).
--
-- La table doit contenir au minimum : user_id (text), name, city, monthly_cashflow, net_yield, …
-- Voir la migration : supabase/migrations/20260419120000_properties_clerk_rls.sql

alter table public.properties enable row level security;

drop policy if exists "properties_select_own" on public.properties;

create policy "properties_select_own"
  on public.properties for select
  using ((auth.jwt()->>'sub') = user_id);
