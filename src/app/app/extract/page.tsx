"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { ScanText, Loader2, Copy, Check, Lock, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const tiers = [
  { value: "cloud_vision", label: "Fast OCR", description: "< 1s" },
  { value: "gemini", label: "Smart (Gemini)", description: "2-4s" },
  { value: "gpt4o", label: "Deep (GPT-4o)", description: "3-6s" },
]

export default function ExtractApp() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [tier, setTier] = useState("cloud_vision")
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
    setResult(null)
    setIsPreview(false)
    setError(null)
  }

  async function handleExtract() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tool", "extract")
      formData.append("model", tier)
      const res = await fetch("/api/image", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to extract")
      setResult(data.result || data.text)
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Text Extractor</h1>
      <p className="text-sm text-muted-foreground mb-1">
        Upload an image and extract text or meaning from it.
      </p>
      <a href="/tools/extract" className="text-xs text-accent hover:underline mb-6 inline-block">About this tool</a>

      <ImageUpload
        onFileSelect={handleFile}
        preview={preview}
        onClear={handleClear}
        uploading={loading}
      />

      {preview && !result && (
        <>
          <div className="mt-4 flex gap-2 justify-center">
            {tiers.map((t) => (
              <button
                key={t.value}
                onClick={() => setTier(t.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  tier === t.value
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : "border-border hover:bg-muted"
                }`}
              >
                {t.label}
                <span className="ml-1 text-xs text-muted-foreground">
                  {t.description}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            {user ? (
              <Button
                variant="accent"
                size="lg"
                onClick={handleExtract}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <ScanText className="size-4" />
                    Extract Text
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Result</h2>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="size-4 text-accent" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-sm">
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
