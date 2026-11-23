-- Account setup after an email invite: the user chooses a password and, for students,
-- records their student ID. The portal stays closed until setup is complete.

alter table public.profiles
  add column account_setup_completed_at timestamptz;

comment on column public.profiles.account_setup_completed_at is
  'Set by complete_account_setup() once the invited user has a password (and, for students, a student ID).';

-- Accounts that existed before this flow already sign in normally.
update public.profiles
set account_setup_completed_at = now()
where account_setup_completed_at is null;

-- Students record their own ID once. Staff cannot set one. The messages are stable
-- codes the app maps to field errors.
create or replace function public.set_student_id(new_student_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_student_id text;
begin
  select role, student_id into v_role, v_student_id
  from public.profiles
  where id = auth.uid();

  if not found or v_role <> 'student' then
    raise exception 'student_id_not_allowed';
  end if;

  if v_student_id is not null then
    raise exception 'student_id_already_set';
  end if;

  update public.profiles
  set student_id = trim(new_student_id)
  where id = auth.uid();
exception
  when unique_violation then
    raise exception 'student_id_taken';
  when check_violation then
    raise exception 'student_id_invalid';
end;
$$;

-- Marks setup complete for the signed-in user. Students must have a student ID first.
create function public.complete_account_setup()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set account_setup_completed_at = coalesce(account_setup_completed_at, now())
  where id = auth.uid()
    and (role <> 'student' or student_id is not null);

  if not found then
    raise exception 'student_id_required';
  end if;
end;
$$;

-- Default privileges in this schema grant new functions to anon; only signed-in users may call these.
revoke execute on function public.set_student_id(text) from public, anon;
grant execute on function public.set_student_id(text) to authenticated, service_role;

revoke execute on function public.complete_account_setup() from public, anon;
grant execute on function public.complete_account_setup() to authenticated, service_role;
