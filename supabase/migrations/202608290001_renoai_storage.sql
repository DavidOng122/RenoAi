create or replace function public.reno_request_owner()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce((current_setting('request.headers', true)::jsonb ->> 'x-reno-owner'), '');
$$;

create table if not exists public.reno_properties (
  owner_id text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

create table if not exists public.reno_requests (
  owner_id text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table public.reno_properties enable row level security;
alter table public.reno_requests enable row level security;

grant select, insert, update, delete on public.reno_properties to anon;
grant select, insert, update, delete on public.reno_requests to anon;

drop policy if exists "RenoAI owner access to properties" on public.reno_properties;
create policy "RenoAI owner access to properties"
on public.reno_properties for all to anon
using (owner_id = public.reno_request_owner())
with check (owner_id = public.reno_request_owner());

drop policy if exists "RenoAI owner access to requests" on public.reno_requests;
create policy "RenoAI owner access to requests"
on public.reno_requests for all to anon
using (owner_id = public.reno_request_owner())
with check (owner_id = public.reno_request_owner());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'repair-evidence',
  'repair-evidence',
  false,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "RenoAI owner uploads evidence" on storage.objects;
create policy "RenoAI owner uploads evidence"
on storage.objects for insert to anon
with check (
  bucket_id = 'repair-evidence'
  and split_part(name, '/', 1) = public.reno_request_owner()
);

drop policy if exists "RenoAI owner reads evidence" on storage.objects;
create policy "RenoAI owner reads evidence"
on storage.objects for select to anon
using (
  bucket_id = 'repair-evidence'
  and split_part(name, '/', 1) = public.reno_request_owner()
);

drop policy if exists "RenoAI owner deletes evidence" on storage.objects;
create policy "RenoAI owner deletes evidence"
on storage.objects for delete to anon
using (
  bucket_id = 'repair-evidence'
  and split_part(name, '/', 1) = public.reno_request_owner()
);
