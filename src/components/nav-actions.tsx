"use client"

import { useAuth } from "@/lib/auth-context"

export function NavActions() {
  const { user, logout } = useAuth()

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{user.credits} credits</span>
        <a
          href="/app/refresh"
          className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Tools
        </a>
        <button
          onClick={() => logout()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/signin"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign in
      </a>
      <a
        href="/signin"
        className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Try Free
      </a>
    </div>
  )
}
