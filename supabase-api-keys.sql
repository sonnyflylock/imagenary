-- API keys table for programmatic access
-- Run this in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS api_keys (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash text NOT NULL,          -- SHA-256 hash of the key (we never store the raw key)
  key_prefix text NOT NULL,        -- first 8 chars for display (e.g. "imag_abc1...")
  name text DEFAULT 'Default',     -- user-given label
  created_at timestamptz DEFAULT now() NOT NULL,
  last_used_at timestamptz,
  revoked boolean DEFAULT false
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE NOT revoked;
CREATE INDEX idx_api_keys_user ON api_keys(user_id);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert keys"
  ON api_keys FOR INSERT
  WITH CHECK (true);
