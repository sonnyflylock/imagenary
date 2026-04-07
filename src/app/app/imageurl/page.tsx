"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { Link2, Loader2, Copy, Check, ExternalLink } from "lucide-react"

export default function ImageUrlApp() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResultUrl(null)
    setError(null)
  }

  function handleClear() {
    setFile(null)
    setPreview(null)
    setResultUrl(null)
    setError(null)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/imageurl", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setResultUrl(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (resultUrl) {
      navigator.clipboard.writeText(resultUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Image to URL</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload an image and get a public URL you can share anywhere.
      </p>

      <ImageUpload
        onFileSelect={handleFile}
        preview={preview}
        onClear={handleClear}
        uploading={loading}
      />

      {preview && !resultUrl && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="accent"
            size="lg"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Link2 className="size-4" />
                Get URL
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      )}

      {resultUrl && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Your URL</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="size-4 text-accent" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <a href={resultUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="size-4" />
                  Open
                </Button>
              </a>
            </div>
          </div>
          <div
            onClick={handleCopy}
            className="cursor-pointer rounded-lg border bg-muted/50 p-4 text-sm font-mono break-all hover:bg-muted transition-colors"
          >
            {resultUrl}
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Click the URL to copy. Image hosted for 24 hours.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={handleClear}>
              Upload Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
