"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Copy, Check, Lock, Link2, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function DescribeApp() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload")
  const [customPrompt, setCustomPrompt] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [previewNote, setPreviewNote] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    setImageUrl("")
    setResult(null)
    setIsPreview(false)
    setError(null)
  }

  async function handleDescribe() {
    if (!file && !imageUrl.trim()) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("tool", "describe")
      if (customPrompt.trim()) {
        formData.append("prompt", customPrompt.trim())
      }
      if (file) {
        formData.append("file", file)
      }
      if (imageUrl.trim()) {
        formData.append("image_url", imageUrl.trim())
      }
      const res = await fetch("/api/image", { method: "POST", body: formData })
      const text = await res.text()
      let data: Record<string, unknown>
      try { data = JSON.parse(text) } catch { throw new Error(text.slice(0, 120) || "Server error") }
      if (!res.ok) throw new Error((data.error as string) || "Failed to describe image")
      setResult(data.result)
      setIsPreview(data.preview || false)
      setPreviewNote(data.previewNote)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = result
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasInput = file || imageUrl.trim()

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Image to Text Description</h1>
      <p className="text-sm text-muted-foreground mb-1">
        Upload an image or paste a URL — AI describes it in detail.
      </p>
      <a href="/tools/describe" className="text-xs text-accent hover:underline mb-6 inline-block">About this tool</a>

      {/* Input mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setInputMode("upload"); setImageUrl(""); }}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            inputMode === "upload"
              ? "border-accent bg-accent/10 text-accent font-medium"
              : "border-border hover:bg-muted"
          }`}
        >
          Upload Image
        </button>
        <button
          onClick={() => { setInputMode("url"); setFile(null); setPreview(null); }}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            inputMode === "url"
              ? "border-accent bg-accent/10 text-accent font-medium"
              : "border-border hover:bg-muted"
          }`}
        >
          <Link2 className="inline size-3 mr-1" />
          Paste URL
        </button>
      </div>

      {inputMode === "upload" ? (
        <ImageUpload
          onFileSelect={handleFile}
          preview={preview}
          onClear={handleClear}
          uploading={loading}
        />
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); setResult(null); setError(null); }}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          {imageUrl.trim() && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full rounded-lg border object-contain max-h-80"
              onError={() => setError("Could not load image from URL")}
            />
          )}
        </div>
      )}

      {/* Custom prompt */}
      {hasInput && !result && (
        <div className="mt-4">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Custom prompt (optional) — e.g. 'Focus on the lighting and color palette'"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      )}

      {hasInput && !result && (
        <div className="mt-4 flex justify-center">
          {user ? (
            <Button
              variant="accent"
              size="lg"
              onClick={handleDescribe}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Describing...
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  Describe Image
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Description</h2>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="size-4 text-accent" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed">
            {result}
          </pre>
          {isPreview && (
            <div className="mt-2 rounded-lg border border-accent/20 bg-accent/5 p-4 text-center">
              <Lock className="size-5 mx-auto mb-2 text-accent" />
              <p className="text-sm font-medium">Preview only</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {previewNote || "Full result has been emailed to your account."}
              </p>
              <a
                href="/pricing"
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-accent px-4 text-xs font-medium text-accent-foreground hover:opacity-90 transition-opacity"
              >
                Get credits for instant full results
              </a>
            </div>
          )}
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={handleClear}>
              Try Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
