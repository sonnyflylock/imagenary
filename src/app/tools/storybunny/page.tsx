import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Sparkles, Clock, Palette, ArrowRight } from "lucide-react"

export const metadata = {
  title: "StoryBunny — AI Children's Book Creator | Imagenary.ai",
  description:
    "Create beautifully illustrated children's books with AI. Enter a theme and characters — get a complete story with artwork in minutes.",
}

export default function StoryBunnyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-orange-50 to-transparent dark:from-orange-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <BookOpen className="mr-1 size-3" /> Live on Imagenary
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Create children&apos;s books{" "}
              <span className="text-orange-500">with AI</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              StoryBunny generates complete illustrated children&apos;s books
              from a simple prompt. Pick a theme, name your characters, choose
              an age range, and get a fully written and illustrated story in
              minutes. Perfect for parents, teachers, and publishers.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://bots.messagesimproved.com/storybunny"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange-500 px-6 text-base font-medium text-white hover:bg-orange-600 transition-colors"
              >
                Create a Story <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "1. Describe your story",
              body: "Enter a theme (\"a brave kitten learns to swim\"), character names, and target age group. StoryBunny handles the rest.",
            },
            {
              icon: Palette,
              title: "2. AI writes & illustrates",
              body: "GPT-4o writes the narrative. DALL-E generates matching illustrations for each page. The whole book comes together automatically.",
            },
            {
              icon: Clock,
              title: "3. Download & share",
              body: "Get your finished book as a PDF. Print it, read it on a tablet, or share it as a gift. Takes about 2 minutes.",
            },
          ].map((step) => (
            <Card key={step.title}>
              <CardContent className="pt-4">
                <step.icon className="size-8 text-orange-500 mb-3" />
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
          <h2 className="text-2xl font-bold text-center mb-10">Who uses StoryBunny</h2>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <h3 className="font-semibold">Parents</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create personalized bedtime stories starring your child. Every
                night can be a new adventure.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Teachers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate reading material matched to your curriculum. Custom
                stories for any lesson or reading level.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Publishers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Rapidly prototype book concepts. Test themes and styles before
                committing to full production.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
