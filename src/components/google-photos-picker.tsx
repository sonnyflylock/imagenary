"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, X, ImageIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MediaItem {
  id: string
  baseUrl: string
  mimeType: string
  filename: string
}

interface GooglePhotosPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (file: File) => void
  /** Where to send the user if they need to connect first. */
  connectNextPath: string
}

export function GooglePhotosPicker({
  open,
  onClose,
  onSelect,
  connectNextPath,
}: GooglePhotosPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const loadPage = useCallback(async (pageToken?: string) => {
    if (pageToken) setLoadingMore(true)
    else setLoading(true)
    setError(null)
    setErrorCode(null)
    try {
      const url = pageToken
        ? `/api/google-photos/media?pageToken=${encodeURIComponent(pageToken)}`
        : "/api/google-photos/media"
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to load photos")
        setErrorCode(res.status)
        return
      }
      setItems((prev) => (pageToken ? [...prev, ...(data.mediaItems || [])] : data.mediaItems || []))
      setNextPageToken(data.nextPageToken || null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load photos")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setItems([])
    setNextPageToken(null)
    setSelectedId(null)
    loadPage()
  }, [open, loadPage])

  async function handleUse() {
    if (!selectedId) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/google-photos/media/${selectedId}/download`)
      if (!res.ok) {
        setError(`Download failed (${res.status})`)
        return
      }
      const blob = await res.blob()
      const item = items.find((i) => i.id === selectedId)
      const filename = item?.filename || "photo.jpg"
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" })
      onSelect(file)
      onClose()
    } finally {
      setDownloading(false)
    }
  }

  if (!open) return null

  const isNotConnected = errorCode === 403

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl"
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
          ) : isNotConnected ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Connect Google Photos to pick from your library.
              </p>
              <a
                href={`/api/connect/google-photos?next=${encodeURIComponent(connectNextPath)}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Connect Google Photos
              </a>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No photos found in your Google Photos library.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
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
                        src={`${it.baseUrl}=w240-h240-c`}
                        alt={it.filename}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
              {nextPageToken && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPage(nextPageToken)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? <Loader2 className="size-4 animate-spin" /> : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {!isNotConnected && (
          <div className="flex items-center justify-between border-t bg-muted/40 px-5 py-3">
            <a
              href="https://photos.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Open Google Photos <ExternalLink className="size-3" />
            </a>
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
                {downloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Use This Photo"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
