import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { addCredits } from "@/lib/usage"
import { createServerSupabase } from "@/lib/supabase-server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
  })
}

/** Look up Supabase user ID by email (fallback when metadata is missing) */
async function getUserIdByEmail(email: string): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single()
  return data?.id || null
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

  // One-time purchase or subscription first payment
  if (event.type === "checkout.session.completed") {
    // Use raw object to avoid API version type mismatches
    const session = event.data.object as unknown as Record<string, unknown>
    const metadata = (session.metadata || {}) as Record<string, string>
    const details = session.customer_details as Record<string, unknown> | undefined
    const customerEmail = (session.customer_email as string) || (details?.email as string) || ""

    const credits = parseInt(metadata.credits || "0", 10)
    let userId = metadata.user_id || ""

    // Fallback: look up user by email if metadata missing
    if (!userId && customerEmail) {
      userId = (await getUserIdByEmail(customerEmail)) || ""
      console.log(`Webhook fallback: looked up user by email ${customerEmail} -> ${userId || "not found"}`)
    }

    console.log(`Webhook checkout.session.completed: credits=${credits}, userId=${userId}, email=${customerEmail}, metadata=${JSON.stringify(metadata)}`)

    if (credits > 0 && userId) {
      await addCredits(userId, credits)
      console.log(`Added ${credits} credits for user ${userId}`)
    } else {
      console.warn(`Webhook: could not add credits. credits=${credits}, userId=${userId}`)
    }
  }

  // Monthly subscription invoice paid (recurring credit top-up)
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as unknown as Record<string, unknown>
    const sub = invoice.subscription as string | undefined
    if (sub) {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(sub)
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
