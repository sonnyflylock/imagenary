"use client"

import { useState, useRef, type DragEvent } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onFileSelect: (file: File) => void
  preview: string | null
  onClear: () => void
  uploading?: boolean
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function ImageUpload({
  onFileSelect,
  preview,
  onClear,
  uploading = false,
  accept = "image/*",
  maxSizeMB = 20,
  className,
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      if (file.size <= maxSizeMB * 1024 * 1024) {
        onFileSelect(file)
      }
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  if (preview) {
    return (
      <div className={cn("relative group", className)}>
        <img
          src={preview}
          alt="Upload preview"
          className="w-full rounded-lg border object-contain max-h-80"
        />
        {!uploading && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          >
            <X className="size-4" />
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
            <Loader2 className="size-8 animate-spin text-accent" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-accent/50 hover:bg-accent/5",
        dragOver && "border-accent bg-accent/5",
        className
      )}
    >
      <Upload className="size-8 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">
          Drop an image here or{" "}
          <span className="text-accent">click to browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, WebP up to {maxSizeMB}MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  )
}
