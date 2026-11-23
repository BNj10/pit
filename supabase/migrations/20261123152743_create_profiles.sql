-- Portal accounts. The Administrator creates every user and profile directly in the
-- database (ADR 0001); the application only reads profiles.

create type public.portal_role as enum ('student', 'department-chair', 'dean');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.portal_role not null,
  -- Assigned by the university; students may sign in with it instead of their email.
  student_id text unique,
  created_at timestamptz not null default now(),
  constraint profiles_student_id_format
    check (student_id ~ '^[0-9]{2}-[0-9]{4}-[0-9]{3}$'),
  constraint profiles_student_id_matches_role
    check ((role = 'student') = (student_id is not null))
);

comment on table public.profiles is
  'Portal role and university identifiers for each auth user. Managed by the Administrator.';

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Resolves a student ID to the account email so the server can sign the student in
-- through Supabase Auth. Only the server's secret key may call it, so the browser
-- cannot use it to look up students' emails.
create function public.get_login_email(p_student_id text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.email
  from public.profiles as p
  join auth.users as u on u.id = p.id
  where p.student_id = p_student_id
    and p.role = 'student';
$$;

revoke execute on function public.get_login_email(text) from public, anon, authenticated;
grant execute on function public.get_login_email(text) to service_role;
