import Replicate from "replicate"
import OpenAI from "openai"
import sharp from "sharp"

function getReplicate() {
  return new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export type Tool = "extract" | "refresh" | "touchup" | "generate"
export type ExtractModel = "fast" | "smart" | "deep"

// Replicate model versions (same as CIS production)
const CODEFORMER_VERSION = "cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2"
const SDXL_VERSION = "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc"
const PULID_VERSION = "65ea75658bf120abbbdacab07e89e78a74a6a1b1f504349f4c4e3b01a655ee7a"

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
  extract: 0.003,  // GPT-4o-mini vision
  refresh: 0.02,   // CodeFormer on Replicate
  touchup: 0.03,   // SDXL img2img on Replicate
  generate: 0.05,  // PuLID on Replicate
}

// ---------------------------------------------------------------------------
// Text Extractor (OCR) — uses OpenAI vision models
// ---------------------------------------------------------------------------

export async function extractText(
  imageBase64: string,
  model: ExtractModel = "fast",
  prompt?: string
): Promise<string> {
  const dataUri = `data:image/png;base64,${imageBase64}`
  const defaultPrompt = "Extract all text from this image. Return only the extracted text, preserving layout where possible."

  const modelId = model === "deep" ? "gpt-4o" : "gpt-4o-mini"

  const res = await getOpenAI().chat.completions.create({
    model: modelId,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt || defaultPrompt },
          { type: "image_url", image_url: { url: dataUri } },
        ],
      },
    ],
    max_tokens: 4096,
  })
  return res.choices[0]?.message?.content || ""
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
// Guided Touch-Up — SDXL img2img (from CIS)
// ---------------------------------------------------------------------------

export async function touchUpImage(
  imageDataUri: string,
  prompt: string,
  strength: number = 0.35
): Promise<string> {
  const resized = await resizeDataUri(imageDataUri, 1024)
  // Clamp strength to safe range for SDXL
  const safeStrength = Math.max(0.15, Math.min(0.8, strength))

  const fullPrompt = prompt || "high quality portrait photo, natural lighting, sharp focus, professional photography"

  const output = await getReplicate().run(
    `stability-ai/sdxl:${SDXL_VERSION}`,
    {
      input: {
        image: resized,
        prompt: fullPrompt,
        num_outputs: 1,
        prompt_strength: safeStrength,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        scheduler: "K_EULER",
        disable_safety_checker: true,
      },
    }
  )

  if (Array.isArray(output) && output.length > 0) return String(output[0])
  if (output && typeof output === "object" && typeof output.toString === "function" && !(output instanceof Array)) {
    return output.toString()
  }
  if (typeof output === "string") return output
  throw new Error("No image returned from SDXL")
}

// ---------------------------------------------------------------------------
// Face Generate — PuLID face-preserving generation (from CIS)
// ---------------------------------------------------------------------------

export async function generateWithFace(
  faceImageDataUri: string,
  prompt: string
): Promise<string> {
  const resized = await resizeDataUri(faceImageDataUri, 1024)
  const fullPrompt = prompt || "a person, portrait photo, natural lighting, high quality"

  const output = await getReplicate().run(
    `zsxkib/pulid:${PULID_VERSION}`,
    {
      input: {
        face_image: resized,
        prompt: fullPrompt,
        negative_prompt: "blurry, low quality, distorted, ugly, deformed, cartoon, anime, illustration",
        num_inference_steps: 20,
        guidance_scale: 4,
        id_weight: 1.0,
      },
    }
  )

  if (Array.isArray(output) && output.length > 0) return String(output[0])
  if (output && typeof output === "object" && typeof output.toString === "function" && !(output instanceof Array)) {
    return output.toString()
  }
  if (typeof output === "string") return output
  throw new Error("No image returned from PuLID")
}
