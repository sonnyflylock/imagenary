import { NextResponse } from "next/server"
import { getCurrentUserId, createPickerSession } from "@/lib/google-photos"

function pickerError(msg: string) {
  let status = 500
  if (msg.includes("has not connected")) status = 403
  else if (/\((401|UNAUTHENTICATED)/.test(msg)) status = 401
  else if (/\((403|PERMISSION_DENIED)/.test(msg)) status = 403
  return NextResponse.json({ error: msg }, { status })
}

export async function POST() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  try {
    const session = await createPickerSession(userId)
    return NextResponse.json(session)
  } catch (e) {
    return pickerError(e instanceof Error ? e.message : "Failed to create picker session")
  }
}
