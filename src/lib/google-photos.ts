import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createServerSupabase } from "./supabase-server"

export const GOOGLE_PHOTOS_SCOPES = [
  "https://www.googleapis.com/auth/photoslibrary.readonly",
  "https://www.googleapis.com/auth/photoslibrary.appendonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ")

export const GOOGLE_OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
export const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
export const GOOGLE_OAUTH_REVOKE_URL = "https://oauth2.googleapis.com/revoke"
export const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error("Supabase URL and service role key are required")
  }
  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getRedirectUri(origin: string) {
  return `${origin}/auth/google-photos-callback`
}

export interface GoogleTokenRow {
  user_id: string
  google_email: string | null
  access_token: string
  refresh_token: string
  expires_at: string
  scope: string
  imagenary_album_id: string | null
  connected_at: string | null
}

const PHOTOS_API_BASE = "https://photoslibrary.googleapis.com/v1"
const IMAGENARY_ALBUM_TITLE = "Imagenary"

export async function getStoredTokens(userId: string): Promise<GoogleTokenRow | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("user_google_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()
  if (error) throw error
  return (data as GoogleTokenRow) || null
}

export async function getConnectionStatus(userId: string) {
  const row = await getStoredTokens(userId)
  return {
    connected: !!row,
    email: row?.google_email || null,
    scope: row?.scope || null,
  }
}

interface ExchangeResult {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
  id_token?: string
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<ExchangeResult> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID/SECRET not configured")
  }

  const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token exchange failed (${res.status}): ${body.slice(0, 300)}`)
  }
  return res.json()
}

export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.email || null
  } catch {
    return null
  }
}

export async function persistTokens(
  userId: string,
  result: ExchangeResult,
  fallbackRefreshToken?: string
) {
  const admin = getAdminClient()
  const refreshToken = result.refresh_token || fallbackRefreshToken
  if (!refreshToken) {
    throw new Error(
      "No refresh_token returned by Google. The user must revoke prior access and re-consent " +
        "(we set prompt=consent in the auth URL to avoid this — double-check the OAuth params)."
    )
  }

  const email = await fetchGoogleEmail(result.access_token)
  const expiresAt = new Date(Date.now() + (result.expires_in - 30) * 1000).toISOString()

  const { error } = await admin.from("user_google_tokens").upsert(
    {
      user_id: userId,
      google_email: email,
      access_token: result.access_token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      scope: result.scope,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )
  if (error) throw error
}

async function refreshAccessToken(refreshToken: string): Promise<ExchangeResult> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID/SECRET not configured")
  }
  const res = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token refresh failed (${res.status}): ${body.slice(0, 300)}`)
  }
  return res.json()
}

/**
 * Returns a valid access token for the user, refreshing if the stored one is
 * expired. Throws if the user has no connection or the refresh fails (e.g.,
 * the user revoked access on Google's side).
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const row = await getStoredTokens(userId)
  if (!row) throw new Error("User has not connected Google Photos")

  const expiresAt = new Date(row.expires_at).getTime()
  if (expiresAt > Date.now() + 60_000) {
    return row.access_token
  }

  const refreshed = await refreshAccessToken(row.refresh_token)
  await persistTokens(userId, refreshed, row.refresh_token)
  return refreshed.access_token
}

export async function disconnect(userId: string) {
  const row = await getStoredTokens(userId)
  if (!row) return

  // Best-effort revoke; ignore errors so we still remove the row.
  try {
    await fetch(GOOGLE_OAUTH_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: row.refresh_token }),
    })
  } catch {
    // ignore
  }

  const admin = getAdminClient()
  const { error } = await admin
    .from("user_google_tokens")
    .delete()
    .eq("user_id", userId)
  if (error) throw error
}

/**
 * Get the current Supabase user from cookies (server-side).
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// ---------------------------------------------------------------------------
// Photos Library API
// ---------------------------------------------------------------------------

export interface MediaItem {
  id: string
  baseUrl: string
  mimeType: string
  filename: string
  mediaMetadata?: {
    width?: string
    height?: string
    creationTime?: string
  }
}

export interface MediaListResult {
  mediaItems: MediaItem[]
  nextPageToken: string | null
}

export async function listMediaItems(
  userId: string,
  pageToken?: string,
  pageSize = 50
): Promise<MediaListResult> {
  const accessToken = await getValidAccessToken(userId)
  const url = new URL(`${PHOTOS_API_BASE}/mediaItems`)
  url.searchParams.set("pageSize", String(pageSize))
  if (pageToken) url.searchParams.set("pageToken", pageToken)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Photos list failed (${res.status}): ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  return {
    mediaItems: data.mediaItems || [],
    nextPageToken: data.nextPageToken || null,
  }
}

export async function getMediaItem(userId: string, mediaItemId: string): Promise<MediaItem> {
  const accessToken = await getValidAccessToken(userId)
  const res = await fetch(`${PHOTOS_API_BASE}/mediaItems/${mediaItemId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Photos get failed (${res.status}): ${body.slice(0, 300)}`)
  }
  return res.json()
}

/**
 * Download the binary bytes of a media item at its original resolution.
 */
