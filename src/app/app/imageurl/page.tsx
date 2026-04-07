"use client"

import { useState, useRef, type DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Link2, Loader2, Copy, Check, ExternalLink, Upload, X, Plus } from "lucide-react"

interface UploadItem {
  file: File
  preview: string
  url?: string
  uploading: boolean
  error?: string
}

const MAX_FILES = 5

export default function ImageUrlApp() {
  const [items, setItems] = useState<UploadItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const newItems: UploadItem[] = []
    for (const file of Array.from(files)) {
      if (items.length + newItems.length >= MAX_FILES) break
      if (!file.type.startsWith("image/")) continue
      if (file.size > 50 * 1024 * 1024) continue
      newItems.push({ file, preview: URL.createObjectURL(file), uploading: false })
    }
    if (newItems.length > 0) setItems((prev) => [...prev, ...newItems])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function uploadOne(idx: number) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, uploading: true, error: undefined } : item))
    try {
      const formData = new FormData()
      formData.append("file", items[idx].file)
      const res = await fetch("/api/imageurl", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setItems((prev) => prev.map((item, i) => i === idx ? { ...item, url: data.url, uploading: false } : item))
    } catch (e) {
      setItems((prev) => prev.map((item, i) => i === idx ? { ...item, error: e instanceof Error ? e.message : "Failed", uploading: false } : item))
    }
  }

  async function uploadAll() {
    const pending = items.map((item, i) => (!item.url && !item.uploading ? i : -1)).filter((i) => i >= 0)
    await Promise.all(pending.map((i) => uploadOne(i)))
  }

  function copyUrl(idx: number) {
    const url = items[idx]?.url
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  function copyAllUrls() {
    const urls = items.filter((i) => i.url).map((i) => i.url).join("\n")
    if (!urls) return
    navigator.clipboard.writeText(urls)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ""
  }

  const hasResults = items.some((i) => i.url)
  const allDone = items.length > 0 && items.every((i) => i.url)
  const anyUploading = items.some((i) => i.uploading)
  const hasPending = items.some((i) => !i.url && !i.uploading)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Image to URL</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload up to {MAX_FILES} images and get public URLs you can share anywhere.
      </p>

      {/* Drop zone */}
      {items.length < MAX_FILES && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-accent/50 hover:bg-accent/5 ${dragOver ? "border-accent bg-accent/5" : ""}`}
        >
          <Upload className="size-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              Drop images here or{" "}
              <span className="text-accent">click to browse</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WebP up to 50MB &middot; {MAX_FILES - items.length} more allowed
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Image list */}
      {items.length > 0 && (
        <div className="mt-6 space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
              <img src={item.preview} alt="" className="size-16 rounded-md object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">{(item.file.size / 1024).toFixed(0)} KB</p>
                {item.uploading && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" /> Uploading...
                  </div>
                )}
                {item.error && (
                  <p className="mt-1 text-xs text-destructive">{item.error}</p>
                )}
                {item.url && (
                  <div
                    onClick={() => copyUrl(idx)}
                    className="mt-1 cursor-pointer rounded bg-muted/50 px-2 py-1 text-xs font-mono break-all hover:bg-muted transition-colors"
                  >
                    {item.url}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                {item.url ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => copyUrl(idx)}>
                      {copiedIdx === idx ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
                    </Button>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <ExternalLink className="size-3" />
                      </Button>
                    </a>
                  </>
                ) : !item.uploading ? (
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => removeItem(idx)}>
                    <X className="size-3" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {items.length > 0 && hasPending && (
        <div className="mt-4 flex justify-center gap-3">
          <Button
            variant="accent"
            size="lg"
            onClick={uploadAll}
            disabled={anyUploading}
          >
            {anyUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Link2 className="size-4" />
                Get {items.filter((i) => !i.url).length === 1 ? "URL" : "URLs"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Copy all + upload more */}
      {hasResults && (
        <div className="mt-4 flex justify-center gap-3">
          {items.filter((i) => i.url).length > 1 && (
            <Button variant="outline" size="sm" onClick={copyAllUrls}>
              {copiedAll ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
              {copiedAll ? "Copied all" : "Copy all URLs"}
            </Button>
          )}
          {allDone && items.length < MAX_FILES && (
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Plus className="size-3" />
              Add more
            </Button>
          )}
          {allDone && (
            <Button variant="outline" size="sm" onClick={() => setItems([])}>
              Start over
            </Button>
          )}
        </div>
      )}

      {hasResults && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Click any URL to copy. Images hosted for 24 hours.
        </p>
      )}
    </div>
  )
}
