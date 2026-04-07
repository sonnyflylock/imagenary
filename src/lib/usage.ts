/**
 * Usage tracking for freemium model.
 *
 * Free tier: 5 free uses per tool (25 total across all tools).
 * Paid: metered bundles — buy credits, spend them.
 *
 * For now, usage is tracked via cookies (anonymous).
 * When Stripe is wired up, usage moves to server-side per Stripe customer.
 */

import { cookies } from "next/headers"

const COOKIE_NAME = "imagenary_usage"
const FREE_USES_PER_TOOL = 5

export interface UsageData {
  extract: number
  refresh: number
  touchup: number
  generate: number
  credits: number // purchased credits remaining
}

function defaultUsage(): UsageData {
  return { extract: 0, refresh: 0, touchup: 0, generate: 0, credits: 0 }
}

export async function getUsage(): Promise<UsageData> {
  const jar = await cookies()
  const raw = jar.get(COOKIE_NAME)?.value
  if (!raw) return defaultUsage()
  try {
    return { ...defaultUsage(), ...JSON.parse(raw) }
  } catch {
    return defaultUsage()
  }
}

export async function checkAndIncrement(
  tool: keyof Omit<UsageData, "credits">
): Promise<{ allowed: boolean; remaining: number; usedFree: boolean }> {
  const usage = await getUsage()
  const used = usage[tool]

  // Has purchased credits
  if (usage.credits > 0) {
    usage.credits -= 1
    usage[tool] = used + 1
    await saveUsage(usage)
    return { allowed: true, remaining: usage.credits, usedFree: false }
  }

  // Free tier
  if (used < FREE_USES_PER_TOOL) {
    usage[tool] = used + 1
    await saveUsage(usage)
    const freeRemaining = FREE_USES_PER_TOOL - used - 1
    return { allowed: true, remaining: freeRemaining, usedFree: true }
  }

  return { allowed: false, remaining: 0, usedFree: false }
}

export async function addCredits(amount: number): Promise<UsageData> {
  const usage = await getUsage()
  usage.credits += amount
  await saveUsage(usage)
  return usage
}

async function saveUsage(data: UsageData) {
  const jar = await cookies()
  jar.set(COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  })
}
