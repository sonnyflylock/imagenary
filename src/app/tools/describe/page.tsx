import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ArrowRight, Eye, Brain, Repeat, Palette, MessageSquare } from "lucide-react"

export const metadata = {
  title: "Image to Text Description — AI Image Describer | Imagenary.ai",
  description:
    "Upload an image or paste a URL and get a rich text description. Perfect for image-to-text-to-image workflows, accessibility, and AI prompts.",
}

const tiers = [
  {
    name: "Standard",
    engine: "GPT-4o-mini",
    icon: Eye,
    speed: "2-3s",
    description:
      "Fast, accurate image descriptions. Captures subject, setting, colors, and composition in natural language.",
    useCases: ["Quick descriptions", "Social media alt-text", "AI prompt drafts"],
  },
  {
    name: "Detailed",
    engine: "GPT-4o",
    icon: Brain,
    speed: "3-6s",
    description:
      "Deep analysis with rich detail. Describes lighting, mood, textures, spatial relationships, and subtle visual cues.",
    useCases: ["Image recreation prompts", "Accessibility (WCAG)", "Art analysis"],
  },
]

export default function DescribePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50 to-transparent dark:from-amber-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <FileText className="mr-1 size-3" /> Image to Text Description
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Turn any image into a{" "}
              <span className="text-amber-500">detailed description</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload an image or paste a URL — AI describes it in rich natural
              language. Use the description to recreate the image with any AI
              generator, write alt-text, or feed it into another workflow.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/app/describe"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-6 text-base font-medium text-white hover:bg-amber-600 transition-colors"
              >
                Try Image Describer <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8">Two levels of detail</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <Card key={tier.name} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <tier.icon className="size-7 text-amber-500" />
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
            Why describe images with AI?
          </h2>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <Repeat className="mx-auto size-8 text-amber-500 mb-3" />
              <h3 className="font-semibold">Image → Text → Image</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Describe an existing image, then feed the description to an AI
                image generator to create variations or modifications.
              </p>
            </div>
            <div>
              <Palette className="mx-auto size-8 text-amber-500 mb-3" />
              <h3 className="font-semibold">Creative Prompts</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get a ready-made prompt from any reference image. Tweak a few
                words and generate something new.
              </p>
            </div>
            <div>
              <MessageSquare className="mx-auto size-8 text-amber-500 mb-3" />
              <h3 className="font-semibold">Accessibility</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate rich alt-text for websites and documents. Meet WCAG
                requirements with detailed image descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
