import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Pricing | Imagenary.ai",
  description:
    "Free to start. Pay as you grow. Simple pricing for AI image tools.",
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try every tool. No credit card required.",
    features: [
      "10 uses per tool per month",
      "All 5 tools included",
      "Standard quality output",
      "Web interface",
    ],
    cta: "Get Started",
    href: "/tools/refresh",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For creators and professionals who need more.",
    features: [
      "200 uses per tool per month",
      "All 5 tools included",
      "High-resolution output",
      "Priority processing",
      "API access (1,000 calls/mo)",
      "Batch uploads",
    ],
    cta: "Start Pro Trial",
    href: "/tools/refresh",
    highlight: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "/month",
    description: "For teams and apps that integrate via API.",
    features: [
      "Unlimited web usage",
      "All 5 tools included",
      "Maximum resolution output",
      "API access (10,000 calls/mo)",
      "Webhook notifications",
      "Dedicated support",
      "Custom branding (white-label)",
    ],
    cta: "Contact Sales",
    href: "mailto:hello@imagenary.ai",
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Free to start. No credit card required. Upgrade when you need more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.highlight
                ? "ring-2 ring-accent relative"
                : ""
            }
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">
                Most Popular
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
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="size-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <a
                href={plan.href}
                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                {plan.cta} <ArrowRight className="size-3" />
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold">Need more volume?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enterprise plans with custom limits, SLAs, and on-premise deployment
          available.{" "}
          <a href="mailto:hello@imagenary.ai" className="text-accent hover:underline">
            Contact us
          </a>
          .
        </p>
      </div>
    </section>
  )
}
