import { Resend } from "resend"

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set")
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Imagenary <noreply@mail.imagenary.ai>"

/**
 * Send full image result to user's email (free tier preview gate).
 */
export async function sendImageResult({
  to,
  toolName,
  resultUrl,
}: {
  to: string
  toolName: string
  resultUrl: string
}) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your ${toolName} result is ready — Imagenary`,
      html: `
        <div style="font-family: Inter, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 16px;">
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Your ${toolName} result</h2>
          <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
            Here's the full result from your free use. Want instant full results without email?
            <a href="https://www.imagenary.ai/pricing" style="color: #25af97;">Get credits</a>.
          </p>
          <img src="${resultUrl}" alt="${toolName} result" style="width: 100%; border-radius: 8px; border: 1px solid #eee;" />
          <p style="margin-top: 24px; font-size: 12px; color: #999;">
            <a href="https://www.imagenary.ai" style="color: #25af97;">Imagenary.ai</a> — AI image tools for everyone
          </p>
        </div>
      `,
    })
  } catch (e) {
    console.error("Failed to send result email:", e)
  }
}

/**
 * Send full extracted text to user's email (free tier preview gate).
 */
export async function sendTextResult({
  to,
  fullText,
}: {
  to: string
  fullText: string
}) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your Text Extractor result is ready — Imagenary",
      html: `
        <div style="font-family: Inter, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 16px;">
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Your extracted text</h2>
          <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
            Here's the full text from your free use. Want instant full results without email?
            <a href="https://www.imagenary.ai/pricing" style="color: #25af97;">Get credits</a>.
          </p>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; border: 1px solid #eee;">${fullText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <p style="margin-top: 24px; font-size: 12px; color: #999;">
            <a href="https://www.imagenary.ai" style="color: #25af97;">Imagenary.ai</a> — AI image tools for everyone
          </p>
        </div>
      `,
    })
  } catch (e) {
    console.error("Failed to send result email:", e)
  }
}
