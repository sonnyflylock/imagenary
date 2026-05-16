-- Run this in the Supabase SQL Editor.
-- Persists each tool generation (input + output URLs + prompt) so users can
-- resume their session or browse a gallery.

create table public.tool_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tool text not null,           -- 'refresh' | 'touchup' | 'generate'
  prompt text,                  -- nullable (refresh has no prompt)
  input_url text not null,      -- our-hosted URL (i.imagenary.ai/...)
  output_url text not null,     -- our-hosted URL (i.imagenary.ai/...)
  metadata jsonb,               -- extra params (model variant, strength, etc.)
  created_at timestamptz default now()
);

create index tool_results_user_created_idx on public.tool_results (user_id, created_at desc);
create index tool_results_user_tool_idx on public.tool_results (user_id, tool, created_at desc);

alter table public.tool_results enable row level security;

create policy "Users can view own results"
  on public.tool_results for select
  using (auth.uid() = user_id);

create policy "Users can delete own results"
  on public.tool_results for delete
  using (auth.uid() = user_id);

-- Service role handles inserts (called from /api/image after a generation).
