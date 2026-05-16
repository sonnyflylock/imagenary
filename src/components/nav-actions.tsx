"use client"

import { useAuth } from "@/lib/auth-context"
import { Coins, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const FREE_USES_TOTAL = 5

export function NavActions() {
  const { user, isLoading, isRefreshing, logout } = useAuth()

  const freeUsed = user
    ? user.freeExtract + user.freeRefresh + user.freeTouchup + user.freeGenerate
    : 0
  const freeRemaining = Math.max(0, FREE_USES_TOTAL - freeUsed)
  const costCents = user
    ? (user.lifetimeUses < 100 ? 20 : user.lifetimeUses < 1000 ? 10 : 5)
    : 20
  const paidRemaining = user ? Math.floor(user.balanceCents / costCents) : 0
  const totalCredits = freeRemaining + paidRemaining

  // Flash the badge briefly when totalCredits changes so a decrement is noticeable.
  const prevCreditsRef = useRef<number | null>(null)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (prevCreditsRef.current === null) {
      prevCreditsRef.current = totalCredits
      return
    }
    if (prevCreditsRef.current !== totalCredits) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 1500)
      prevCreditsRef.current = totalCredits
      return () => clearTimeout(t)
    }
  }, [totalCredits])

  if (isLoading) return null

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {/* Credits badge */}
        <a
          href="/pricing"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-500 hover:border-accent/50 hover:text-accent",
            flash
              ? "border-accent/60 bg-accent/15 ring-2 ring-accent/40 text-accent"
              : "border-border bg-muted/40"
          )}
          title={
            paidRemaining > 0
              ? `${freeRemaining} free · ${paidRemaining} paid · click to top up`
              : `${freeRemaining} free uses left · click to top up`
          }
        >
          <Coins className="size-3.5 text-accent" />
          {isRefreshing ? (
            <Loader2 className="size-3 animate-spin text-accent" />
          ) : (
            <span className="tabular-nums">{totalCredits}</span>
          )}
          <span className={cn(flash ? "text-accent/80" : "text-muted-foreground")}>credits</span>
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
