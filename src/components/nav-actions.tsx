"use client"

import { useAuth } from "@/lib/auth-context"

const FREE_USES_PER_TOOL = 5
const TOOL_COUNT = 4

export function NavActions() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) return null

  if (user) {
    // Show total free uses remaining if no purchased credits
    const freeUsed = user.freeExtract + user.freeRefresh + user.freeTouchup + user.freeGenerate
    const totalFree = FREE_USES_PER_TOOL * TOOL_COUNT
    const freeRemaining = Math.max(0, totalFree - freeUsed)
    const displayCredits = user.credits > 0 ? `${user.credits} credits` : `${freeRemaining} free uses left`

    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {displayCredits}
        </span>
        <button
          onClick={() => logout()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out ({user.email})
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/signin"
        className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Sign In
      </a>
    </div>
  )
}
