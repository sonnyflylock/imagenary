/**
 * Usage tracking backed by Supabase profiles table.
 *
 * Free tier: 5 total free uses across all tools — results are previewed
 * (top 25% shown, bottom blurred) and full results emailed.
 * Paid: credits — full results returned immediately.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerSupabase, getUser } from "./supabase-server"

const FREE_USES_TOTAL = 5

type Tool = "extract" | "refresh" | "touchup" | "generate" | "describe"

const TOOL_COL: Record<Tool, string> = {
  extract: "free_extract",
  refresh: "free_refresh",
  touchup: "free_touchup",
  generate: "free_generate",
  describe: "free_extract", // shares the extract column
}

export interface UsageResult {
  allowed: boolean
  remaining: number
  usedFree: boolean
  preview: boolean // true = show 25% preview, email full result
  userEmail: string | null
}

export async function checkAndIncrement(tool: Tool): Promise<UsageResult> {
  const user = await getUser()
  if (!user) {
    return { allowed: false, remaining: 0, usedFree: false, preview: false, userEmail: null }
  }

  const supabase = await createServerSupabase()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { allowed: false, remaining: 0, usedFree: false, preview: false, userEmail: null }
  }

  const col = TOOL_COL[tool]
  const toolUsed = profile[col] as number
  const credits = profile.credits as number

  // Total free uses across all tools
  const totalFreeUsed =
    (profile.free_extract as number) +
    (profile.free_refresh as number) +
    (profile.free_touchup as number) +
    (profile.free_generate as number)

  // Has purchased credits — full result, no preview
  if (credits > 0) {
    await supabase
      .from("profiles")
      .update({ [col]: toolUsed + 1, credits: credits - 1 })
      .eq("id", user.id)
    return {
      allowed: true,
      remaining: credits - 1,
      usedFree: false,
      preview: false,
      userEmail: user.email || null,
    }
  }

  // Free tier — 5 total uses, preview only
  if (totalFreeUsed < FREE_USES_TOTAL) {
    await supabase
      .from("profiles")
      .update({ [col]: toolUsed + 1 })
      .eq("id", user.id)
    return {
      allowed: true,
      remaining: FREE_USES_TOTAL - totalFreeUsed - 1,
      usedFree: true,
      preview: true,
      userEmail: user.email || null,
    }
  }

  return { allowed: false, remaining: 0, usedFree: false, preview: false, userEmail: null }
}

/**
 * Check usage for a known user ID (used by extension API where
 * auth is handled via Bearer token, not cookies).
 */
export async function checkAndIncrementForUser(userId: string, tool: Tool): Promise<UsageResult> {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (!profile) {
    return { allowed: false, remaining: 0, usedFree: false, preview: false, userEmail: null }
  }

  const col = TOOL_COL[tool]
  const toolUsed = profile[col] as number
  const credits = profile.credits as number

  const totalFreeUsed =
    (profile.free_extract as number) +
    (profile.free_refresh as number) +
    (profile.free_touchup as number) +
    (profile.free_generate as number)

  if (credits > 0) {
    await supabase
      .from("profiles")
      .update({ [col]: toolUsed + 1, credits: credits - 1 })
      .eq("id", userId)
    return {
      allowed: true,
      remaining: credits - 1,
      usedFree: false,
      preview: false,
      userEmail: profile.email || null,
    }
  }

  if (totalFreeUsed < FREE_USES_TOTAL) {
    await supabase
      .from("profiles")
      .update({ [col]: toolUsed + 1 })
      .eq("id", userId)
    return {
      allowed: true,
      remaining: FREE_USES_TOTAL - totalFreeUsed - 1,
      usedFree: true,
      preview: true,
      userEmail: profile.email || null,
    }
  }

  return { allowed: false, remaining: 0, usedFree: false, preview: false, userEmail: null }
}

/**
 * Add credits using the service role key (bypasses RLS).
 * Used by Stripe webhook which runs without a user session.
 */
export async function addCredits(userId: string, amount: number) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single()

  const current = (profile?.credits as number) || 0
  const { error } = await supabase
    .from("profiles")
    .update({ credits: current + amount })
    .eq("id", userId)

  if (error) {
    console.error(`Failed to add credits for user ${userId}:`, error)
  }
}
