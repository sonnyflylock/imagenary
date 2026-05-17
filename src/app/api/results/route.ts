import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"
import { listResults } from "@/lib/results-store"

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const tool = searchParams.get("tool") || undefined
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)
  try {
    const results = await listResults(user.id, tool, limit)
    return NextResponse.json({ results })
  } catch (e) {
    const err = e as { message?: string; code?: string; details?: string; hint?: string }
    console.error("[/api/results] list failed:", err)
    return NextResponse.json(
      {
        error: err.message || "Failed to list results",
        code: err.code,
        details: err.details,
        hint: err.hint,
      },
      { status: 500 }
    )
  }
}
