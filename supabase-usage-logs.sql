-- Usage logs table for tracking all tool usage
CREATE TABLE IF NOT EXISTS usage_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  tool text NOT NULL,          -- extract, describe, refresh, touchup, generate, imageurl
  model text,                  -- smart, fast, deep, standard, detailed, etc.
  file_size bigint,            -- bytes
  file_type text,              -- image/png, image/jpeg, etc.
  success boolean DEFAULT true,
  error text,
  duration_ms integer,         -- how long the operation took
  credits_used integer DEFAULT 0,
  was_free boolean DEFAULT false,
  was_preview boolean DEFAULT false,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'  -- any extra data
);

-- Index for querying by user
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);

-- Index for querying by tool
CREATE INDEX idx_usage_logs_tool ON usage_logs(tool);

-- Index for time-based queries
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- RLS: users can read their own logs, service role can write
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert logs"
  ON usage_logs FOR INSERT
  WITH CHECK (true);
