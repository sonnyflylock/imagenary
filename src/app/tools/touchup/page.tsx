import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Paintbrush, ArrowRight, MessageSquare, Wand2, Eye } from "lucide-react"

export const metadata = {
  title: "Guided Touch-Up — Prompt-Driven Image Editing | Imagenary.ai",
  description:
    "Describe what you want changed in natural language. AI edits your image while preserving the original subject.",
}

const examples = [
  {
    prompt: "Make the lighting warmer and more golden",
    category: "Lighting",
  },
  {
    prompt: "Remove the background and replace with clean white",
    category: "Background",
  },
  {
    prompt: "Make this look like a professional headshot",
    category: "Style",
  },
  {
    prompt: "Smooth skin and reduce under-eye circles",
    category: "Retouching",
  },
  {
    prompt: "Add a subtle depth-of-field blur to the background",
    category: "Focus",
  },
  {
    prompt: "Convert to black and white with high contrast",
    category: "Color",
  },
]

export default function TouchUpPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <Paintbrush className="mr-1 size-3" /> New on Imagenary
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Edit images{" "}
              <span className="text-purple-500">with words</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload a photo and describe what you want changed in plain
              English. AI understands your intent and applies the edit
              while keeping the original subject intact. No Photoshop
              skills required.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/app/touchup"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-purple-500 px-6 text-base font-medium text-white hover:bg-purple-600 transition-colors"
              >
                Try Touch-Up <ArrowRight className="size-4" />
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
              icon: Eye,
              title: "1. Upload your image",
              body: "Any photo — portrait, product shot, landscape. The AI analyzes what's in the image before making changes.",
            },
            {
              icon: MessageSquare,
              title: "2. Describe the edit",
              body: "Type what you want in natural language: \"make the sky bluer\", \"add studio lighting\", \"remove the person in the background\".",
            },
            {
              icon: Wand2,
              title: "3. AI applies it",
              body: "The model interprets your request and applies targeted edits. Download the result or refine with another prompt.",
            },
          ].map((step) => (
            <Card key={step.title}>
              <CardContent className="pt-4">
                <step.icon className="size-8 text-purple-500 mb-3" />
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Example prompts */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            Example prompts
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {examples.map((ex) => (
              <div
                key={ex.prompt}
                className="rounded-lg border bg-card p-4"
              >
                <span className="text-xs font-medium text-accent uppercase tracking-wide">
                  {ex.category}
                </span>
                <p className="mt-1 text-sm italic text-foreground">
                  &ldquo;{ex.prompt}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
