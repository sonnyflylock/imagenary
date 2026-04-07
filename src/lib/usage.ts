/**
 * Usage tracking backed by Supabase profiles table.
 *
 * Free tier: 5 total free uses across all tools — results are previewed
 * (top 25% shown) and full results emailed.
 *
 * Paid: balance in cents, deducted at tiered rates:
 *   1–100 lifetime uses:   $0.20 (20 cents)
 *   101–1000:              $0.10 (10 cents)
 *   1001+:                 $0.05 (5 cents)
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

/** Returns cost in cents for the next use based on lifetime usage */
function costCentsForUse(lifetimeUses: number): number {
  if (lifetimeUses < 100) return 20
  if (lifetimeUses < 1000) return 10
  return 5
}

export interface UsageResult {
  allowed: boolean
  remaining: number       // balance in cents for paid, free uses left for free
  usedFree: boolean
  preview: boolean        // true = show 25% preview, email full result
  userEmail: string | null
  costCents?: number      // how much was charged (0 for free)
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
  const balanceCents = (profile.balance_cents as number) || 0
  const lifetimeUses = (profile.lifetime_uses as number) || 0

  // Total free uses across all tools
  const totalFreeUsed =
    (profile.free_extract as number) +
    (profile.free_refresh as number) +
    (profile.free_touchup as number) +
    (profile.free_generate as number)

  // Has balance — full result, no preview
  if (balanceCents > 0) {
    const cost = costCentsForUse(lifetimeUses)
    if (balanceCents >= cost) {
      await supabase
        .from("profiles")
        .update({
          [col]: toolUsed + 1,
          balance_cents: balanceCents - cost,
          lifetime_uses: lifetimeUses + 1,
        })
        .eq("id", user.id)
      return {
        allowed: true,
        remaining: balanceCents - cost,
        usedFree: false,
        preview: false,
        userEmail: user.email || null,
        costCents: cost,
      }
    }
    // Balance too low for current tier rate — still allow but flag
    // (edge case: user has 3 cents but tier costs 5)
  }

  // Free tier — 5 total uses, preview only
  if (totalFreeUsed < FREE_USES_TOTAL) {
    await supabase
      .from("profiles")
      .update({
        [col]: toolUsed + 1,
        lifetime_uses: lifetimeUses + 1,
      })
      .eq("id", user.id)
    return {
      allowed: true,
      remaining: FREE_USES_TOTAL - totalFreeUsed - 1,
      usedFree: true,
      preview: true,
      userEmail: user.email || null,
      costCents: 0,
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
  const balanceCents = (profile.balance_cents as number) || 0
  const lifetimeUses = (profile.lifetime_uses as number) || 0

  const totalFreeUsed =
    (profile.free_extract as number) +
    (profile.free_refresh as number) +
    (profile.free_touchup as number) +
    (profile.free_generate as number)

  if (balanceCents > 0) {
    const cost = costCentsForUse(lifetimeUses)
    if (balanceCents >= cost) {
      await supabase
        .from("profiles")
        .update({
          [col]: toolUsed + 1,
          balance_cents: balanceCents - cost,
          lifetime_uses: lifetimeUses + 1,
        })
        .eq("id", userId)
      return {
        allowed: true,
        remaining: balanceCents - cost,
        usedFree: false,
        preview: false,
        userEmail: profile.email || null,
        costCents: cost,
      }
    }
  }

  if (totalFreeUsed < FREE_USES_TOTAL) {
    await supabase
      .from("profiles")
      .update({
        [col]: toolUsed + 1,
        lifetime_uses: lifetimeUses + 1,
      })
      .eq("id", userId)
    return {
      allowed: true,
      remaining: FREE_USES_TOTAL - totalFreeUsed - 1,
      usedFree: true,
      preview: true,
      userEmail: profile.email || null,
      costCents: 0,
    }
  }

  return { allowed: false, remaining: 0, usedFree: false, preview: false, userEmail: null }
}

/**
 * Add balance (in cents) using the service role key (bypasses RLS).
 * Used by Stripe webhook which runs without a user session.
 */
export async function addBalance(userId: string, amountCents: number) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance_cents")
    .eq("id", userId)
    .single()

  const current = (profile?.balance_cents as number) || 0
  const { error } = await supabase
    .from("profiles")
    .update({ balance_cents: current + amountCents })
    .eq("id", userId)

  if (error) {
    console.error(`Failed to add balance for user ${userId}:`, error)
  }
}
