"use client"

import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Sign in to continue</h1>
        <p className="mt-3 text-muted-foreground">
          Create a free account to start using Imagenary tools. 5 free uses per tool included.
        </p>
        <a
          href="/signin"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-6 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Sign in <ArrowRight className="size-3" />
        </a>
      </div>
    )
  }

  return <>{children}</>
}
