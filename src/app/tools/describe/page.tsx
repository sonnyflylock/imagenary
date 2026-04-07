import { Badge } from "@/components/ui/badge"
import { FileText, ArrowRight, Repeat, Palette, MessageSquare } from "lucide-react"

export const metadata = {
  title: "Image to Text Description — AI Image Describer | Imagenary.ai",
  description:
    "Upload an image or paste a URL and get a rich text description. Perfect for image-to-text-to-image workflows, accessibility, and AI prompts.",
}

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
