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

  // One-time purchase completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const credits = parseInt(session.metadata?.credits || "0", 10)
    const userId = session.metadata?.user_id

    if (credits > 0 && userId) {
      await addCredits(userId, credits)
      console.log(`Added ${credits} credits for user ${userId} from checkout ${session.id}`)
    }
  }

  // Monthly subscription invoice paid (recurring credit top-up)
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription }
    const sub = invoice.subscription
    if (sub) {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(sub as string)
      const credits = parseInt(subscription.metadata?.credits || "0", 10)
      const userId = subscription.metadata?.user_id

      if (credits > 0 && userId) {
        await addCredits(userId, credits)
        console.log(`Added ${credits} monthly credits for user ${userId} from invoice ${invoice.id}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}
