-- Migration: credits (integer) → balance_cents (integer, in cents)
-- Also adds lifetime_uses for volume tier tracking.
-- Run this in the Supabase SQL Editor.

-- Add new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS balance_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_uses integer DEFAULT 0;

-- Migrate existing credits to balance_cents
-- Old model: 1 credit = 1 use at ~$0.25, so convert to 25 cents each
UPDATE public.profiles
  SET balance_cents = credits * 25
  WHERE credits > 0 AND (balance_cents IS NULL OR balance_cents = 0);
