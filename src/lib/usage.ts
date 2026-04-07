/**
 * Usage tracking backed by Supabase profiles table.
 *
 * Free tier: 5 free uses per tool — results are previewed (top 25%)
 * and full results emailed to their verified account.
 * Paid: credits — full results returned immediately.
 */

import { createServerSupabase, getUser } from "./supabase-server"

const FREE_USES_PER_TOOL = 5

type Tool = "extract" | "refresh" | "touchup" | "generate"

const TOOL_COL: Record<Tool, string> = {
  extract: "free_extract",
  refresh: "free_refresh",
  touchup: "free_touchup",
  generate: "free_generate",
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
  const freeUsed = profile[col] as number
  const credits = profile.credits as number

  // Has purchased credits — full result, no preview
  if (credits > 0) {
    await supabase
      .from("profiles")
      .update({ [col]: freeUsed + 1, credits: credits - 1 })
      .eq("id", user.id)
    return {
      allowed: true,
      remaining: credits - 1,
      usedFree: false,
      preview: false,
      userEmail: user.email || null,
    }
  }

  // Free tier — preview only (top 25%), full result emailed
  if (freeUsed < FREE_USES_PER_TOOL) {
    await supabase
      .from("profiles")
      .update({ [col]: freeUsed + 1 })
      .eq("id", user.id)
    return {
      allowed: true,
      remaining: FREE_USES_PER_TOOL - freeUsed - 1,
      usedFree: true,
      preview: true,
      userEmail: user.email || null,
    }
  }

  return { allowed: false, remaining: 0, usedFree: false, preview: false, userEmail: null }
}

export async function addCredits(userId: string, amount: number) {
  const supabase = await createServerSupabase()
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single()

  const current = (profile?.credits as number) || 0
  await supabase
    .from("profiles")
    .update({ credits: current + amount })
    .eq("id", userId)
}
