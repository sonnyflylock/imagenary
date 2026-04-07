"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { PreviewGate } from "@/components/preview-gate"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paintbrush, Loader2, Download, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function TouchUpApp() {
  const { user } = useAuth()
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
      const text = await res.text()
      let data: Record<string, unknown>
      try { data = JSON.parse(text) } catch { throw new Error(text.slice(0, 120) || "Server error") }
      if (!res.ok) throw new Error((data.error as string) || "Failed to process")
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
      <p className="text-sm text-muted-foreground mb-1">
        Upload an image and describe what you want changed.
      </p>
      <a href="/tools/touchup" className="text-xs text-accent hover:underline mb-6 inline-block">About this tool</a>

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
