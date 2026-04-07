import { NextRequest, NextResponse } from "next/server"
import {
  extractText,
  refreshImage,
  touchUpImage,
  generateWithFace,
  type ExtractModel,
} from "@/lib/image-ai"
import { checkAndIncrement } from "@/lib/usage"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const tool = formData.get("tool") as string
    const model = formData.get("model") as string | null
    const prompt = formData.get("prompt") as string | null
    const strength = formData.get("strength") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!tool || !["extract", "refresh", "touchup", "generate"].includes(tool)) {
      return NextResponse.json({ error: "Invalid tool" }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 })
    }

    // Check usage limits (requires authenticated user)
    const usageKey = tool as "extract" | "refresh" | "touchup" | "generate"
    const usage = await checkAndIncrement(usageKey)

    if (!usage.allowed && !usage.userEmail) {
      return NextResponse.json(
        { error: "Sign in to use this tool.", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Free uses exhausted. Purchase credits to continue.",
          code: "USAGE_LIMIT",
          remaining: 0,
        },
        { status: 402 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")
    const mimeType = file.type || "image/png"
    const dataUri = `data:${mimeType};base64,${base64}`

    switch (tool) {
      case "extract": {
        const text = await extractText(
          base64,
          (model as ExtractModel) || "fast",
          prompt || undefined
        )

        // Free tier: show top 25% of extracted text
        let resultText = text
        let previewNote: string | undefined
        if (usage.preview) {
          const cutoff = Math.max(1, Math.ceil(text.length * 0.25))
          resultText = text.slice(0, cutoff)
          previewNote = `Showing 25% preview. Full result emailed to ${usage.userEmail}.`
          // TODO: send email with full text
        }

        return NextResponse.json({
          result: resultText,
          remaining: usage.remaining,
          usedFree: usage.usedFree,
          preview: usage.preview,
          previewNote,
        })
      }

      case "refresh": {
        const resultUrl = await refreshImage(dataUri)

        // Free tier: return preview flag — client will show cropped version
        return NextResponse.json({
          result_url: resultUrl,
          remaining: usage.remaining,
          usedFree: usage.usedFree,
          preview: usage.preview,
          previewNote: usage.preview
            ? `Showing 25% preview. Full result emailed to ${usage.userEmail}.`
            : undefined,
        })
      }

      case "touchup": {
        if (!prompt?.trim()) {
          return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }
        const resultUrl = await touchUpImage(
          dataUri,
          prompt,
          strength ? parseFloat(strength) : 0.35
        )
        return NextResponse.json({
          result_url: resultUrl,
          remaining: usage.remaining,
          usedFree: usage.usedFree,
          preview: usage.preview,
          previewNote: usage.preview
            ? `Showing 25% preview. Full result emailed to ${usage.userEmail}.`
            : undefined,
        })
      }

      case "generate": {
        if (!prompt?.trim()) {
          return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }
        const resultUrl = await generateWithFace(dataUri, prompt)
        return NextResponse.json({
          result_url: resultUrl,
          remaining: usage.remaining,
          usedFree: usage.usedFree,
          preview: usage.preview,
          previewNote: usage.preview
            ? `Showing 25% preview. Full result emailed to ${usage.userEmail}.`
            : undefined,
        })
      }
    }
  } catch (e) {
    console.error("Image API error:", e)
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
