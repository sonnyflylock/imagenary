import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUserId, listMediaItems } from "@/lib/google-photos"

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const pageToken = searchParams.get("pageToken") || undefined
  try {
    const result = await listMediaItems(userId, pageToken)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to list media"
    let status = 500
    if (msg.includes("has not connected")) status = 403
    else if (/\((401|UNAUTHENTICATED)/.test(msg)) status = 401
    else if (/\((403|PERMISSION_DENIED)/.test(msg)) status = 403
    return NextResponse.json({ error: msg }, { status })
  }
}
