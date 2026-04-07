import { NextRequest, NextResponse } from "next/server"

const LOCUST_URL = process.env.LOCUST_API_URL || "https://bot.messagesimproved.com"

/**
 * Unified image processing API route.
 * Accepts multipart form data with:
 *   - file: the image file
 *   - tool: "extract" | "refresh" | "touchup" | "generate"
 *   - model: (for extract) "cloud_vision" | "gemini" | "gpt4o"
 *   - prompt: (for touchup/generate) natural language instruction
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const tool = formData.get("tool") as string
    const model = formData.get("model") as string | null
    const prompt = formData.get("prompt") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!tool) {
      return NextResponse.json({ error: "No tool specified" }, { status: 400 })
    }

    // Route to appropriate backend
    switch (tool) {
      case "extract":
        return handleExtract(file, model || "cloud_vision", prompt)
      case "refresh":
        return handleRefresh(file)
      case "touchup":
        return handleTouchUp(file, prompt || "")
      case "generate":
        return handleGenerate(file, prompt || "")
      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 })
    }
  } catch (e) {
    console.error("Image API error:", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleExtract(file: File, model: string, prompt: string | null) {
  // Proxy to Locust /image_process endpoint (already deployed)
  const body = new FormData()
  body.append("file", file)
  body.append("model", model)
  if (prompt) body.append("prompt", prompt)

  const res = await fetch(`${LOCUST_URL}/image_process`, {
    method: "POST",
    body,
  })

  const data = await res.json()
  return NextResponse.json({
    result: data.text || data.description || data.result,
    model,
  })
}

async function handleRefresh(file: File) {
  // Image refresh endpoint — to be implemented on Locust
  // For now, returns a placeholder indicating the feature is being connected
  const body = new FormData()
  body.append("file", file)
  body.append("tool", "refresh")

  try {
    const res = await fetch(`${LOCUST_URL}/image_refresh`, {
      method: "POST",
      body,
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ result_url: data.result_url })
    }
  } catch {
    // Endpoint not yet deployed
  }

  return NextResponse.json(
    { error: "Image Refresh is being deployed. Check back soon!" },
    { status: 503 }
  )
}

async function handleTouchUp(file: File, prompt: string) {
  if (!prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  }

  const body = new FormData()
  body.append("file", file)
  body.append("prompt", prompt)
  body.append("tool", "touchup")

  try {
    const res = await fetch(`${LOCUST_URL}/image_touchup`, {
      method: "POST",
      body,
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ result_url: data.result_url })
    }
  } catch {
    // Endpoint not yet deployed
  }

  return NextResponse.json(
    { error: "Guided Touch-Up is being deployed. Check back soon!" },
    { status: 503 }
  )
}

async function handleGenerate(file: File, prompt: string) {
  if (!prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  }

  const body = new FormData()
  body.append("file", file)
  body.append("prompt", prompt)
  body.append("tool", "generate")

  try {
    const res = await fetch(`${LOCUST_URL}/image_generate`, {
      method: "POST",
      body,
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ result_url: data.result_url })
    }
  } catch {
    // Endpoint not yet deployed
  }

  return NextResponse.json(
    { error: "Face Generate is being deployed. Check back soon!" },
    { status: 503 }
  )
}
