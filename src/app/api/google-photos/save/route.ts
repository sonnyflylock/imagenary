import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUserId, uploadToGooglePhotos } from "@/lib/google-photos"

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  let body: { resultUrl?: string; toolName?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const { resultUrl, toolName } = body
  if (!resultUrl) {
    return NextResponse.json({ error: "resultUrl required" }, { status: 400 })
  }

  try {
    const imgRes = await fetch(resultUrl)
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch result image (${imgRes.status})` },
        { status: 502 }
      )
    }
    const bytes = await imgRes.arrayBuffer()
    const mimeType = imgRes.headers.get("content-type") || "image/jpeg"
    const description = toolName ? `Created by Imagenary — ${toolName}` : "Created by Imagenary"
    const result = await uploadToGooglePhotos(userId, bytes, mimeType, description)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save to Google Photos"
    const status = msg.includes("has not connected") ? 403 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
