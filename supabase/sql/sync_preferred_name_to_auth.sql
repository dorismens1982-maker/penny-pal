-- One-time migration to sync preferred names from public.profiles
-- into auth.users raw_user_meta_data (preferred_name).
--
-- Usage: Run this in the Supabase SQL Editor once.
-- It is idempotent and only updates rows that need changes.

-- Preview (optional):
-- select u.id, u.email, p.preferred_name as profile_name,
--        u.raw_user_meta_data->>'preferred_name' as meta_name
-- from auth.users u
-- join public.profiles p on p.user_id = u.id
-- where p.preferred_name is not null
-- order by u.email;

update auth.users u
set raw_user_meta_data = jsonb_set(
  coalesce(u.raw_user_meta_data, '{}'::jsonb),
  '{preferred_name}',
  to_jsonb(p.preferred_name),
  true
)
from public.profiles p
where p.user_id = u.id
  and p.preferred_name is not null
  and (u.raw_user_meta_data->>'preferred_name' is distinct from p.preferred_name);

-- Verify (optional):
-- select u.id, u.email, u.raw_user_meta_data->>'preferred_name' as meta_name
-- from auth.users u
-- order by u.email;

