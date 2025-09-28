-- User Profiles schema and policies

-- Enable required extensions (may already be enabled on Supabase)
create extension if not exists "pgcrypto";

-- 1) Table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preferred_name text,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- 2) RLS
alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Profiles select own'
  ) then
    create policy "Profiles select own" on public.profiles for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Profiles insert own'
  ) then
    create policy "Profiles insert own" on public.profiles for insert with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Profiles update own'
  ) then
    create policy "Profiles update own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- 3) Trigger to auto-create profile on signup using auth user metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, preferred_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_name', null)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Optional: backfill profiles for existing users
-- insert into public.profiles (user_id)
-- select id from auth.users
-- on conflict (user_id) do nothing;
