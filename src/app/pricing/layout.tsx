import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pay-as-you-go pricing for Imagenary.ai — 5 free uses, then $0.20/use with volume discounts. No subscriptions.",
  openGraph: {
    title: "Pricing — Imagenary.ai",
    description: "Simple pay-as-you-go pricing. 5 free uses, then top up your balance. Volume discounts at 100+ and 1,000+ uses.",
  },
  alternates: {
    canonical: "https://www.imagenary.ai/pricing",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
