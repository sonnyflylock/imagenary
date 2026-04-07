/**
 * Extension-specific text extraction endpoint.
 * Accepts Supabase access token via Authorization header (Bearer <token>)
 * instead of relying on cookies, since Chrome extensions can't send cookies
 * cross-origin to the API.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { extractText, type ExtractModel } from "@/lib/image-ai"
import { checkAndIncrementForUser } from "@/lib/usage"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Sign in to imagenary.ai first.", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    // Verify the token and get the user
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session. Sign in again at imagenary.ai.", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const model = formData.get("model") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 })
    }

    // Check usage using the verified user ID
    const usage = await checkAndIncrementForUser(user.id, "extract")

    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Credits exhausted. Visit imagenary.ai/pricing to top up.",
          code: "USAGE_LIMIT",
          remaining: 0,
        },
        { status: 402 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    const text = await extractText(
      base64,
      (model as ExtractModel) || "smart",
      undefined
    )

    // Free tier: show top 25% preview
    let resultText = text
    let previewNote: string | undefined
    if (usage.preview) {
      const cutoff = Math.max(1, Math.ceil(text.length * 0.25))
      resultText = text.slice(0, cutoff)
      previewNote = `Full result emailed to ${user.email}.`
    }

    return NextResponse.json({
      result: resultText,
      remaining: usage.remaining,
      usedFree: usage.usedFree,
      preview: usage.preview,
      previewNote,
    })
  } catch (e) {
    console.error("Extension extract API error:", e)
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
