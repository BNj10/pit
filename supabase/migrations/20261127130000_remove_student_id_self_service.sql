-- Students no longer enter their own student ID during account setup. The ID is
-- recorded before the student is invited (by their Department Chair, see ADR 0003;
-- until that is built, by the Administrator), so drop the self-service function.
-- complete_account_setup() still refuses to finish a student without an ID.
drop function if exists public.set_student_id(text);
