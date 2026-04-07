"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, Loader2 } from "lucide-react"

export default function RefreshApp() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }

  function handleClear() {
    setFile(null)
    setPreview(null)
    setResult(null)
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to process image")
      setResult(data.result_url || data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Image Refresh</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload a blurry or old photo. AI will restore and enhance it.
      </p>

      <ImageUpload
        onFileSelect={handleFile}
        preview={preview}
        onClear={handleClear}
        uploading={loading}
      />

      {preview && !result && (
        <div className="mt-4 flex justify-center">
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
        </div>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Result</h2>
          <img
            src={result}
            alt="Refreshed image"
            className="w-full rounded-lg border"
          />
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
        </div>
      )}
    </div>
  )
}
