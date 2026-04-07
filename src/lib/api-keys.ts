/**
 * API key management — create, validate, revoke.
 * Keys are stored as SHA-256 hashes; the raw key is only shown once at creation.
 */

import { createClient } from "@supabase/supabase-js"
import { randomBytes, createHash } from "crypto"

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

/** Generate a new API key for a user. Returns the raw key (shown once). */
export async function createApiKey(userId: string, name = "Default") {
  const raw = `imag_${randomBytes(24).toString("base64url")}`
  const hash = hashKey(raw)
  const prefix = raw.slice(0, 12)

  const supabase = getServiceSupabase()
  const { error } = await supabase.from("api_keys").insert({
    user_id: userId,
    key_hash: hash,
    key_prefix: prefix,
    name,
  })

  if (error) throw new Error("Failed to create API key: " + error.message)
  return { key: raw, prefix }
}

/** Validate an API key and return the user_id if valid. */
export async function validateApiKey(key: string): Promise<string | null> {
  const hash = hashKey(key)
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", hash)
    .eq("revoked", false)
    .single()

  if (error || !data) return null

  // Update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", hash)
    .then(() => {})

  return data.user_id
}

/** Revoke an API key by its ID. */
export async function revokeApiKey(userId: string, keyId: number) {
  const supabase = getServiceSupabase()
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked: true })
    .eq("id", keyId)
    .eq("user_id", userId)

  if (error) throw new Error("Failed to revoke key: " + error.message)
}

/** List all keys for a user (never returns the hash). */
export async function listApiKeys(userId: string) {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, key_prefix, name, created_at, last_used_at, revoked")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Failed to list keys: " + error.message)
  return data || []
}
