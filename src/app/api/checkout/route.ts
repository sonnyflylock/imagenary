import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getUser } from "@/lib/supabase-server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
  })
}

const TOPUPS: Record<string, { amountCents: number; label: string }> = {
  topup5:  { amountCents: 500,  label: "$5 Top-Up" },
  topup10: { amountCents: 1000, label: "$10 Top-Up" },
  topup20: { amountCents: 2000, label: "$20 Top-Up" },
  topup50: { amountCents: 5000, label: "$50 Top-Up" },
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Sign in to purchase" }, { status: 401 })
    }

    const { bundle } = await req.json()

    if (!bundle || !TOPUPS[bundle]) {
      return NextResponse.json({ error: "Invalid bundle" }, { status: 400 })
    }

    const t = TOPUPS[bundle]
    const origin = req.headers.get("origin") || "https://imagenary.ai"
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: t.amountCents,
            product_data: {
              name: `Imagenary ${t.label}`,
              description: `${t.label} — balance for all Imagenary tools, never expires`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        amount_cents: String(t.amountCents),
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
