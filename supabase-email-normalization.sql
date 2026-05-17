-- Run this in the Supabase SQL Editor.
-- Adds a canonical_email column to profiles so we can detect signups that
-- resolve to the same inbox (Gmail dot tricks, +aliases, case variants).

-- 1. Canonicalization function.
create or replace function public.canonical_email(email_addr text) returns text as $$
declare
  local_part text;
  domain text;
  at_pos int;
  plus_pos int;
begin
  if email_addr is null or email_addr = '' then
    return null;
  end if;
  at_pos := position('@' in email_addr);
  if at_pos = 0 then
    return lower(email_addr);
  end if;
  local_part := lower(substring(email_addr from 1 for at_pos - 1));
  domain := lower(substring(email_addr from at_pos + 1));
  -- Strip +alias suffix (most providers treat this as routing-only)
  plus_pos := position('+' in local_part);
  if plus_pos > 0 then
    local_part := substring(local_part from 1 for plus_pos - 1);
  end if;
  -- Gmail-specific: dots in local part are ignored; googlemail aliases to gmail
  if domain in ('gmail.com', 'googlemail.com') then
    local_part := replace(local_part, '.', '');
    domain := 'gmail.com';
  end if;
  return local_part || '@' || domain;
end;
$$ language plpgsql immutable;

-- 2. Add the column + index.
alter table public.profiles add column if not exists canonical_email text;
create index if not exists profiles_canonical_email_idx on public.profiles (canonical_email);

-- 3. Backfill existing rows.
update public.profiles
  set canonical_email = public.canonical_email(email)
  where canonical_email is null and email is not null;

-- 4. Update the new-user trigger to populate canonical_email going forward.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, canonical_email)
  values (new.id, new.email, public.canonical_email(new.email));
  return new;
end;
$$ language plpgsql security definer;
