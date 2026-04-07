import { NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-server"
import { createClient } from "@supabase/supabase-js"

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from("usage_logs")
    .select("id, created_at, tool, model, success, duration_ms, was_free, error")
    .eq("user_email", user.email)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }

  return NextResponse.json({ logs: data })
}
