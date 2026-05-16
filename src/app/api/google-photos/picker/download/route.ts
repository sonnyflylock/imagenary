import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUserId, downloadFromBaseUrl } from "@/lib/google-photos"

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  let body: { baseUrl?: string; filename?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (!body.baseUrl) {
    return NextResponse.json({ error: "baseUrl required" }, { status: 400 })
  }
  try {
    const { bytes, mimeType } = await downloadFromBaseUrl(userId, body.baseUrl)
    const safeFilename = (body.filename || "photo.jpg").replace(/[^a-zA-Z0-9._-]/g, "_")
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${safeFilename}"`,
        "Cache-Control": "private, max-age=60",
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to download"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
