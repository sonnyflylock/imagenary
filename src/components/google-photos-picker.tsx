"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Loader2, X, ImageIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PickerMediaItem {
  id: string
  mediaFile: {
    baseUrl: string
    mimeType: string
    filename?: string
  }
}

interface GooglePhotosPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (file: File) => void
  connectNextPath: string
}

export function GooglePhotosPicker({
  open,
  onClose,
  onSelect,
  connectNextPath,
}: GooglePhotosPickerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [pickerUri, setPickerUri] = useState<string | null>(null)
  const [pickerOpened, setPickerOpened] = useState(false)
  const [items, setItems] = useState<PickerMediaItem[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<number | null>(null)

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  sessionIdRef.current = sessionId

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current)
      pollTimer.current = null
    }
    setPolling(false)
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setSessionId(null)
    setPickerUri(null)
    setPickerOpened(false)
    setItems(null)
    setSelectedId(null)
    setError(null)
    setErrorCode(null)
  }, [stopPolling])

  // Create a session when the modal opens.
  useEffect(() => {
    if (!open) return
    reset()
    setLoading(true)
    fetch("/api/google-photos/picker/session", { method: "POST" })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Failed to start picker")
          setErrorCode(res.status)
          return
        }
        setSessionId(data.id)
        setPickerUri(data.pickerUri)
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to start picker"))
      .finally(() => setLoading(false))
    return () => {
      stopPolling()
    }
  }, [open, reset, stopPolling])

  // Cleanup: delete the session when the modal closes, if not already used.
  useEffect(() => {
    if (open) return
    if (sessionIdRef.current) {
      fetch(`/api/google-photos/picker/session/${sessionIdRef.current}`, { method: "DELETE" }).catch(() => {})
    }
  }, [open])

  const pollOnce = useCallback(async () => {
    const sid = sessionIdRef.current
    if (!sid) return
    try {
      const res = await fetch(`/api/google-photos/picker/session/${sid}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Polling failed")
        setErrorCode(res.status)
        stopPolling()
        return
      }
      if (data.items) {
        setItems(data.items as PickerMediaItem[])
        stopPolling()
        return
      }
      pollTimer.current = setTimeout(pollOnce, 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Polling failed")
      stopPolling()
    }
  }, [stopPolling])

  function handleOpenPicker() {
    if (!pickerUri) return
    window.open(pickerUri, "_blank", "noopener,noreferrer")
    setPickerOpened(true)
    setPolling(true)
    pollTimer.current = setTimeout(pollOnce, 1500)
  }

  async function handleUse() {
    if (!selectedId || !items) return
    const item = items.find((i) => i.id === selectedId)
    if (!item) return
    setDownloading(true)
    try {
      const res = await fetch("/api/google-photos/picker/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: item.mediaFile.baseUrl,
          filename: item.mediaFile.filename,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Download failed (${res.status})`)
        return
      }
      const blob = await res.blob()
      const filename = item.mediaFile.filename || "photo.jpg"
      const file = new File([blob], filename, { type: blob.type || item.mediaFile.mimeType || "image/jpeg" })
      onSelect(file)
      onClose()
    } finally {
      setDownloading(false)
    }
  }

  if (!open) return null

  const needsReconnect = errorCode === 401 || errorCode === 403

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ImageIcon className="size-5 text-rose-500" />
            Pick from Google Photos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : needsReconnect ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {errorCode === 401
                  ? "Your Google Photos connection has expired or been revoked. Reconnect to continue."
                  : "Imagenary doesn't have the right permissions for the Photos Picker. Reconnect and approve on Google's consent screen."}
              </p>
              {error && (
                <pre className="max-w-md whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-left text-[10px] text-muted-foreground/80">
                  {error.length > 300 ? error.slice(0, 300) + "..." : error}
                </pre>
              )}
              <a
                href={`/api/connect/google-photos?next=${encodeURIComponent(connectNextPath)}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Reconnect Google Photos
              </a>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : items ? (
            items.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No photos selected. <button onClick={reset} className="text-accent hover:underline">Try again</button>.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {items.map((it) => {
                  const isSelected = it.id === selectedId
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setSelectedId(it.id)}
                      className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/30"
                          : "border-transparent hover:border-accent/50"
                      }`}
                    >
                      <img
                        src={`${it.mediaFile.baseUrl}=w240-h240-c`}
                        alt={it.mediaFile.filename || "Picked photo"}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              {pickerOpened ? (
                <>
                  <Loader2 className="size-8 animate-spin text-accent" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Waiting for your selection…</p>
                    <p className="text-xs text-muted-foreground">
                      Pick photos in the Google Photos tab, then click <strong>Done</strong>. We'll detect your selection automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenPicker}
                    className="text-xs text-accent hover:underline"
                  >
                    Re-open Google Photos tab
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Google's picker opens in a new tab. Pick the photos you want, click <strong>Done</strong>, then return here.
                  </p>
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={handleOpenPicker}
                    disabled={!pickerUri}
                  >
                    <ExternalLink className="size-4" /> Open Google Photos
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {!needsReconnect && items && items.length > 0 && (
          <div className="flex items-center justify-between border-t bg-muted/40 px-5 py-3">
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Pick different photos
            </button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleUse}
                disabled={!selectedId || downloading}
              >
                {downloading ? <Loader2 className="size-4 animate-spin" /> : "Use This Photo"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
