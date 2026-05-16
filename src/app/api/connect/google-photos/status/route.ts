import { NextResponse } from "next/server"
import { getCurrentUserId, getConnectionStatus } from "@/lib/google-photos"

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ connected: false, email: null }, { status: 200 })
  }
  const status = await getConnectionStatus(userId)
  return NextResponse.json(status)
}
