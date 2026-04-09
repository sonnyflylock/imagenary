-- Add extension-specific free extraction counter to profiles.
-- Separate from the web app's free_extract so extension sign-ups get their own 10.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ext_free_extract INTEGER NOT NULL DEFAULT 0;
