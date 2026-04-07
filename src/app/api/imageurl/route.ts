import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const BUCKET = "image-uploads"

function getSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
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

    return NextResponse.json({
      url: brandedUrl,
      filename,
      size: file.size,
      type: file.type,
    })
  } catch (e) {
    console.error("Image URL API error:", e)
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
