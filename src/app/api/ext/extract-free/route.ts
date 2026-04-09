/**
 * Anonymous free extraction endpoint for the Chrome extension.
 * Allows a small number of free extractions without login so
 * users (and Chrome Web Store reviewers) can try the extension
 * immediately after install.
 *
 * Rate limit: 3 extractions per IP per day.
 * Model: "fast" (Gemini Flash — cheapest).
 */
import { NextRequest, NextResponse } from "next/server"
import { extractText } from "@/lib/image-ai"
import { rateLimit } from "@/lib/rate-limit"

const DAILY_LIMIT = 3
const DAY_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    const { ok, remaining } = rateLimit(`ext-free:${ip}`, DAILY_LIMIT, DAY_MS)
    if (!ok) {
      return NextResponse.json(
        {
          error:
            "Free daily limit reached. Sign in to Imagenary AI for more extractions, or add your own API key in Settings.",
          code: "RATE_LIMIT",
          remaining: 0,
        },
        { status: 429 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    const text = await extractText(base64, "fast", undefined)

    return NextResponse.json({
      result: text,
      remaining,
      anonymous: true,
    })
  } catch (e) {
    console.error("Free extract API error:", e)
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
