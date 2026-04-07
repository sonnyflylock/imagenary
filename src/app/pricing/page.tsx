"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Check, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"

const topups = [
  { amount: 5, bundle: "topup5", label: "$5" },
  { amount: 10, bundle: "topup10", label: "$10" },
  { amount: 20, bundle: "topup20", label: "$20" },
  { amount: 50, bundle: "topup50", label: "$50" },
]

const tiers = [
  { range: "First 100 uses", price: "$0.20", perUse: "per use" },
  { range: "101 – 1,000", price: "$0.10", perUse: "per use" },
  { range: "1,001+", price: "$0.05", perUse: "per use" },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleBuy(bundle: string) {
    setLoading(bundle)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Something went wrong")
      }
    } catch {
      alert("Failed to start checkout")
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 lg:py-28">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Pay as you go
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          5 free uses to start. Then top up your balance — no subscriptions.
        </p>
      </div>

      {/* Free + Pay-go side by side */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto mb-16">
        {/* Free tier */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$0</span>
            </div>
            <CardDescription>Try every tool. No credit card needed.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              {["5 free uses", "All tools included", "Results emailed to you", "Preview shown in-app"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <a
              href="/signin"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
              Sign In <ArrowRight className="size-3" />
            </a>
          </CardFooter>
        </Card>

        {/* Pay-go tier */}
        <Card className="flex flex-col ring-2 ring-accent relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">
            No subscription
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Pay Per Use</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$0.20</span>
              <span className="text-sm text-muted-foreground">per use</span>
            </div>
            <CardDescription>Top up your balance. Use any tool, any time.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              {["Instant full results", "All tools included", "Balance never expires", "Volume discounts below"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <div className="w-full grid grid-cols-4 gap-2">
              {topups.map((t) => (
                <button
                  key={t.bundle}
                  onClick={() => handleBuy(t.bundle)}
                  disabled={loading === t.bundle}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-accent text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading === t.bundle ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t.label
                  )}
                </button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Volume discount tiers */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-center mb-6">Volume discounts</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Price per use decreases automatically as your lifetime usage grows.
        </p>
        <div className="rounded-lg border divide-y">
          {tiers.map((tier) => (
            <div key={tier.range} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-medium">{tier.range}</span>
              <span className="text-sm">
                <span className="font-bold">{tier.price}</span>
                <span className="text-muted-foreground ml-1">{tier.perUse}</span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          1 use = 1 run of any tool. Your balance is deducted at your current tier rate.
        </p>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold">Need more volume?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enterprise plans with custom limits, SLAs, and API access.{" "}
          <a href="mailto:hello@imagenary.ai" className="text-accent hover:underline">
            Contact us
          </a>
          .
        </p>
      </div>
    </section>
  )
}
