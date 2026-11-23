-- Student ID login, and access rules for tables the baseline left open.

-- Resolves a student ID to the account email so the server can sign the student in
-- through Supabase Auth. Only the server's secret key may call it, so the browser
-- cannot use it to look up students' emails. The explicit revokes matter: default
-- privileges in this schema grant new functions to anon and authenticated.
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

-- Profiles are read by their owner only (existing policy). Students change
-- student_id through set_student_id(), which runs as its owner; nobody writes
-- profiles directly through the API.
revoke all on table public.profiles from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.profiles from authenticated;

-- Departments were writable by anyone with the publishable key.
alter table public.departments enable row level security;

create policy "Signed-in users can read departments"
  on public.departments
  for select
  to authenticated
  using (true);

revoke all on table public.departments from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.departments from authenticated;

-- Trigger function only; it never needs to be callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
