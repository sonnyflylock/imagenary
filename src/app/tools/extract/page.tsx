import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScanText, Eye, Brain, Cpu, ArrowRight, FileText, Receipt, Camera } from "lucide-react"

export const metadata = {
  title: "Text Extractor — AI OCR & Image Intelligence | Imagenary.ai",
  description:
    "Pull text from any image with 3-tier AI vision: fast OCR, smart Gemini extraction, or deep GPT-4o analysis.",
}

const tiers = [
  {
    name: "Fast OCR",
    engine: "Google Cloud Vision",
    icon: Cpu,
    speed: "< 1s",
    cost: "Free tier",
    description:
      "Pure text extraction. Best for clean documents, receipts, and screenshots with readable text.",
    useCases: ["Receipts & invoices", "Business cards", "Printed documents"],
  },
  {
    name: "Smart Extract",
    engine: "Gemini 2.5 Flash",
    icon: Eye,
    speed: "2-4s",
    cost: "Standard",
    description:
      "Vision + reasoning. Understands layout, tables, handwriting, and can answer questions about what it sees.",
    useCases: ["Handwritten notes", "Complex layouts", "Tables & forms"],
  },
  {
    name: "Deep Analysis",
    engine: "GPT-4o",
    icon: Brain,
    speed: "3-6s",
    cost: "Premium",
    description:
      "Full multimodal reasoning. Analyzes diagrams, charts, memes, art — anything visual. Can follow custom prompts.",
    useCases: ["Charts & diagrams", "Scene understanding", "Custom analysis"],
  },
]

export default function ExtractPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <ScanText className="mr-1 size-3" /> Text Extractor
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Extract text & meaning{" "}
              <span className="text-blue-500">from any image</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Three tiers of AI vision — from blazing-fast OCR to deep
              multimodal analysis. Upload an image, pick your tier, and get
              structured results in seconds.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/app/extract"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-500 px-6 text-base font-medium text-white hover:bg-blue-600 transition-colors"
              >
                Try Text Extractor <ArrowRight className="size-4" />
              </a>
              <a
                href="/api-docs"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-medium hover:bg-muted transition-colors"
              >
                API Docs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Three tiers */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8">Three tiers of vision</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <tier.icon className="size-7 text-blue-500" />
                  <span className="text-xs text-muted-foreground">{tier.speed}</span>
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{tier.engine}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
                <ul className="mt-4 space-y-1">
                  {tier.useCases.map((uc) => (
                    <li key={uc} className="flex items-center gap-2 text-sm">
                      <FileText className="size-3 text-accent" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            Common use cases
          </h2>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <Receipt className="mx-auto size-8 text-blue-500 mb-3" />
              <h3 className="font-semibold">Expense Tracking</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Snap a photo of a receipt, get structured data back: merchant,
                total, line items, date.
              </p>
            </div>
            <div>
              <FileText className="mx-auto size-8 text-blue-500 mb-3" />
              <h3 className="font-semibold">Document Digitization</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Convert printed or handwritten documents to editable text.
                Supports 100+ languages.
              </p>
            </div>
            <div>
              <Camera className="mx-auto size-8 text-blue-500 mb-3" />
              <h3 className="font-semibold">Screenshot Intelligence</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Extract data from charts, dashboards, and UI screenshots.
                Ask questions about what you see.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
