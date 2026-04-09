import Replicate from "replicate"
import OpenAI from "openai"
import sharp from "sharp"

function getReplicate() {
  return new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export type Tool = "extract" | "refresh" | "touchup" | "generate" | "describe"
export type ExtractModel = "fast" | "smart" | "deep"

// Replicate model versions (same as CIS production)
const CODEFORMER_VERSION = "cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2"
const SEEDREAM_VERSION = "e563f451edd459e76456dc2b32d7d2c02176059629759923965f9e86494325f6"

/**
 * Resize a data URI image so the longest edge is <= maxPx.
 * Prevents CUDA OOM on Replicate GPU models.
 */
async function resizeDataUri(dataUri: string, maxPx: number = 1024): Promise<string> {
  const base64 = dataUri.split(",")[1]
  if (!base64) return dataUri

  const buffer = Buffer.from(base64, "base64")
  const img = sharp(buffer)
  const meta = await img.metadata()

  const w = meta.width || 0
  const h = meta.height || 0
  if (w <= maxPx && h <= maxPx) return dataUri

  const resized = await img
    .resize({ width: maxPx, height: maxPx, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer()

  return `data:image/png;base64,${resized.toString("base64")}`
}

/**
 * Approximate cost per operation in USD.
 * Pricing should be >= 3x these costs.
 */
export const COST_PER_OP: Record<Tool, number> = {
  extract: 0.001,  // Gemini Flash 2.5
  describe: 0.001, // Gemini Flash 2.5
  refresh: 0.02,   // CodeFormer on Replicate
  touchup: 0.04,   // Seedream 4.5 on Replicate
  generate: 0.04,  // Seedream 4.5 on Replicate
}

// ---------------------------------------------------------------------------
// Text Extractor (OCR) — uses Gemini Flash 2.5
// ---------------------------------------------------------------------------

const GEMINI_EXTRACT_MODELS: Record<ExtractModel, string> = {
  fast: "gemini-2.5-flash",
  smart: "gemini-2.5-flash",
  deep: "gemini-2.5-pro",
}

export async function extractText(
  imageBase64: string,
  model: ExtractModel = "fast",
  prompt?: string
): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error("GEMINI_API_KEY not configured")

  const defaultPrompt = "Extract all text from this image. Return only the extracted text, preserving layout where possible."
  const geminiModel = GEMINI_EXTRACT_MODELS[model]

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt || defaultPrompt },
            { inline_data: { mime_type: "image/png", data: imageBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("No text could be extracted from the image.")
  return text
}

// ---------------------------------------------------------------------------
// Image Refresh — CodeFormer face restoration (from CIS)
// ---------------------------------------------------------------------------

export async function refreshImage(imageDataUri: string): Promise<string> {
  const resized = await resizeDataUri(imageDataUri, 1536)
  const output = await getReplicate().run(
    `sczhou/codeformer:${CODEFORMER_VERSION}`,
    {
      input: {
        image: resized,
        upscale: 2,
        face_upsample: true,
        background_enhance: true,
        codeformer_fidelity: 0.7,
      },
    }
  )

  // Replicate SDK v1.4+ returns FileOutput objects (ReadableStream with toString())
  if (output && typeof output === "object" && typeof output.toString === "function" && !(output instanceof Array)) {
    return output.toString()
  }
  if (typeof output === "string") return output
  if (Array.isArray(output) && output.length > 0) return String(output[0])
  throw new Error("No image returned from CodeFormer")
}

// ---------------------------------------------------------------------------
// Guided Touch-Up — Seedream 4.5 (from CIS)
// ---------------------------------------------------------------------------

export async function touchUpImage(
  imageDataUri: string,
  prompt: string,
): Promise<string> {
  const resized = await resizeDataUri(imageDataUri, 1024)

  const fullPrompt = prompt || "high quality portrait photo, natural lighting, sharp focus, professional photography"

  const output = await getReplicate().run(
    `bytedance/seedream-4.5:${SEEDREAM_VERSION}`,
    {
      input: {
        prompt: fullPrompt,
        image_input: [resized],
        size: "2K",
        aspect_ratio: "match_input_image",
        disable_safety_checker: true,
      },
    }
  )

  if (Array.isArray(output) && output.length > 0) return String(output[0])
  if (output && typeof output === "object" && typeof output.toString === "function" && !(output instanceof Array)) {
    return output.toString()
  }
  if (typeof output === "string") return output
  throw new Error("No image returned from Seedream")
}

// ---------------------------------------------------------------------------
// Face Generate — Seedream 4.5 with reference image (from CIS)
// ---------------------------------------------------------------------------

export async function generateWithFace(
  faceImageDataUri: string,
  prompt: string
): Promise<string> {
  const resized = await resizeDataUri(faceImageDataUri, 1024)
  const fullPrompt = prompt || "a person, portrait photo, natural lighting, high quality, attractive"

  const output = await getReplicate().run(
    `bytedance/seedream-4.5:${SEEDREAM_VERSION}`,
    {
      input: {
        prompt: fullPrompt,
        image_input: [resized],
        size: "2K",
        aspect_ratio: "match_input_image",
        disable_safety_checker: true,
      },
    }
  )

  if (Array.isArray(output) && output.length > 0) return String(output[0])
  if (output && typeof output === "object" && typeof output.toString === "function" && !(output instanceof Array)) {
    return output.toString()
  }
  if (typeof output === "string") return output
  throw new Error("No image returned from Seedream")
}

// ---------------------------------------------------------------------------
// Image to Text Description — Gemini Flash 2.5
// ---------------------------------------------------------------------------

const GEMINI_DESCRIBE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

const DEFAULT_DESCRIBE_PROMPT =
  "Describe this image in rich, detailed natural language. " +
  "Include the subject, setting, colors, lighting, mood, composition, " +
  "and any notable details. Write the description so that an AI image " +
  "generator could recreate a very similar image from your text alone."

export async function describeImage(
  imageBase64: string,
  prompt?: string
): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error("GEMINI_API_KEY not configured")

  const res = await fetch(`${GEMINI_DESCRIBE_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt || DEFAULT_DESCRIBE_PROMPT },
          { inline_data: { mime_type: "image/png", data: imageBase64 } },
        ],
      }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("No description returned from Gemini")
  return text
}

/**
 * Describe an image from a URL instead of base64.
 * Downloads the image first, then sends to Gemini.
 */
export async function describeImageFromUrl(
  imageUrl: string,
  prompt?: string
): Promise<string> {
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to fetch image from URL: ${imgRes.status}`)
  const buffer = Buffer.from(await imgRes.arrayBuffer())
  const base64 = buffer.toString("base64")
  return describeImage(base64, prompt)
}
