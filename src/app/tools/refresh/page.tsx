import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, ArrowRight, Upload, Sparkles, Download, Check } from "lucide-react"

export const metadata = {
  title: "Image Refresh — Instantly Revive Old Photos | Imagenary.ai",
  description:
    "Upload a blurry or dated photo and get a crisp, high-quality version back. AI-powered image restoration and enhancement.",
}

export default function RefreshPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <RefreshCw className="mr-1 size-3" /> New on Imagenary
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Old photo?{" "}
              <span className="text-emerald-500">Make it new.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload any blurry, low-resolution, or dated photo. AI
              intelligently upscales, sharpens, and restores it — preserving the
              original subject while dramatically improving quality. Perfect for
              profile pictures, headshots, and old memories.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/app/refresh"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 px-6 text-base font-medium text-white hover:bg-emerald-600 transition-colors"
              >
                Refresh an Image <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Upload,
              title: "1. Upload your photo",
              body: "Drop in any image — blurry selfie, old headshot, compressed profile pic. JPEG, PNG, WebP all supported.",
            },
            {
              icon: Sparkles,
              title: "2. AI enhances it",
              body: "Our model analyzes the image, reconstructs detail, fixes compression artifacts, balances lighting, and sharpens features.",
            },
            {
              icon: Download,
              title: "3. Download the result",
              body: "Get back a crisp, high-quality version. Same person, same pose — just dramatically better quality.",
            },
          ].map((step) => (
            <Card key={step.title}>
              <CardContent className="pt-4">
                <step.icon className="size-8 text-emerald-500 mb-3" />
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What it fixes */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            What Image Refresh fixes
          </h2>
          <div className="mx-auto max-w-lg space-y-3">
            {[
              "Blurry or out-of-focus photos",
              "Low-resolution / heavily compressed images",
              "Old profile pictures that look dated",
              "Grainy photos from bad lighting",
              "Webcam screenshots and video stills",
              "Scanned printed photos",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <Check className="size-4 text-emerald-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
