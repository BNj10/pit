-- Local development seed data runs after migrations on first start and db reset.
-- Synthetic fixture accounts only. Every account uses the password: Preview-Pass-2026

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new
)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
    'authenticated', 'authenticated', 'student.preview@pit-enroll.test',
    extensions.crypt('Preview-Pass-2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
    'authenticated', 'authenticated', 'chair.preview@pit-enroll.test',
    extensions.crypt('Preview-Pass-2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333',
    'authenticated', 'authenticated', 'dean.preview@pit-enroll.test',
    extensions.crypt('Preview-Pass-2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(),
  now(),
  now()
from auth.users as u
where u.email like '%.preview@pit-enroll.test';

insert into public.profiles (id, role, student_id)
values
  ('11111111-1111-4111-8111-111111111111', 'student', '99-0000-001'),
  ('22222222-2222-4222-8222-222222222222', 'department-chair', null),
  ('33333333-3333-4333-8333-333333333333', 'dean', null);
