"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

/**
 * This page is opened by the Chrome extension to grab the Supabase access token.
 * It reads the session from Supabase auth, then sends it back to the extension
 * via window.postMessage + a custom event that the extension's content script listens for.
 * Then it auto-closes.
 */
export default function ExtAuthPage() {
  const [status, setStatus] = useState("Connecting to your account...")

  useEffect(() => {
    async function getToken() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setStatus("Not signed in. Please sign in first, then try again.")
          // Redirect to sign-in after a moment
          setTimeout(() => {
            window.location.href = "/signin?next=/ext-auth"
          }, 1500)
          return
        }

        // Dispatch a custom event that the extension's content script can catch
        window.dispatchEvent(new CustomEvent("imagenary-ext-token", {
          detail: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            email: session.user.email,
            expires_at: session.expires_at,
          }
        }))

        // Also set it in a temporary DOM element the content script can read
        const el = document.createElement("div")
        el.id = "imagenary-ext-token"
        el.style.display = "none"
        el.dataset.token = JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          email: session.user.email,
          expires_at: session.expires_at,
        })
        document.body.appendChild(el)

        setStatus(`Signed in as ${session.user.email}. You can close this tab.`)

        // Auto-close after a short delay
        setTimeout(() => window.close(), 1500)
      } catch {
        setStatus("Something went wrong. Please try again.")
      }
    }
    getToken()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10">
          <svg viewBox="0 0 24 24" fill="none" className="size-6 text-accent" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold">Imagenary Extension</h1>
        <p className="mt-2 text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
