"use client"

import { useAuth } from "@/lib/auth-context"

export function NavActions() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) return null

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Signed in as {user.email}
        </span>
        <span className="text-xs text-muted-foreground border-l pl-3">
          {user.credits} credits
        </span>
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
        className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Sign In
      </a>
    </div>
  )
}
