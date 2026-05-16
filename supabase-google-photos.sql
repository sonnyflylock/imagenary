-- Run this in the Supabase SQL Editor after the project is unpaused.
-- Creates a per-user store for Google Photos OAuth tokens.

create table public.user_google_tokens (
  user_id uuid references auth.users on delete cascade primary key,
  google_email text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text not null,
  imagenary_album_id text,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_google_tokens enable row level security;

-- Users can read their own connection status (but not the raw tokens via client).
-- The client-facing status endpoint reads through the server, never via supabase-js
-- directly, so we don't grant select on the whole row.
-- We still grant select so RLS scoping is set; the server uses service-role for writes.
create policy "Users can view own google tokens"
  on public.user_google_tokens for select
  using (auth.uid() = user_id);

create policy "Users can delete own google tokens"
  on public.user_google_tokens for delete
  using (auth.uid() = user_id);

-- Service-role (server) handles inserts/updates; no anon policies for those.
