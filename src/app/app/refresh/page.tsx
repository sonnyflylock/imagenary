"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { PreviewGate } from "@/components/preview-gate"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, Loader2, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function RefreshApp() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [previewNote, setPreviewNote] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setIsPreview(false)
    setError(null)
  }

  function handleClear() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setIsPreview(false)
    setError(null)
  }

  async function handleRefresh() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tool", "refresh")
      const res = await fetch("/api/image", { method: "POST", body: formData })
      const text = await res.text()
      let data: Record<string, unknown>
      try { data = JSON.parse(text) } catch { throw new Error(text.slice(0, 120) || "Server error") }
      if (!res.ok) throw new Error((data.error as string) || "Failed to process image")
      setResult(data.result_url || data.result)
      setIsPreview(data.preview || false)
      setPreviewNote(data.previewNote)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Image Refresh</h1>
      <p className="text-sm text-muted-foreground mb-1">
        Upload a blurry or old photo. AI will restore and enhance it.
      </p>
      <a href="/tools/refresh" className="text-xs text-accent hover:underline mb-6 inline-block">About this tool</a>

      <ImageUpload
        onFileSelect={handleFile}
        preview={preview}
        onClear={handleClear}
        uploading={loading}
      />

      {preview && !result && (
        <div className="mt-4 flex justify-center">
          {user ? (
            <Button
              variant="accent"
              size="lg"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" />
                  Refresh Image
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
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Result</h2>
          <PreviewGate preview={isPreview} previewNote={previewNote}>
            <img
              src={result}
              alt="Refreshed image"
              className="w-full rounded-lg border"
            />
          </PreviewGate>
          {!isPreview && (
            <div className="mt-4 flex justify-center gap-3">
              <a
                href={result}
                download
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                <Download className="size-4" />
                Download
              </a>
              <Button variant="outline" onClick={handleClear}>
                Try Another
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
