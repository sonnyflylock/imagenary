import { NextResponse } from "next/server"
import { getCurrentUserId, getConnectionStatus, getStoredTokens } from "@/lib/google-photos"

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ connected: false, email: null }, { status: 200 })
  }
  const status = await getConnectionStatus(userId)
  const row = await getStoredTokens(userId)
  return NextResponse.json({
    ...status,
    connectedAt: row?.connected_at || null,
    expiresAt: row?.expires_at || null,
    hasPhotosReadonly: !!row?.scope?.includes("photoslibrary.readonly"),
    hasPhotosAppendonly: !!row?.scope?.includes("photoslibrary.appendonly"),
  })
}
