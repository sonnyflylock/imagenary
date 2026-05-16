import { NextResponse, type NextRequest } from "next/server"
import {
  exchangeCodeForTokens,
  getCurrentUserId,
  getRedirectUri,
  persistTokens,
} from "@/lib/google-photos"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")
  const errorParam = searchParams.get("error")

  function bail(msg: string, fallbackNext = "/app/settings") {
    return NextResponse.redirect(
      `${origin}${fallbackNext}?google_photos_error=${encodeURIComponent(msg)}`
    )
  }

  if (errorParam) return bail(errorParam)
  if (!code || !stateParam) return bail("missing_code_or_state")

  let parsedState: { csrf?: string; next?: string }
  try {
    parsedState = JSON.parse(Buffer.from(stateParam, "base64url").toString())
  } catch {
    return bail("invalid_state")
  }

  const next = parsedState.next || "/app/settings"
  const cookieCsrf = request.cookies.get("gph_csrf")?.value
  if (!cookieCsrf || cookieCsrf !== parsedState.csrf) {
    return bail("csrf_mismatch", next)
  }

  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.redirect(
      `${origin}/signin?next=${encodeURIComponent(next)}`
    )
  }

  try {
    const tokens = await exchangeCodeForTokens(code, getRedirectUri(origin))
    await persistTokens(userId, tokens)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "exchange_failed"
    return bail(msg, next)
  }

  const res = NextResponse.redirect(`${origin}${next}?google_photos_connected=1`)
  res.cookies.delete("gph_csrf")
  return res
}
