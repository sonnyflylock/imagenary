import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { UserCircle, ArrowRight, Upload, MessageSquare, Image, Briefcase, Camera, Heart } from "lucide-react"

export const metadata = {
  title: "Face Generate — AI Portraits from Your Face | Imagenary.ai",
  description:
    "Upload a face photo and describe the scene. AI generates a new image featuring your face — headshots, creative portraits, lifestyle shots.",
}

export default function GeneratePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-50 to-transparent dark:from-rose-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <UserCircle className="mr-1 size-3" /> New on Imagenary
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Your face,{" "}
              <span className="text-rose-500">any scene</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload a clear photo of a face and describe the image you
              want. AI generates a brand-new, high-quality image featuring
              the source face in your described scene. Professional
              headshots, creative portraits, lifestyle content — all from
              a single selfie.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/app/generate"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-rose-500 px-6 text-base font-medium text-white hover:bg-rose-600 transition-colors"
              >
                Generate a Portrait <ArrowRight className="size-4" />
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
              title: "1. Upload a face photo",
              body: "A clear, front-facing photo works best. The AI extracts facial features and identity markers.",
            },
            {
              icon: MessageSquare,
              title: "2. Describe the scene",
              body: "\"Professional headshot with studio lighting\", \"casual outdoor portrait at sunset\", \"formal business photo with gray backdrop\".",
            },
            {
              icon: Image,
              title: "3. Get your new image",
              body: "AI generates a photorealistic image with the source face placed naturally into your described scene. Download in high resolution.",
            },
          ].map((step) => (
            <Card key={step.title}>
              <CardContent className="pt-4">
                <step.icon className="size-8 text-rose-500 mb-3" />
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            Popular use cases
          </h2>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <Briefcase className="mx-auto size-8 text-rose-500 mb-3" />
              <h3 className="font-semibold">Professional Headshots</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Skip the photographer. Generate studio-quality LinkedIn and
                corporate headshots from a phone selfie.
              </p>
            </div>
            <div>
              <Camera className="mx-auto size-8 text-rose-500 mb-3" />
              <h3 className="font-semibold">Social Media Content</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create lifestyle and travel-style images for Instagram,
                dating profiles, or personal branding.
              </p>
            </div>
            <div>
              <Heart className="mx-auto size-8 text-rose-500 mb-3" />
              <h3 className="font-semibold">Profile Updates</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Refresh your online presence across every platform. One
                selfie becomes dozens of profile options.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
