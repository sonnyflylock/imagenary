"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ImageLightbox } from "@/components/image-lightbox"
import { Loader2, RefreshCw, Paintbrush, UserCircle, Trash2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistoryItem } from "@/lib/history-types"

interface GalleryItem extends HistoryItem {
  tool: string
}

const TOOL_FILTERS = [
  { key: "all", label: "All", icon: ImageIcon },
  { key: "refresh", label: "Refresh", icon: RefreshCw },
  { key: "touchup", label: "Touch-Up", icon: Paintbrush },
  { key: "generate", label: "Generate", icon: UserCircle },
]

export default function GalleryPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push("/signin")
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch("/api/results?limit=200")
      .then((r) => r.json())
      .then((d) => setItems((d.results as GalleryItem[]) || []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [user])

  async function handleDelete(id: string) {
    if (!confirm("Delete this result? This can't be undone.")) return
    setDeleting(id)
    try {
      await fetch(`/api/results/${id}`, { method: "DELETE" })
      setItems((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const filtered = filter === "all" ? items : items.filter((item) => item.tool === filter)
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.tool] = (acc[item.tool] || 0) + 1
    acc.all = (acc.all || 0) + 1
    return acc
  }, {})

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every image you've generated. Click to view full-size.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{items.length} total</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b">
        {TOOL_FILTERS.map((f) => {
          const active = filter === f.key
          const count = counts[f.key] || 0
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <f.icon className="size-3.5" /> {f.label}
              {count > 0 && <span className="text-xs text-muted-foreground/70">{count}</span>}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-24 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "Nothing here yet — run a tool to start your gallery."
            : "No results for this filter."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <div
              key={item.id || item.output_url}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={item.output_url}
                alt={item.prompt || item.tool}
                loading="lazy"
                className="size-full cursor-zoom-in object-cover transition-opacity group-hover:opacity-95"
                onClick={() => setLightboxSrc(item.output_url)}
              />
              {/* Tool badge */}
              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                {item.tool}
              </span>
              {/* Delete */}
              {item.id && (
                <button
                  type="button"
                  onClick={() => item.id && handleDelete(item.id)}
                  disabled={deleting === item.id}
                  title="Delete"
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                >
                  {deleting === item.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                </button>
              )}
              {/* Prompt caption (truncated) */}
              {item.prompt && (
                <div className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-[10px] text-white/90">
                  {item.prompt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  )
}
