"use client"

import { useState } from "react"
import { Loader2, Download, Check, Image as ImageIcon, FolderDown, Smartphone, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PreviewGate } from "@/components/preview-gate"
import { ImageLightbox } from "@/components/image-lightbox"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import type { HistoryItem } from "@/lib/history-types"

interface ResultCompareProps {
  history: HistoryItem[]
  currentIdx: number  // -1 = show pendingInput, no result yet
  onSelect: (idx: number) => void
  /** Shown on the "Original" side when currentIdx === -1 (mid-generation or pre-generate). */
  pendingInput?: string
  loading?: boolean
  previewGated?: boolean
  previewNote?: string
  onTryAnother?: () => void
  onDeleteResult?: (id: string) => Promise<void> | void
  /** Tool name used for download filenames + Google Photos description. */
  toolName?: string
  /** Whether the user has Google Photos connected. If false, the button prompts to connect. */
  photosConnected?: boolean
  connectNextPath?: string
  /** Whether the user has a verified phone (for "Send to my phone" MMS). */
  phoneVerified?: boolean
}

interface FetchedBlob {
  blob: Blob
  ext: string
  filename: string
}

export function ResultCompare({
  history,
  currentIdx,
  onSelect,
  pendingInput,
  loading,
  previewGated,
  previewNote,
  onTryAnother,
  onDeleteResult,
  toolName,
  photosConnected,
  connectNextPath,
  phoneVerified,
}: ResultCompareProps) {
  const { refreshProfile } = useAuth()
  const currentItem = currentIdx >= 0 ? history[currentIdx] : null
  const displayInput = currentItem?.input_url || pendingInput || ""
  const current = currentItem?.output_url
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle")
  const [saveDeviceState, setSaveDeviceState] = useState<"idle" | "loading" | "saved" | "error">("idle")
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [phoneState, setPhoneState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [deleteState, setDeleteState] = useState<"idle" | "deleting">("idle")
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchAsBlob(url: string): Promise<FetchedBlob> {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
    const blob = await res.blob()
    const mime = blob.type || "image/png"
    const ext = (mime.split("/")[1] || "png").split(";")[0]
    const slug = (toolName || "imagenary").toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
    return { blob, ext, filename: `${slug}-${ts}.${ext}` }
  }

  function triggerBlobDownload(blob: Blob, filename: string) {
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  }

  async function handleDownload() {
    if (!current) return
    setDownloadState("loading")
    setError(null)
    try {
      const { blob, filename } = await fetchAsBlob(current)
      triggerBlobDownload(blob, filename)
      setDownloadState("idle")
    } catch (e) {
      setDownloadState("error")
      setError(e instanceof Error ? e.message : "Download failed")
    }
  }

  async function handleSaveToDevice() {
    if (!current) return
    setSaveDeviceState("loading")
    setError(null)
    try {
      const { blob, ext, filename } = await fetchAsBlob(current)
      const win = window as unknown as {
        showSaveFilePicker?: (opts: {
          suggestedName?: string
          types?: { description?: string; accept: Record<string, string[]> }[]
        }) => Promise<{
          createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>
        }>
      }
      if (typeof win.showSaveFilePicker === "function") {
        try {
          const handle = await win.showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "Image",
                accept: { [blob.type || "image/png"]: [`.${ext}`] },
              },
            ],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          setSaveDeviceState("saved")
          setTimeout(() => setSaveDeviceState("idle"), 2500)
        } catch (e) {
          if ((e as { name?: string })?.name === "AbortError") {
            setSaveDeviceState("idle")
            return
          }
          throw e
        }
      } else {
        // Firefox / Safari fallback — same as Download
        triggerBlobDownload(blob, filename)
        setSaveDeviceState("saved")
        setTimeout(() => setSaveDeviceState("idle"), 2500)
      }
    } catch (e) {
      setSaveDeviceState("error")
      setError(e instanceof Error ? e.message : "Save failed")
    }
  }

  async function handleSendToPhone() {
    if (!current) return
    if (!phoneVerified) {
      window.location.href = "/app/settings#phone"
      return
    }
    setPhoneState("sending")
    setError(null)
    try {
      const res = await fetch("/api/send-mms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultUrl: current, toolName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPhoneState("error")
        setError(data.error || "MMS send failed")
        return
      }
      setPhoneState("sent")
      refreshProfile()
      setTimeout(() => setPhoneState("idle"), 3000)
    } catch (e) {
      setPhoneState("error")
      setError(e instanceof Error ? e.message : "MMS send failed")
    }
  }

  async function handleDelete() {
    if (!currentItem?.id || !onDeleteResult) return
    if (!confirm("Delete this result? This can't be undone.")) return
    setDeleteState("deleting")
    try {
      await onDeleteResult(currentItem.id)
    } finally {
      setDeleteState("idle")
    }
  }

  async function handleSaveToPhotos() {
    if (!current) return
    if (!photosConnected) {
      window.location.href = `/api/connect/google-photos?next=${encodeURIComponent(connectNextPath || "/app/settings")}`
      return
    }
    setSavingState("saving")
    setError(null)
    try {
      const res = await fetch("/api/google-photos/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultUrl: current, toolName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSavingState("error")
        setError(data.error || "Save failed")
        return
      }
      setSavingState("saved")
      setSavedUrl(data.productUrl || null)
    } catch (e) {
      setSavingState("error")
      setError(e instanceof Error ? e.message : "Save failed")
    }
  }

  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original
          </div>
          {displayInput ? (
            <img
              src={displayInput}
              alt="Original"
              className="w-full cursor-zoom-in rounded-lg border transition-opacity hover:opacity-90"
              onClick={() => setLightboxSrc(displayInput)}
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted text-center text-sm text-muted-foreground">
              No image
            </div>
          )}
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
              <img
                src={current}
                alt="Result"
                className="w-full cursor-zoom-in rounded-lg border transition-opacity hover:opacity-90"
                onClick={() => setLightboxSrc(current)}
              />
            </PreviewGate>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted text-center text-sm text-muted-foreground">
              Result will appear here
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            History
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((item, i) => (
              <button
                key={(item.id || item.output_url) + i}
                type="button"
                onClick={() => onSelect(i)}
                title={item.prompt || undefined}
                className={cn(
                  "size-16 overflow-hidden rounded-md border-2 transition-all",
                  i === currentIdx
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border hover:border-accent/60"
                )}
              >
                <img src={item.output_url} alt={`Version ${i + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {current && !previewGated && !loading && (
        <>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="accent"
              onClick={handleDownload}
              disabled={downloadState === "loading"}
            >
              {downloadState === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Download className="size-4" /> Download
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveToDevice}
              disabled={saveDeviceState === "loading"}
            >
              {saveDeviceState === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : saveDeviceState === "saved" ? (
                <>
                  <Check className="size-4" /> Saved
                </>
              ) : (
                <>
                  <FolderDown className="size-4" /> Save to Device…
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendToPhone}
              disabled={phoneState === "sending" || phoneState === "sent"}
            >
              {phoneState === "sending" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : phoneState === "sent" ? (
                <>
                  <Check className="size-4" /> Sent
                </>
              ) : (
                <>
                  <Smartphone className="size-4" />
                  {phoneVerified ? (
                    <>
                      Send to my phone
                      <span className="ml-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        1 credit
                      </span>
                    </>
                  ) : (
                    "Verify phone to send"
                  )}
                </>
              )}
            </Button>
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
            {currentItem?.id && onDeleteResult && (
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteState === "deleting"}
                className="text-destructive hover:text-destructive"
              >
                {deleteState === "deleting" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="size-4" /> Delete
                  </>
                )}
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
          {error && (
            <p className="mt-2 text-center text-xs text-destructive">{error}</p>
          )}
        </>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  )
}
