"use client"

import { useEffect } from "react"
import { Check } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function SuccessPage() {
  // Silently broadcast the current Supabase session to the ScreenScribe extension
  // via the same contract the /ext-auth page uses. Safe no-op if no extension is installed.
  useEffect(() => {
    async function handoff() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const detail = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          email: session.user.email,
          expires_at: session.expires_at,
        }
        window.dispatchEvent(new CustomEvent("imagenary-ext-token", { detail }))

        const el = document.createElement("div")
        el.id = "imagenary-ext-token"
        el.style.display = "none"
        el.dataset.token = JSON.stringify(detail)
        document.body.appendChild(el)
      } catch {}
    }
    handoff()
  }, [])

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-accent/10">
        <Check className="size-8 text-accent" />
      </div>
      <h1 className="text-2xl font-bold">Credits added!</h1>
      <p className="mt-3 text-muted-foreground">
        Your credits are ready to use across all Imagenary tools.
      </p>
      <a
        href="/app/refresh"
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-accent px-6 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Start using your credits
      </a>
    </div>
  )
}
