/**
 * Persistent storage for tool results.
 *
 * Strategy: input + output bytes uploaded to storybunny-vm (i.imagenary.ai),
 * one row per generation in public.tool_results. Replicate URLs are temporary;
 * our copies aren't.
 */

import sharp from "sharp"
import { createClient as createAdminClient } from "@supabase/supabase-js"

const UPLOAD_ENDPOINT = process.env.IMAGENARY_UPLOAD_ENDPOINT || "https://i.imagenary.ai/upload"

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error("Supabase URL + service role key required")
  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface UploadResult {
  url: string
  filename: string
}

async function uploadBytes(
  bytes: Buffer,
  contentType: string,
  prefix: string
): Promise<UploadResult> {
  const secret = process.env.IMAGENARY_UPLOAD_SECRET
  if (!secret) throw new Error("IMAGENARY_UPLOAD_SECRET not configured")

  const ext = contentType.includes("png") ? "png"
    : contentType.includes("webp") ? "webp"
    : "jpg"
  const filename = `upload.${ext}`

  const form = new FormData()
  const blob = new Blob([new Uint8Array(bytes)], { type: contentType })
  form.append("file", blob, filename)
  form.append("prefix", prefix)

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: { "X-Service-Auth": secret },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Upload failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const data = await res.json() as { ok: boolean; url: string; filename: string }
  if (!data.ok || !data.url) throw new Error("Upload returned no URL")
  return { url: data.url, filename: data.filename }
}

/**
 * Resize a buffer to a JPEG suitable for archival. Inputs from users can be
 * 10MB+; we cap at 1600px long edge q85 to save storage without losing detail.
 */
async function resizeForStorage(buffer: Buffer, contentType?: string): Promise<{ bytes: Buffer; contentType: string }> {
  try {
    const out = await sharp(buffer)
      .rotate()  // honor EXIF
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer()
    return { bytes: out, contentType: "image/jpeg" }
  } catch {
    // If sharp can't decode (rare — animated WebP, exotic format), pass through.
    return { bytes: buffer, contentType: contentType || "application/octet-stream" }
  }
}

export interface PersistArgs {
  userId: string
  tool: "refresh" | "touchup" | "generate"
  prompt?: string | null
  inputBuffer: Buffer
  inputMime?: string
  outputUrl: string  // Replicate URL we need to fetch + re-host
  metadata?: Record<string, unknown>
}

export interface PersistResult {
  id: string
  inputUrl: string
  outputUrl: string
}

export async function persistResult(args: PersistArgs): Promise<PersistResult> {
  // 1. Resize + upload input
  const input = await resizeForStorage(args.inputBuffer, args.inputMime)
  const uploadedInput = await uploadBytes(input.bytes, input.contentType, args.tool)

  // 2. Fetch result from Replicate, upload (no resize — already optimized)
  const r = await fetch(args.outputUrl)
  if (!r.ok) throw new Error(`Fetch result image failed (${r.status})`)
  const outputBuffer = Buffer.from(await r.arrayBuffer())
  const outputContentType = r.headers.get("content-type") || "image/jpeg"
  const uploadedOutput = await uploadBytes(outputBuffer, outputContentType, args.tool)

  // 3. Insert DB row
  const admin = getAdmin()
  const { data, error } = await admin
    .from("tool_results")
    .insert({
      user_id: args.userId,
      tool: args.tool,
      prompt: args.prompt || null,
      input_url: uploadedInput.url,
      output_url: uploadedOutput.url,
      metadata: args.metadata || null,
    })
    .select("id")
    .single()
  if (error || !data) throw error || new Error("DB insert failed")

  return {
    id: data.id as string,
    inputUrl: uploadedInput.url,
    outputUrl: uploadedOutput.url,
  }
}

export interface ToolResult {
  id: string
  tool: string
  prompt: string | null
  input_url: string
  output_url: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function listResults(userId: string, tool?: string, limit = 50): Promise<ToolResult[]> {
  const admin = getAdmin()
  let q = admin
    .from("tool_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (tool) q = q.eq("tool", tool)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as ToolResult[]
}

export async function deleteResult(userId: string, id: string): Promise<void> {
  const admin = getAdmin()
  const { error } = await admin
    .from("tool_results")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)  // belt + suspenders: enforce ownership even with service role
  if (error) throw error
}
