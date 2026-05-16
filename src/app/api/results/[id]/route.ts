import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { deleteResult } from "@/lib/results-store"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const { id } = await params
  try {
    await deleteResult(user.id, id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    )
  }
}
