"use client"

import { useState, useEffect, useRef } from "react"
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

interface ImageLightboxProps {
  src: string | null
  alt?: string
  onClose: () => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 8
const ZOOM_STEP = 0.5

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [didDrag, setDidDrag] = useState(false)
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset transform when image changes.
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [src])

  // Keyboard shortcuts (Escape, +, -, 0).
  useEffect(() => {
    if (!src) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
      } else if (e.key === "-" || e.key === "_") {
        setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
      } else if (e.key === "0") {
        setZoom(1)
        setPan({ x: 0, y: 0 })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [src, onClose])

  // Non-passive wheel listener so preventDefault works (React's onWheel is passive).
  useEffect(() => {
    if (!src) return
    const el = overlayRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
      setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [src])

  function handleMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return
    setDragging(true)
    setDidDrag(false)
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) + Math.abs(dy) > 3) setDidDrag(true)
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy })
  }

  function handleMouseUp() {
    setDragging(false)
    dragStart.current = null
  }

  function handleImageClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (didDrag) return
    if (zoom === 1) {
      setZoom(2)
    } else {
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }

  // Touch — basic single-finger pan + tap-to-zoom.
  const touchStart = useRef<{ x: number; y: number; panX: number; panY: number; tapped: boolean } | null>(null)
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, panX: pan.x, panY: pan.y, tapped: true }
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!touchStart.current || zoom <= 1 || e.touches.length !== 1) return
    const t = e.touches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    if (Math.abs(dx) + Math.abs(dy) > 5) touchStart.current.tapped = false
    setPan({ x: touchStart.current.panX + dx, y: touchStart.current.panY + dy })
  }
  function handleTouchEnd() {
    if (touchStart.current?.tapped) {
      if (zoom === 1) setZoom(2)
      else { setZoom(1); setPan({ x: 0, y: 0 }) }
    }
    touchStart.current = null
  }

  if (!src) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/95"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={src}
        alt={alt || "Image"}
        className="max-h-[95vh] max-w-[95vw] select-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: dragging ? "none" : "transform 0.2s ease-out",
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
          willChange: "transform",
        }}
        onMouseDown={handleMouseDown}
        onClick={handleImageClick}
        draggable={false}
      />

      {/* Zoom controls */}
      <div
        className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/60 p-1 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          aria-label="Zoom out"
        >
          <ZoomOut className="size-4" />
        </button>
        <span className="min-w-[3.5rem] px-2 text-center text-xs text-white tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          aria-label="Zoom in"
        >
          <ZoomIn className="size-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-white/20" />
        <button
          type="button"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
          aria-label="Fit to screen"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>
    </div>
  )
}
