"use client"

import { useAuth } from "@/lib/auth-context"
import { Coins, Loader2 } from "lucide-react"

const FREE_USES_TOTAL = 5

export function NavActions() {
  const { user, isLoading, isRefreshing, logout } = useAuth()

  if (isLoading) return null

  if (user) {
    const freeUsed = user.freeExtract + user.freeRefresh + user.freeTouchup + user.freeGenerate
    const freeRemaining = Math.max(0, FREE_USES_TOTAL - freeUsed)
    const costCents = user.lifetimeUses < 100 ? 20 : user.lifetimeUses < 1000 ? 10 : 5
    const paidRemaining = Math.floor(user.balanceCents / costCents)
    const totalCredits = freeRemaining + paidRemaining

    return (
      <div className="flex items-center gap-3">
        {/* Credits badge */}
        <a
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium transition-colors hover:border-accent/50 hover:text-accent"
          title={
            paidRemaining > 0
              ? `${freeRemaining} free · ${paidRemaining} paid · click to top up`
              : `${freeRemaining} free uses left · click to top up`
          }
        >
          <Coins className="size-3.5 text-accent" />
          {isRefreshing ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className="tabular-nums">{totalCredits}</span>
          )}
          <span className="text-muted-foreground">credits</span>
        </a>

        {/* Account with email below */}
        <a
          href="/app/settings"
          className="inline-flex flex-col items-center leading-tight text-foreground hover:text-accent transition-colors"
        >
          <span className="text-sm font-medium">Account</span>
          <span className="text-[10px] text-muted-foreground/70">{user.email}</span>
        </a>

        {/* Sign out — text only */}
        <button
          onClick={() => logout()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out
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
