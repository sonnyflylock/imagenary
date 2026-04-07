"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { UserCircle, Loader2, Download } from "lucide-react"

export default function GenerateApp() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
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
    setPrompt("")
  }

  async function handleGenerate() {
    if (!file || !prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tool", "generate")
      formData.append("prompt", prompt)
      const res = await fetch("/api/image", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate")
      setResult(data.result_url || data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Face Generate</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload a clear face photo and describe the scene you want.
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
            placeholder='Describe the scene, e.g. "professional headshot with studio lighting" or "casual outdoor portrait at sunset"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <div className="mt-4 flex justify-center">
            <Button
              variant="accent"
              size="lg"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <UserCircle className="size-4" />
                  Generate Image
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
          <img
            src={result}
            alt="Generated portrait"
            className="w-full rounded-lg border"
          />
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
        </div>
      )}
    </div>
  )
}
