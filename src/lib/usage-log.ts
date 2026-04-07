/**
 * Logs tool usage to the usage_logs table.
 * Uses service role key so it works regardless of auth context.
 * Fire-and-forget — never blocks the response.
 */
import { createClient } from "@supabase/supabase-js"

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface UsageLogEntry {
  userId?: string | null
  userEmail?: string | null
  tool: string
  model?: string | null
  fileSize?: number | null
  fileType?: string | null
  success: boolean
  error?: string | null
  durationMs?: number | null
  creditsUsed?: number
  wasFree?: boolean
  wasPreview?: boolean
  ipAddress?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown>
}

export function logUsage(entry: UsageLogEntry) {
  // Fire and forget — don't await
  getServiceSupabase()
    .from("usage_logs")
    .insert({
      user_id: entry.userId || null,
      user_email: entry.userEmail || null,
      tool: entry.tool,
      model: entry.model || null,
      file_size: entry.fileSize || null,
      file_type: entry.fileType || null,
      success: entry.success,
      error: entry.error || null,
      duration_ms: entry.durationMs || null,
      credits_used: entry.creditsUsed || 0,
      was_free: entry.wasFree || false,
      was_preview: entry.wasPreview || false,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      metadata: entry.metadata || {},
    })
    .then(({ error }) => {
      if (error) console.error("Failed to log usage:", error)
    })
}
