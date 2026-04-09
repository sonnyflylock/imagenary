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

    // Extension users get 10 free full extractions (no preview),
    // tracked via ext_free_extract on their profile.
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("ext_free_extract, balance_cents, lifetime_uses")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const extUsed = (profile.ext_free_extract as number) || 0
    const balanceCents = (profile.balance_cents as number) || 0
    const lifetimeUses = (profile.lifetime_uses as number) || 0
    const EXT_FREE_LIMIT = 10

    let usedFree = false
    let remaining: number

    if (extUsed < EXT_FREE_LIMIT) {
      // Free extension extraction
      await supabaseAdmin
        .from("profiles")
        .update({
          ext_free_extract: extUsed + 1,
          lifetime_uses: lifetimeUses + 1,
        })
        .eq("id", user.id)
      usedFree = true
      remaining = EXT_FREE_LIMIT - extUsed - 1
    } else if (balanceCents > 0) {
      // Paid extraction
      const cost = lifetimeUses < 100 ? 20 : lifetimeUses < 1000 ? 10 : 5
      if (balanceCents < cost) {
        return NextResponse.json(
          { error: "Credits exhausted. Visit imagenary.ai/pricing to top up.", code: "USAGE_LIMIT", remaining: 0 },
          { status: 402 }
        )
      }
      await supabaseAdmin
        .from("profiles")
        .update({
          balance_cents: balanceCents - cost,
          lifetime_uses: lifetimeUses + 1,
        })
        .eq("id", user.id)
      remaining = balanceCents - cost
    } else {
      return NextResponse.json(
        { error: "Free extractions used up. Visit imagenary.ai/pricing to top up.", code: "USAGE_LIMIT", remaining: 0 },
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

    return NextResponse.json({
      result: text,
      remaining,
      usedFree,
    })
  } catch (e) {
    console.error("Extension extract API error:", e)
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
