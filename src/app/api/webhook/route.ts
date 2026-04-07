import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { addCredits } from "@/lib/usage"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    console.error("Webhook signature verification failed:", e)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const credits = parseInt(session.metadata?.credits || "0", 10)

    if (credits > 0) {
      // Add credits to the user's account
      // NOTE: This currently uses cookies. When we add user auth,
      // we'll look up the user by session.customer_email and credit their account.
      await addCredits(credits)
      console.log(`Added ${credits} credits from Stripe session ${session.id}`)
    }
  }

  return NextResponse.json({ received: true })
}
