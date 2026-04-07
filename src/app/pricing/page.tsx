"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Check, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try every tool. No credit card required.",
    features: [
      "5 free uses per tool",
      "All tools included",
      "Web interface",
      "Results emailed",
    ],
    cta: "Sign In",
    href: "/signin",
    highlight: false,
    bundle: null,
  },
  {
    name: "25 Uses",
    price: "$5",
    period: "one-time",
    description: "A quick top-up for occasional use.",
    features: [
      "25 uses on any tool",
      "$0.20 per use",
      "Instant full results",
      "Never expires",
    ],
    cta: "Buy 25 Uses",
    href: null,
    highlight: false,
    bundle: "starter",
  },
  {
    name: "100 Uses",
    price: "$10",
    period: "/month",
    description: "Best value for regular use.",
    features: [
      "100 uses per month",
      "$0.10 per use",
      "Instant full results",
      "All tools included",
      "API access",
    ],
    cta: "Subscribe",
    href: null,
    highlight: true,
    bundle: "standard",
  },
  {
    name: "2,000 Uses",
    price: "$100",
    period: "/month",
    description: "For power users and teams.",
    features: [
      "2,000 uses per month",
      "$0.05 per use",
      "Instant full results",
      "All tools included",
      "API access",
      "Priority support",
    ],
    cta: "Subscribe",
    href: null,
    highlight: false,
    bundle: "pro",
  },
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
    <section className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          5 free uses per tool to start. Upgrade for instant full results.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlight ? "ring-2 ring-accent relative" : ""}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">
                Best Value
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.bundle ? (
                <button
                  onClick={() => handleBuy(plan.bundle!)}
                  disabled={loading === plan.bundle}
                  className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    plan.highlight
                      ? "bg-accent text-accent-foreground hover:opacity-90"
                      : "border border-border bg-background hover:bg-muted"
                  }`}
                >
                  {loading === plan.bundle ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      {plan.cta} <ArrowRight className="size-3" />
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={plan.href!}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                >
                  {plan.cta} <ArrowRight className="size-3" />
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          1 use = 1 run of any tool. All tools cost 1 use.
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