export async function downloadMediaItem(
  userId: string,
  mediaItemId: string
): Promise<{ bytes: ArrayBuffer; mimeType: string; filename: string }> {
  const item = await getMediaItem(userId, mediaItemId)
  // `=d` requests the original full-size download.
  const url = `${item.baseUrl}=d`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Photos download failed (${res.status}): ${body.slice(0, 200)}`)
  }
  return {
    bytes: await res.arrayBuffer(),
    mimeType: item.mimeType || "image/jpeg",
    filename: item.filename || "photo.jpg",
  }
}

async function ensureImagenaryAlbum(userId: string): Promise<string> {
  const row = await getStoredTokens(userId)
  if (!row) throw new Error("User has not connected Google Photos")
  if (row.imagenary_album_id) return row.imagenary_album_id

  const accessToken = await getValidAccessToken(userId)
  const res = await fetch(`${PHOTOS_API_BASE}/albums`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ album: { title: IMAGENARY_ALBUM_TITLE } }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Album create failed (${res.status}): ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  const albumId = data.id as string

  const admin = getAdminClient()
  await admin
    .from("user_google_tokens")
    .update({ imagenary_album_id: albumId, updated_at: new Date().toISOString() })
    .eq("user_id", userId)

  return albumId
}

/**
 * Upload a binary image to Google Photos and add it to the user's Imagenary album.
 * Returns the created mediaItem.
 */
export async function uploadToGooglePhotos(
  userId: string,
  bytes: ArrayBuffer | Uint8Array,
  mimeType: string,
  description?: string
): Promise<{ mediaItemId: string; productUrl: string | null }> {
  const accessToken = await getValidAccessToken(userId)

  // Step 1 — upload bytes, receive an upload token.
  const uploadRes = await fetch(`${PHOTOS_API_BASE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
      "X-Goog-Upload-Content-Type": mimeType,
      "X-Goog-Upload-Protocol": "raw",
    },
    body: bytes as BodyInit,
  })
  if (!uploadRes.ok) {
    const body = await uploadRes.text()
    throw new Error(`Photos upload failed (${uploadRes.status}): ${body.slice(0, 300)}`)
  }
  const uploadToken = (await uploadRes.text()).trim()
  if (!uploadToken) throw new Error("Empty upload token from Google Photos")

  // Step 2 — create mediaItem in our Imagenary album.
  const albumId = await ensureImagenaryAlbum(userId)
  const createRes = await fetch(`${PHOTOS_API_BASE}/mediaItems:batchCreate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      albumId,
      newMediaItems: [
        {
          description: description || "Created by Imagenary",
          simpleMediaItem: { uploadToken },
        },
      ],
    }),
  })
  if (!createRes.ok) {
    const body = await createRes.text()
    throw new Error(`mediaItems:batchCreate failed (${createRes.status}): ${body.slice(0, 300)}`)
  }
  const data = await createRes.json()
  const result = data.newMediaItemResults?.[0]
  if (!result || result.status?.message && result.status.message !== "Success") {
    throw new Error(
      `batchCreate returned non-success: ${JSON.stringify(result?.status || data).slice(0, 300)}`
    )
  }
  return {
    mediaItemId: result.mediaItem?.id || "",
    productUrl: result.mediaItem?.productUrl || null,
  }
}
