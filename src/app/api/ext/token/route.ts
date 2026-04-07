/**
 * Returns the current user's Supabase access token.
 * Called by the Chrome extension to get a Bearer token for API calls.
 * Uses cookie-based auth (the browser sends cookies automatically).
 */
import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      access_token: session.access_token,
      email: session.user.email,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    )
  }
}
