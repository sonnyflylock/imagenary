import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { extractText } from "@/lib/image-ai"

const FREE_LIMIT = 10

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const installId = formData.get("installId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!installId || installId.length < 10) {
      return NextResponse.json(
        { error: "Missing or invalid installId" },
        { status: 400 }
      )
    }

    const ip = getIp(req)
    const supabase = getSupabase()

    // Upsert the install record and get current usage
    const { data: install, error: fetchErr } = await supabase
      .from("ext_installs")
      .select("uses")
      .eq("install_id", installId)
      .single()

    let currentUses = 0

    if (fetchErr && fetchErr.code === "PGRST116") {
      // Row not found — insert new install
      const { error: insertErr } = await supabase
        .from("ext_installs")
        .insert({ install_id: installId, uses: 0, ip })

      if (insertErr) {
        console.error("ext_installs insert error:", insertErr)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
      }
    } else if (fetchErr) {
      console.error("ext_installs fetch error:", fetchErr)
      return NextResponse.json({ error: "Server error" }, { status: 500 })
    } else {
      currentUses = install.uses
    }

    // Check limit
    if (currentUses >= FREE_LIMIT) {
      return NextResponse.json(
        {
          error: "Free extractions used up. Sign in at imagenary.ai or add your own API key.",
          remaining: 0,
          exhausted: true,
        },
        { status: 429 }
      )
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    // Extract text using Gemini (fast model)
    const result = await extractText(base64, "fast")

    // Increment usage
    const newUses = currentUses + 1
    await supabase
      .from("ext_installs")
      .update({ uses: newUses, last_used: new Date().toISOString(), ip })
      .eq("install_id", installId)

    return NextResponse.json({
      result,
      remaining: FREE_LIMIT - newUses,
      anonymous: true,
    })
  } catch (err: unknown) {
    console.error("extract-free error:", err)
    const message = err instanceof Error ? err.message : "Extraction failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
