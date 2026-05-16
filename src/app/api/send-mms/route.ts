import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

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

  // Supabase stores phone as digits-only by default — normalize to E.164.
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
        media_url: resultUrl,
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
    return NextResponse.json({ ok: true, message_sid: miData.message_sid })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "MMS send failed" },
      { status: 500 }
    )
  }
}
