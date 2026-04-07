import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getUser } from "@/lib/supabase-server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
  })
}

/**
 * Credit bundles — priced at ~3x+ cost.
 *
 * Cost basis (Replicate): refresh ~$0.02, touchup ~$0.03, generate ~$0.05, extract ~$0.003
 * Blended average per use: ~$0.025
 * 100 credits cost us ~$2.50 → sell for $10 (4x margin)
 */
const BUNDLES: Record<string, { credits: number; priceInCents: number; label: string }> = {
  starter: { credits: 25, priceInCents: 500, label: "25 Credits" },
  standard: { credits: 100, priceInCents: 1000, label: "100 Credits" },
  pro: { credits: 500, priceInCents: 3500, label: "500 Credits" },
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Sign in to purchase credits" }, { status: 401 })
    }

    const { bundle } = await req.json()

    if (!bundle || !BUNDLES[bundle]) {
      return NextResponse.json({ error: "Invalid bundle" }, { status: 400 })
    }

    const b = BUNDLES[bundle]
    const origin = req.headers.get("origin") || "https://imagenary.ai"

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: b.priceInCents,
            product_data: {
              name: `Imagenary ${b.label}`,
              description: `${b.credits} image processing credits for all Imagenary tools`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        credits: String(b.credits),
        bundle,
        user_id: user.id,
      },
      success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error("Checkout error:", e)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
