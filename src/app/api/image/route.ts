import { NextRequest, NextResponse } from "next/server"
import {
  extractText,
  describeImage,
  describeImageFromUrl,
  refreshImage,
  touchUpImage,
  generateWithFace,
  type ExtractModel,
} from "@/lib/image-ai"
import { checkAndIncrement, checkAndIncrementForUser } from "@/lib/usage"
import { sendImageResult, sendTextResult } from "@/lib/email"
import { logUsage } from "@/lib/usage-log"
import { validateApiKey } from "@/lib/api-keys"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  let tool = "unknown"
  let file: File | null = null
  let startTime = Date.now()
  try {
    const formData = await req.formData()
    file = formData.get("file") as File | null
    tool = formData.get("tool") as string
    const model = formData.get("model") as string | null
    const prompt = formData.get("prompt") as string | null
    const strength = formData.get("strength") as string | null
    const imageUrl = formData.get("image_url") as string | null

    if (!file && !(tool === "describe" && imageUrl)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!tool || !["extract", "describe", "refresh", "touchup", "generate"].includes(tool)) {
      return NextResponse.json({ error: "Invalid tool" }, { status: 400 })
    }
    if (file && file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 })
    }

    // Check usage limits — API key (Bearer) or cookie auth
    const usageKey = tool as "extract" | "refresh" | "touchup" | "generate" | "describe"
    const bearer = req.headers.get("authorization")?.replace("Bearer ", "")
    const apiKeyUserId = bearer ? await validateApiKey(bearer) : null
    const usage = apiKeyUserId
      ? await checkAndIncrementForUser(apiKeyUserId, usageKey)
      : await checkAndIncrement(usageKey)
    startTime = Date.now()
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const ua = req.headers.get("user-agent") || null

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

    let base64 = ""
    let dataUri = ""
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      base64 = buffer.toString("base64")
      const mimeType = file.type || "image/png"
      dataUri = `data:${mimeType};base64,${base64}`
    }

    switch (tool) {
      case "describe": {
        let text: string
        if (imageUrl) {
          text = await describeImageFromUrl(imageUrl, prompt || undefined)
        } else {
          text = await describeImage(base64, prompt || undefined)
        }

        let resultText = text
        let previewNote: string | undefined
        if (usage.preview) {
          const cutoff = Math.max(1, Math.ceil(text.length * 0.25))
          resultText = text.slice(0, cutoff)
          previewNote = `Showing 25% preview. Full result emailed to ${usage.userEmail}.`
          if (usage.userEmail) {
            sendTextResult({ to: usage.userEmail, fullText: text })
          }
        }

        logUsage({
          userEmail: usage.userEmail || null,
          tool: "describe",
          model: imageUrl ? "gemini-url" : "gemini",
          fileSize: file?.size || null,
          fileType: file?.type || null,
          success: true,
          durationMs: Date.now() - startTime,
          creditsUsed: usage.usedFree ? 0 : 1,
          wasFree: usage.usedFree,
          wasPreview: usage.preview,
          ipAddress: ip,
          userAgent: ua,
          metadata: imageUrl ? { imageUrl } : undefined,
        })

        return NextResponse.json({
          result: resultText,
          remaining: usage.remaining,
          usedFree: usage.usedFree,
          preview: usage.preview,
          previewNote,
        })
      }

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
          if (usage.userEmail) {
            sendTextResult({ to: usage.userEmail, fullText: text })
          }
        }

        logUsage({
          userEmail: usage.userEmail || null,
          tool: "extract",
          model: model || "cloud_vision",
          fileSize: file?.size || null,
          fileType: file?.type || null,
          success: true,
          durationMs: Date.now() - startTime,
          creditsUsed: usage.usedFree ? 0 : 1,
          wasFree: usage.usedFree,
          wasPreview: usage.preview,
          ipAddress: ip,
          userAgent: ua,
        })

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

        if (usage.preview && usage.userEmail) {
          sendImageResult({ to: usage.userEmail, toolName: "Image Refresh", resultUrl })
        }

        logUsage({
          userEmail: usage.userEmail || null,
          tool: "refresh",
          fileSize: file?.size || null,
          fileType: file?.type || null,
          success: true,
          durationMs: Date.now() - startTime,
          creditsUsed: usage.usedFree ? 0 : 1,
          wasFree: usage.usedFree,
          wasPreview: usage.preview,
          ipAddress: ip,
          userAgent: ua,
        })

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

        if (usage.preview && usage.userEmail) {
          sendImageResult({ to: usage.userEmail, toolName: "Guided Touch-Up", resultUrl })
        }

        logUsage({
          userEmail: usage.userEmail || null,
          tool: "touchup",
          fileSize: file?.size || null,
          fileType: file?.type || null,
          success: true,
          durationMs: Date.now() - startTime,
          creditsUsed: usage.usedFree ? 0 : 1,
          wasFree: usage.usedFree,
          wasPreview: usage.preview,
          ipAddress: ip,
          userAgent: ua,
          metadata: { prompt, strength: strength ? parseFloat(strength) : 0.35 },
        })

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

        if (usage.preview && usage.userEmail) {
          sendImageResult({ to: usage.userEmail, toolName: "Face Generate", resultUrl })
        }

        logUsage({
          userEmail: usage.userEmail || null,
          tool: "generate",
          fileSize: file?.size || null,
          fileType: file?.type || null,
          success: true,
          durationMs: Date.now() - startTime,
          creditsUsed: usage.usedFree ? 0 : 1,
          wasFree: usage.usedFree,
          wasPreview: usage.preview,
          ipAddress: ip,
          userAgent: ua,
          metadata: { prompt },
        })

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

    logUsage({
      tool: tool || "unknown",
      success: false,
      error: message,
      durationMs: Date.now() - startTime,
      fileSize: file?.size || null,
      fileType: file?.type || null,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: req.headers.get("user-agent") || null,
    })

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
