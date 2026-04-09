-- Extension install tracking for anonymous ScreenScribe usage
-- Each unique install_id gets 10 lifetime free extractions

CREATE TABLE IF NOT EXISTS ext_installs (
  install_id  TEXT PRIMARY KEY,
  uses        INTEGER NOT NULL DEFAULT 0,
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip          TEXT
);

-- Index for cleanup/analytics queries
CREATE INDEX IF NOT EXISTS idx_ext_installs_last_used ON ext_installs (last_used);

-- RLS: only service role can access this table
ALTER TABLE ext_installs ENABLE ROW LEVEL SECURITY;

-- No policies = only service role key can read/write
