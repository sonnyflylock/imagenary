"use client"

import { useState } from "react"
import { Loader2, Download, Check, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PreviewGate } from "@/components/preview-gate"
import { cn } from "@/lib/utils"

interface ResultCompareProps {
  original: string
  history: string[]
  currentIdx: number
  onSelect: (idx: number) => void
  loading?: boolean
  previewGated?: boolean
  previewNote?: string
  onTryAnother?: () => void
  /** Tool name passed to the save-to-photos API for description ("Image Refresh" etc.). */
  toolName?: string
  /** Whether the user has Google Photos connected. If false, the button prompts to connect. */
  photosConnected?: boolean
  connectNextPath?: string
}

export function ResultCompare({
  original,
  history,
  currentIdx,
  onSelect,
  loading,
  previewGated,
  previewNote,
  onTryAnother,
  toolName,
  photosConnected,
  connectNextPath,
}: ResultCompareProps) {
  const current = history[currentIdx]
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSaveToPhotos() {
    if (!current) return
    if (!photosConnected) {
      window.location.href = `/api/connect/google-photos?next=${encodeURIComponent(connectNextPath || "/app/settings")}`
      return
    }
    setSavingState("saving")
    setSaveError(null)
    try {
      const res = await fetch("/api/google-photos/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultUrl: current, toolName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSavingState("error")
        setSaveError(data.error || "Save failed")
        return
      }
      setSavingState("saved")
      setSavedUrl(data.productUrl || null)
    } catch (e) {
      setSavingState("error")
      setSaveError(e instanceof Error ? e.message : "Save failed")
    }
  }

  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original
          </div>
          <img src={original} alt="Original" className="w-full rounded-lg border" />
        </div>
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">
            Result
          </div>
          {loading ? (
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : current ? (
            <PreviewGate preview={!!previewGated} previewNote={previewNote}>
              <img src={current} alt="Result" className="w-full rounded-lg border" />
            </PreviewGate>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted text-center text-sm text-muted-foreground">
              Result will appear here
            </div>
          )}
        </div>
      </div>

      {history.length > 1 && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Versions
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  "size-16 overflow-hidden rounded-md border-2 transition-all",
                  i === currentIdx
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border hover:border-accent/60"
                )}
              >
                <img src={url} alt={`Version ${i + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {current && !previewGated && !loading && (
        <>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={current}
              download
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              <Download className="size-4" /> Download
            </a>
            <Button
              variant="outline"
              onClick={handleSaveToPhotos}
              disabled={savingState === "saving" || savingState === "saved"}
            >
              {savingState === "saving" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : savingState === "saved" ? (
                <>
                  <Check className="size-4" /> Saved to Photos
                </>
              ) : (
                <>
                  <ImageIcon className="size-4" />
                  {photosConnected ? "Save to Google Photos" : "Connect Google Photos"}
                </>
              )}
            </Button>
            {onTryAnother && (
              <Button variant="ghost" onClick={onTryAnother}>
                Start Over
              </Button>
            )}
          </div>
          {savingState === "saved" && savedUrl && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                View in Google Photos →
              </a>
            </p>
          )}
          {savingState === "error" && saveError && (
            <p className="mt-2 text-center text-xs text-destructive">{saveError}</p>
          )}
        </>
      )}
    </div>
  )
}
