"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { AuthGuard } from "@/components/auth-guard"
import { PreviewGate } from "@/components/preview-gate"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paintbrush, Loader2, Download } from "lucide-react"

export default function TouchUpApp() {
  return (
    <AuthGuard>
      <TouchUpTool />
    </AuthGuard>
  )
}

function TouchUpTool() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to process")
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
      <h1 className="text-2xl font-bold mb-2">Guided Touch-Up</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload an image and describe what you want changed.
      </p>

      <ImageUpload
        onFileSelect={handleFile}
        preview={preview}
        onClear={handleClear}
        uploading={loading}
      />

      {preview && !result && (
        <>
          <Textarea
            className="mt-4"
            placeholder='Describe the edit, e.g. "make the lighting warmer" or "remove the background"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <div className="mt-4 flex justify-center">
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
          </div>
        </>
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
              alt="Touched up image"
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
                <Download className="size-4" /> Download
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
