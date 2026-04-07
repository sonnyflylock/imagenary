import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-server"
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/api-keys"

/** List keys */
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const keys = await listApiKeys(user.id)
  return NextResponse.json({ keys })
}

/** Create a new key */
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = (body.name as string) || "Default"

  const { key, prefix } = await createApiKey(user.id, name)
  return NextResponse.json({ key, prefix })
}

/** Revoke a key */
export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const keyId = body.id as number
  if (!keyId) return NextResponse.json({ error: "Missing key id" }, { status: 400 })

  await revokeApiKey(user.id, keyId)
  return NextResponse.json({ success: true })
}
