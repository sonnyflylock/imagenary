import { NextResponse, type NextRequest } from "next/server"
import { randomBytes } from "crypto"
import {
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_PHOTOS_SCOPES,
  getRedirectUri,
  getCurrentUserId,
  disconnect,
} from "@/lib/google-photos"

// GET /api/connect/google-photos?next=/app/settings
// Initiates Google OAuth for Photos scopes. Requires the user to be signed in.
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId()
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get("next") || "/app/settings"

  if (!userId) {
    return NextResponse.redirect(
      `${origin}/signin?next=${encodeURIComponent(
        `/api/connect/google-photos?next=${encodeURIComponent(next)}`
      )}`
    )
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_OAUTH_CLIENT_ID not configured" },
      { status: 500 }
    )
  }

  const csrf = randomBytes(24).toString("base64url")
  const state = Buffer.from(JSON.stringify({ csrf, next })).toString("base64url")

  const url = new URL(GOOGLE_OAUTH_AUTH_URL)
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", getRedirectUri(origin))
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", GOOGLE_PHOTOS_SCOPES)
  url.searchParams.set("access_type", "offline")
  url.searchParams.set("prompt", "consent")
  url.searchParams.set("include_granted_scopes", "true")
  url.searchParams.set("state", state)

  const res = NextResponse.redirect(url.toString())
  res.cookies.set("gph_csrf", csrf, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  })
  return res
}

// DELETE /api/connect/google-photos — disconnect the current user.
export async function DELETE() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  await disconnect(userId)
  return NextResponse.json({ ok: true })
}
