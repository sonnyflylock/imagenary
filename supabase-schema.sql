-- Run this in the Supabase SQL Editor for your imagenary project.
-- Creates a profiles table linked to Supabase Auth users.

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamptz default now(),

  -- Free usage counters (per tool)
  free_extract int default 0,
  free_refresh int default 0,
  free_touchup int default 0,
  free_generate int default 0,

  -- Purchased credits
  credits int default 0
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Service role needs insert access for the trigger
create policy "Service can insert profiles"
  on public.profiles for insert
  with check (true);
