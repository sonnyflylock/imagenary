import { NextResponse, type NextRequest } from "next/server"
import {
  getCurrentUserId,
  getPickerSession,
  listPickedItems,
  deletePickerSession,
} from "@/lib/google-photos"

function pickerError(msg: string) {
  let status = 500
  if (msg.includes("has not connected")) status = 403
  else if (/\((401|UNAUTHENTICATED)/.test(msg)) status = 401
  else if (/\((403|PERMISSION_DENIED)/.test(msg)) status = 403
  return NextResponse.json({ error: msg }, { status })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  const { id } = await params
  try {
    const session = await getPickerSession(userId, id)
    if (session.mediaItemsSet) {
      const items = await listPickedItems(userId, id)
      return NextResponse.json({ session, items: items.mediaItems })
    }
    return NextResponse.json({ session, items: null })
  } catch (e) {
    return pickerError(e instanceof Error ? e.message : "Failed to poll picker session")
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  const { id } = await params
  try {
    await deletePickerSession(userId, id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return pickerError(e instanceof Error ? e.message : "Failed to delete picker session")
  }
}
