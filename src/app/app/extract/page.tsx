"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Button } from "@/components/ui/button"
import { ScanText, Loader2, Copy, Check } from "lucide-react"

const tiers = [
  { value: "cloud_vision", label: "Fast OCR", description: "< 1s" },
  { value: "gemini", label: "Smart (Gemini)", description: "2-4s" },
  { value: "gpt4o", label: "Deep (GPT-4o)", description: "3-6s" },
]

export default function ExtractApp() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [tier, setTier] = useState("cloud_vision")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Extract</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload an image and extract text or meaning from it.
      </p>

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
