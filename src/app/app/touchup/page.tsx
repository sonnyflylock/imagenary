"use client"

import { useEffect, useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { ResultCompare } from "@/components/result-compare"
import { GooglePhotosPicker } from "@/components/google-photos-picker"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paintbrush, Loader2, LogIn, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { HistoryItem } from "@/lib/history-types"

export default function TouchUpApp() {
  const { user, refreshProfile } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [currentIdx, setCurrentIdx] = useState(-1)
  const [isPreview, setIsPreview] = useState(false)
  const [previewNote, setPreviewNote] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photosConnected, setPhotosConnected] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch("/api/results?tool=touchup&limit=50")
      .then((r) => r.json())
      .then((d) => {
        const items = (d.results as HistoryItem[] | undefined) || []
        if (items.length > 0) {
          const chronological = [...items].reverse()
          setHistory(chronological)
          setCurrentIdx(chronological.length - 1)
        }
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch("/api/connect/google-photos/status")
      .then((r) => r.json())
      .then((d) => setPhotosConnected(!!d.connected))
      .catch(() => {})
  }, [user])

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setCurrentIdx(-1)
    setIsPreview(false)
    setError(null)
  }

  function handleClear() {
    setFile(null)
    setPreview(null)
    setCurrentIdx(history.length > 0 ? history.length - 1 : -1)
    setIsPreview(false)
    setError(null)
    setPrompt("")
  }

  async function handleTouchUp() {
    if (!file || !prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tool", "touchup")
      formData.append("prompt", prompt)
      const res = await fetch("/api/image", { method: "POST", body: formData })
      const text = await res.text()
      let data: any
      try { data = JSON.parse(text) } catch { throw new Error(text.slice(0, 120) || "Server error") }
      if (!res.ok) throw new Error((data.error as string) || "Failed to process")
      const newItem: HistoryItem = {
        id: data.result_id || null,
        input_url: data.input_url || preview || "",
        output_url: data.result_url || data.result || "",
        prompt: prompt,
        created_at: new Date().toISOString(),
      }
      setHistory((h) => {
        const next = [...h, newItem]
        setCurrentIdx(next.length - 1)
        return next
      })
      setIsPreview(data.preview || false)
      setPreviewNote(data.previewNote)
      refreshProfile()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteResult(id: string) {
    try {
      await fetch(`/api/results/${id}`, { method: "DELETE" })
      setHistory((h) => {
        const next = h.filter((item) => item.id !== id)
        if (next.length === 0) setCurrentIdx(-1)
        else if (currentIdx >= next.length) setCurrentIdx(next.length - 1)
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed")
    }
  }

  const hasContent = loading || history.length > 0
  const showCompare = hasContent && (!!preview || history.length > 0)
  const containerWidth = showCompare ? "max-w-4xl" : "max-w-2xl"

  return (
    <div className={`mx-auto ${containerWidth} px-4 py-12`}>
      <h1 className="text-2xl font-bold mb-2">Guided Touch-Up</h1>
      <p className="text-sm text-muted-foreground mb-1">
        Upload an image and describe what you want changed.
      </p>
      <a href="/tools/touchup" className="text-xs text-accent hover:underline mb-6 inline-block">About this tool</a>

      <ImageUpload
        onFileSelect={handleFile}
        preview={preview}
        onClear={handleClear}
        uploading={loading}
        hideThumbnail={showCompare}
      />

      {!preview && user && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent"
          >
            <ImageIcon className="size-3.5" /> Pick from Google Photos
          </button>
        </div>
      )}

      {preview && (
        <>
          <Textarea
            className="mt-4"
            placeholder='Describe the edit, e.g. "make the lighting warmer" or "remove the background"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <div className="mt-4 flex justify-center">
            {user ? (
              <Button
                variant="accent"
                size="lg"
                onClick={handleTouchUp}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Paintbrush className="size-4" />
                    Apply Touch-Up
                  </>
                )}
              </Button>
            ) : (
              <a
                href="/signin"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-8 text-base font-medium text-accent-foreground hover:opacity-90 transition-opacity"
              >
                <LogIn className="size-4" />
                Sign In To Use
              </a>
            )}
          </div>
        </>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      )}

      {showCompare && (
        <ResultCompare
          history={history}
          currentIdx={currentIdx}
          onSelect={setCurrentIdx}
          pendingInput={preview || undefined}
          loading={loading && currentIdx === -1}
          previewGated={isPreview}
          previewNote={previewNote}
          onTryAnother={handleClear}
          onDeleteResult={handleDeleteResult}
          toolName="Guided Touch-Up"
          photosConnected={photosConnected}
          connectNextPath="/app/touchup"
          phoneVerified={user?.phoneVerified}
        />
      )}

      <GooglePhotosPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleFile}
        connectNextPath="/app/touchup"
      />
    </div>
  )
}
