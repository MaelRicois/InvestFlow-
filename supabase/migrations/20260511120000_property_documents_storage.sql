-- Métadonnées des fichiers projets + bucket Storage privé.

create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),
  property_id bigint not null references public.properties (id) on delete cascade,
  user_id text not null,
  category text not null check (category in ('achat', 'technique', 'gestion')),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  unique (storage_path)
);

create index if not exists property_documents_property_id_idx
  on public.property_documents (property_id);

create index if not exists property_documents_property_category_idx
  on public.property_documents (property_id, category);

alter table public.property_documents enable row level security;

drop policy if exists "property_documents_select_own" on public.property_documents;
drop policy if exists "property_documents_insert_own" on public.property_documents;
drop policy if exists "property_documents_update_own" on public.property_documents;
drop policy if exists "property_documents_delete_own" on public.property_documents;

create policy "property_documents_select_own"
  on public.property_documents for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (auth.jwt()->>'sub')
    )
  );

create policy "property_documents_insert_own"
  on public.property_documents for insert
  with check (
    (auth.jwt()->>'sub') = user_id
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (auth.jwt()->>'sub')
    )
  );

create policy "property_documents_update_own"
  on public.property_documents for update
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (auth.jwt()->>'sub')
    )
  )
  with check (
    (auth.jwt()->>'sub') = user_id
    and exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (auth.jwt()->>'sub')
    )
  );

create policy "property_documents_delete_own"
  on public.property_documents for delete
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.user_id = (auth.jwt()->>'sub')
    )
  );

grant select, insert, update, delete on table public.property_documents to authenticated, anon;
grant all on table public.property_documents to postgres, service_role;

-- Bucket privé (accès via JWT + signed URLs)
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

-- Chemins : {user_id}/{property_id}/{category}/{uuid}_{nom_sanitisé}

drop policy if exists "project_documents_storage_select" on storage.objects;
drop policy if exists "project_documents_storage_insert" on storage.objects;
drop policy if exists "project_documents_storage_update" on storage.objects;
drop policy if exists "project_documents_storage_delete" on storage.objects;

create policy "project_documents_storage_select"
  on storage.objects for select
  to authenticated, anon
  using (
    bucket_id = 'project-documents'
    and split_part(name, '/', 1) = (auth.jwt()->>'sub')
    and exists (
      select 1 from public.properties p
      where p.id = split_part(name, '/', 2)::bigint
        and p.user_id = (auth.jwt()->>'sub')
    )
  );

create policy "project_documents_storage_insert"
  on storage.objects for insert
  to authenticated, anon
  with check (
    bucket_id = 'project-documents'
    and split_part(name, '/', 1) = (auth.jwt()->>'sub')
    and split_part(name, '/', 3) in ('achat', 'technique', 'gestion')
    and exists (
      select 1 from public.properties p
      where p.id = split_part(name, '/', 2)::bigint
        and p.user_id = (auth.jwt()->>'sub')
    )
  );

create policy "project_documents_storage_update"
  on storage.objects for update
  to authenticated, anon
  using (
    bucket_id = 'project-documents'
    and split_part(name, '/', 1) = (auth.jwt()->>'sub')
    and exists (
      select 1 from public.properties p
      where p.id = split_part(name, '/', 2)::bigint
        and p.user_id = (auth.jwt()->>'sub')
    )
  )
  with check (
    bucket_id = 'project-documents'
    and split_part(name, '/', 1) = (auth.jwt()->>'sub')
  );

create policy "project_documents_storage_delete"
  on storage.objects for delete
  to authenticated, anon
  using (
    bucket_id = 'project-documents'
    and split_part(name, '/', 1) = (auth.jwt()->>'sub')
    and exists (
      select 1 from public.properties p
      where p.id = split_part(name, '/', 2)::bigint
        and p.user_id = (auth.jwt()->>'sub')
    )
  );
