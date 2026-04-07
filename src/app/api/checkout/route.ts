import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getUser } from "@/lib/supabase-server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
  })
}

interface BundleConfig {
  credits: number
  priceInCents: number
  label: string
  mode: "payment" | "subscription"
  interval?: "month"
}

const BUNDLES: Record<string, BundleConfig> = {
  starter: {
    credits: 20,
    priceInCents: 500,
    label: "20 Uses",
    mode: "payment",
  },
  standard: {
    credits: 100,
    priceInCents: 1000,
    label: "100 Uses/month",
    mode: "subscription",
    interval: "month",
  },
  pro: {
    credits: 2000,
    priceInCents: 10000,
    label: "2,000 Uses/month",
    mode: "subscription",
    interval: "month",
  },
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Sign in to purchase" }, { status: 401 })
    }

    const { bundle } = await req.json()

    if (!bundle || !BUNDLES[bundle]) {
      return NextResponse.json({ error: "Invalid bundle" }, { status: 400 })
    }

    const b = BUNDLES[bundle]
    const origin = req.headers.get("origin") || "https://imagenary.ai"
    const stripe = getStripe()

    if (b.mode === "subscription") {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: b.priceInCents,
              recurring: { interval: "month" },
              product_data: {
                name: `Imagenary ${b.label}`,
                description: `${b.credits} uses per month across all Imagenary tools`,
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
        subscription_data: {
          metadata: {
            credits: String(b.credits),
            bundle,
            user_id: user.id,
          },
        },
        success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
      })

      return NextResponse.json({ url: session.url })
    }

    // One-time payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: b.priceInCents,
            product_data: {
              name: `Imagenary ${b.label}`,
              description: `${b.credits} uses across all Imagenary tools — never expires`,
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
