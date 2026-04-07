"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface BeforeAfterProps {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function BeforeAfter({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleMove(clientX: number) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative select-none overflow-hidden rounded-lg", className)}
      onMouseMove={(e) => {
        if (e.buttons === 1) handleMove(e.clientX)
      }}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After (full width background) */}
      <img src={after} alt={afterLabel} className="block w-full" draggable={false} />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before}
          alt={beforeLabel}
          className="block w-full"
          style={{ width: containerRef.current?.offsetWidth }}
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow-md">
          <svg viewBox="0 0 16 16" className="size-4 text-gray-600">
            <path
              d="M5 3L2 8l3 5M11 3l3 5-3 5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
        {afterLabel}
      </span>
    </div>
  )
}
