"use client"

import { useAuth } from "@/lib/auth-context"

const FREE_USES_TOTAL = 5

export function NavActions() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) return null

  if (user) {
    const freeUsed = user.freeExtract + user.freeRefresh + user.freeTouchup + user.freeGenerate
    const freeRemaining = Math.max(0, FREE_USES_TOTAL - freeUsed)
    const displayCredits = user.credits > 0 ? `${user.credits} credits` : `${freeRemaining} free uses left`

    return (
      <div className="flex items-center gap-3">
        <a
          href="/pricing"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {displayCredits}
        </a>
        <button
          onClick={() => logout()}
          className="inline-flex flex-col items-center rounded-lg border border-border px-3 py-1.5 hover:bg-muted transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Sign Out</span>
          <span className="text-[10px] text-muted-foreground/70">{user.email}</span>
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
