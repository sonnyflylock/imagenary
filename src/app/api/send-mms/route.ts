import { NextResponse, type NextRequest } from "next/server"
import { nanoid } from "nanoid"
import sharp from "sharp"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerSupabase } from "@/lib/supabase-server"
import { checkAndIncrement } from "@/lib/usage"

// Twilio carriers reliably accept MMS under ~1MB. We aim well below that.
const MAX_LONG_EDGE = 1600
const JPEG_QUALITY = 85
const BUCKET = "image-uploads"

function getStorageClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const userPhone = user.phone
  const phoneConfirmedAt = (user as unknown as { phone_confirmed_at?: string }).phone_confirmed_at
  if (!userPhone || !phoneConfirmedAt) {
    return NextResponse.json(
      { error: "Phone not verified. Verify a phone number on your settings page first." },
      { status: 403 }
    )
  }

  let body: { resultUrl?: string; toolName?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const { resultUrl, toolName } = body
  if (!resultUrl) {
    return NextResponse.json({ error: "resultUrl required" }, { status: 400 })
  }

  const endpoint = process.env.MI_MMS_ENDPOINT
  const secret = process.env.MI_MMS_SERVICE_SECRET
  if (!endpoint || !secret) {
    return NextResponse.json(
      { error: "MMS service not configured (MI_MMS_ENDPOINT / MI_MMS_SERVICE_SECRET)" },
      { status: 500 }
    )
  }

  // Charge 1 credit upfront (free use if available, else tier-priced deduction).
  // Don't refund on Twilio failure — keeps code simple; rare in practice.
  const usage = await checkAndIncrement("send_mms")
  if (!usage.allowed) {
    return NextResponse.json(
      { error: "Out of credits. Top up your balance to send to phone.", code: "USAGE_LIMIT" },
      { status: 402 }
    )
  }

  // ── 1. Fetch the result image from Replicate (or wherever) ──
  let originalBuffer: Buffer
  try {
    const r = await fetch(resultUrl)
    if (!r.ok) {
      return NextResponse.json(
        { error: `Failed to fetch result image (${r.status})` },
        { status: 502 }
      )
    }
    originalBuffer = Buffer.from(await r.arrayBuffer())
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch result image" },
      { status: 502 }
    )
  }

  // ── 2. Resize to MMS-friendly dimensions, encode JPEG ──
  let resizedBuffer: Buffer
  try {
    const sharpResult = await sharp(originalBuffer)
      .rotate()  // honor EXIF orientation
      .resize(MAX_LONG_EDGE, MAX_LONG_EDGE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer()
    resizedBuffer = sharpResult
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Resize failed" },
      { status: 500 }
    )
  }

  // ── 3. Upload to Supabase Storage; build the imagenary.ai/i/<filename> URL ──
  const filename = `mms-${new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15)}-${nanoid(6)}.jpg`
  try {
    const storage = getStorageClient()
    const { error: uploadError } = await storage.storage
      .from(BUCKET)
      .upload(filename, resizedBuffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      })
    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage upload failed" },
      { status: 500 }
    )
  }
  const mediaUrl = `https://www.imagenary.ai/i/${filename}`

  // ── 4. Send via MI's /send_mms_external ──
  const to = userPhone.startsWith("+") ? userPhone : `+${userPhone}`
  try {
    const miRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Auth": secret,
      },
      body: JSON.stringify({
        to,
        media_url: mediaUrl,
        body: toolName ? `Your ${toolName} from Imagenary` : "Your Imagenary result",
        source: "imagenary",
      }),
    })
    const miData = await miRes.json().catch(() => ({}))
    if (!miRes.ok) {
      return NextResponse.json(
        { error: miData.error || `MMS service returned ${miRes.status}` },
        { status: 502 }
      )
    }
    return NextResponse.json({
      ok: true,
      message_sid: miData.message_sid,
      media_url: mediaUrl,
      size_bytes: resizedBuffer.length,
      cost_cents: usage.costCents ?? 0,
      used_free: usage.usedFree,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "MMS send failed" },
      { status: 500 }
    )
  }
}
