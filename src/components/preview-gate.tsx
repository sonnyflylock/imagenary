"use client"

import { Lock } from "lucide-react"

/**
 * Wraps an image result — shows top 25% clearly, blurs the rest.
 * Includes upgrade CTA overlay on the blurred area.
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
    <div className="relative overflow-hidden rounded-lg border">
      {/* Full image rendered underneath */}
      <div className="relative">
        {children}
        {/* Blur overlay covering bottom 75% */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 25%, rgba(255,255,255,0.1) 30%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            maskImage: "linear-gradient(to bottom, transparent 25%, black 30%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 25%, black 30%)",
          }}
        />
        {/* CTA overlay centered in blurred area */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ top: "40%" }}>
          <div className="text-center bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border max-w-xs mx-4">
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
      </div>
    </div>
  )
}
