-- Profil investisseur (salaire annuel pour taux d'endettement sur le bilan patrimonial).

create table if not exists public.user_profiles (
  user_id text primary key,
  annual_salary numeric,
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;

create policy "user_profiles_select_own"
  on public.user_profiles for select
  using ((auth.jwt()->>'sub') = user_id);

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check ((auth.jwt()->>'sub') = user_id);

create policy "user_profiles_update_own"
  on public.user_profiles for update
  using ((auth.jwt()->>'sub') = user_id)
  with check ((auth.jwt()->>'sub') = user_id);

grant select, insert, update on table public.user_profiles to authenticated, anon;
grant all on table public.user_profiles to postgres, service_role;
