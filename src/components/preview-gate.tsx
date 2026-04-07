"use client"

import { Lock } from "lucide-react"

/**
 * Wraps an image result and masks the bottom 75% when preview=true.
 * Shows a message that the full result has been emailed.
 */
export function PreviewGate({
  preview,
  previewNote,
  children,
}: {
  preview: boolean
  previewNote?: string
  children: React.ReactNode
}) {
  if (!preview) return <>{children}</>

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg border" style={{ maxHeight: "25%" }}>
        <div style={{ clipPath: "inset(0 0 75% 0)" }}>
          {children}
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-accent/20 bg-accent/5 p-4 text-center">
        <Lock className="size-5 mx-auto mb-2 text-accent" />
        <p className="text-sm font-medium">Preview only</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {previewNote || "Full result has been emailed to your account."}
        </p>
        <a
          href="/pricing"
          className="mt-3 inline-flex h-9 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Get credits for instant full results
        </a>
      </div>
    </div>
  )
}
