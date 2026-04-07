"use client"

import { Check, ArrowRight, Loader2, Zap, Gift } from "lucide-react"
import { useState } from "react"

const topups = [
  { amount: 5, bundle: "topup5", label: "$5", uses: "25 uses" },
  { amount: 10, bundle: "topup10", label: "$10", uses: "50 uses", popular: true },
  { amount: 20, bundle: "topup20", label: "$20", uses: "100+ uses" },
  { amount: 50, bundle: "topup50", label: "$50", uses: "250+ uses" },
]

const tiers = [
  { range: "First 100 uses", price: "$0.20", saved: "" },
  { range: "101 – 1,000 uses", price: "$0.10", saved: "Save 50%" },
  { range: "1,001+ uses", price: "$0.05", saved: "Save 75%" },
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
    <section className="mx-auto max-w-5xl px-4 py-20 lg:py-28">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Start free. Top up when you need more. No subscriptions, no surprises.
        </p>
      </div>

      {/* How it works — 3-step strip */}
      <div className="grid gap-8 sm:grid-cols-3 mb-20">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-accent/10">
            <Gift className="size-5 text-accent" />
          </div>
          <h3 className="font-semibold">1. Try for free</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            5 free uses across all tools. See a preview instantly, full result emailed.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-accent/10">
            <Zap className="size-5 text-accent" />
          </div>
          <h3 className="font-semibold">2. Top up your balance</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add funds starting at $5. Get instant full results. Balance never expires.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-accent/10">
            <ArrowRight className="size-5 text-accent" />
          </div>
          <h3 className="font-semibold">3. Use more, pay less</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Price per use drops automatically as you hit volume milestones.
          </p>
        </div>
      </div>

      {/* Top-up buttons — main CTA */}
      <div className="max-w-2xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-center mb-2">Add balance</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Choose an amount — works across every tool on the platform.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topups.map((t) => (
            <button
              key={t.bundle}
              onClick={() => handleBuy(t.bundle)}
              disabled={loading === t.bundle}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-6 transition-all hover:shadow-md disabled:opacity-50 ${
                t.popular
                  ? "border-accent bg-accent/5 shadow-sm"
                  : "border-border hover:border-accent/40"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-2.5 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                  Popular
                </span>
              )}
              {loading === t.bundle ? (
                <Loader2 className="size-5 animate-spin text-accent" />
              ) : (
                <>
                  <span className="text-2xl font-bold">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.uses}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Volume tiers */}
      <div className="max-w-2xl mx-auto mb-20">
        <h2 className="text-2xl font-bold text-center mb-2">Volume discounts</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          The more you use, the less each use costs. Tiers are based on your lifetime usage.
        </p>
        <div className="rounded-xl border overflow-hidden">
          <div className="grid grid-cols-3 bg-muted/50 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Usage</span>
            <span className="text-center">Per use</span>
            <span className="text-right">Savings</span>
          </div>
          {tiers.map((tier, i) => (
            <div
              key={tier.range}
              className={`grid grid-cols-3 items-center px-6 py-4 ${
                i < tiers.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="text-sm font-medium">{tier.range}</span>
              <span className="text-center text-lg font-bold">{tier.price}</span>
              <span className="text-right">
                {tier.saved ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                    {tier.saved}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Starting rate</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Free tier details */}
      <div className="max-w-2xl mx-auto rounded-xl border bg-muted/20 p-8 mb-20">
        <div className="flex items-start gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 shrink-0">
            <Gift className="size-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Free tier</h3>
            <p className="mt-1 text-sm text-muted-foreground mb-4">
              Every new account gets 5 free uses. No credit card required.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "All 7 tools included",
                "Preview shown instantly",
                "Full result emailed to you",
                "No time limit",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/signin"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Get started free <ArrowRight className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* FAQ-style extras */}
      <div className="max-w-2xl mx-auto grid gap-6 sm:grid-cols-2 mb-20">
        <div className="rounded-xl border p-6">
          <h3 className="font-semibold mb-2">What counts as 1 use?</h3>
          <p className="text-sm text-muted-foreground">
            One run of any tool — extract text, refresh an image, describe a photo, upload to URL, touch-up, generate, or create a storybook page.
          </p>
        </div>
        <div className="rounded-xl border p-6">
          <h3 className="font-semibold mb-2">Does my balance expire?</h3>
          <p className="text-sm text-muted-foreground">
            No. Your balance stays on your account forever. Use it whenever you need it.
          </p>
        </div>
        <div className="rounded-xl border p-6">
          <h3 className="font-semibold mb-2">How do volume discounts work?</h3>
          <p className="text-sm text-muted-foreground">
            As your total lifetime uses grow, the cost per use drops automatically. After 100 uses, you pay half. After 1,000, you pay a quarter.
          </p>
        </div>
        <div className="rounded-xl border p-6">
          <h3 className="font-semibold mb-2">Can I use any tool?</h3>
          <p className="text-sm text-muted-foreground">
            Yes. Your balance works across every tool on the platform. One balance, all tools.
          </p>
        </div>
      </div>

      {/* Enterprise */}
      <div className="text-center">
        <h2 className="text-xl font-bold">Need enterprise volume?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Custom pricing, API access, SLAs, and dedicated support.{" "}
          <a href="mailto:hello@imagenary.ai" className="text-accent hover:underline">
            Contact us
          </a>
          .
        </p>
      </div>
    </section>
  )
}
