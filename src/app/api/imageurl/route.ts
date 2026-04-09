import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"
import { logUsage } from "@/lib/usage-log"
import { rateLimit } from "@/lib/rate-limit"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const BUCKET = "image-uploads"

// 10 uploads per minute per IP
const UPLOAD_LIMIT = 10
const UPLOAD_WINDOW = 60 * 1000

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
  const ua = req.headers.get("user-agent") || null
  const { ok } = rateLimit(`upload:${ip}`, UPLOAD_LIMIT, UPLOAD_WINDOW)
  if (!ok) {
    return NextResponse.json({ error: "Too many uploads, try again later" }, { status: 429 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png"
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50)
    const now = new Date()
    const ts = now.toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15)
    const filename = `${ts}-${baseName}-${nanoid(6)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const supabase = getSupabase()

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: "86400", // 24h cache
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Upload failed: " + uploadError.message },
        { status: 500 }
      )
    }

    const brandedUrl = `https://www.imagenary.ai/i/${filename}`

    logUsage({
      tool: "imageurl",
      fileSize: file.size,
      fileType: file.type,
      success: true,
      durationMs: Date.now() - startTime,
      ipAddress: ip,
      userAgent: ua,
      metadata: { filename, brandedUrl },
    })

    return NextResponse.json({
      url: brandedUrl,
      filename,
      size: file.size,
      type: file.type,
    })
  } catch (e) {
    console.error("Image URL API error:", e)
    const message = e instanceof Error ? e.message : "Internal server error"

    logUsage({
      tool: "imageurl",
      success: false,
      error: message,
      durationMs: Date.now() - startTime,
      ipAddress: ip,
      userAgent: ua,
    })

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
