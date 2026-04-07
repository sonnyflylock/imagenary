import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  ImageIcon,
  BookOpen,
  ScanText,
  RefreshCw,
  Paintbrush,
  UserCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react"

const tools = [
  {
    name: "Storybook",
    tagline: "AI Children's Book Creator",
    description:
      "Generate beautifully illustrated children's books with AI. Enter a theme, characters, and age range — get a complete story with matching artwork in minutes.",
    icon: BookOpen,
    href: "/tools/storybunny",
    badge: "Live",
    color: "text-orange-500",
  },
  {
    name: "Text Extractor",
    tagline: "Instant OCR & Image Intelligence",
    description:
      "Pull text from any image — receipts, documents, screenshots, handwriting. Three tiers: fast OCR, smart extraction with Gemini, or deep analysis with GPT-4o.",
    icon: ScanText,
    href: "/tools/extract",
    badge: "Live",
    color: "text-blue-500",
  },
  {
    name: "Image Refresh",
    tagline: "Instantly Revive Old & Blurry Photos",
    description:
      "Upload a blurry, low-res, or dated photo and get back a crisp, high-quality version. Perfect for outdated profile pictures, old headshots, and compressed images.",
    icon: RefreshCw,
    href: "/tools/refresh",
    badge: "New",
    color: "text-emerald-500",
  },
  {
    name: "Guided Touch-Up",
    tagline: "Prompt-Driven Image Enhancement",
    description:
      "Describe what you want changed — \"make the lighting warmer\", \"remove the background\", \"add a professional look\" — and AI applies the edit while preserving the original subject.",
    icon: Paintbrush,
    href: "/tools/touchup",
    badge: "New",
    color: "text-purple-500",
  },
  {
    name: "Face Generate",
    tagline: "New Images with Your Face",
    description:
      "Upload a face photo and describe the scene you want. AI generates a brand-new image featuring the source face — professional headshots, creative portraits, lifestyle shots.",
    icon: UserCircle,
    href: "/tools/generate",
    badge: "New",
    color: "text-rose-500",
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center lg:py-32">
          <Badge variant="accent" className="mb-4">
            <Sparkles className="mr-1 size-3" />
            5 AI tools, one platform
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Every image tool you need,{" "}
            <span className="text-accent">powered by AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Create children&apos;s books, extract text from photos, refresh old
            images, touch up with natural language, and generate new portraits
            &mdash; all from one place. Free to start.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="/signin"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-base font-medium text-accent-foreground hover:opacity-90 transition-opacity"
            >
              Sign In
              <ArrowRight className="size-4" />
            </a>
            <a
              href="/pricing"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-medium hover:bg-muted transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">The Suite</h2>
          <p className="mt-3 text-muted-foreground">
            Five specialized tools. One API. Unlimited creative potential.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <a key={tool.name} href={tool.href} className="group">
              <Card className="h-full transition-all hover:ring-accent/40 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <tool.icon className={`size-8 ${tool.color}`} />
                    <Badge
                      variant={tool.badge === "New" ? "accent" : "secondary"}
                    >
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-lg">{tool.name}</CardTitle>
                  <CardDescription className="text-xs font-medium uppercase tracking-wide text-accent">
                    {tool.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:underline">
                    Learn more <ArrowRight className="size-3" />
                  </span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10">
                <Zap className="size-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Instant Results</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Most tools return results in under 10 seconds. No queues, no
                waiting. Upload and go.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10">
                <Shield className="size-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Privacy First</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Images are processed and deleted. We don&apos;t store your
                uploads or train on your data.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10">
                <ImageIcon className="size-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">API Access</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every tool is available via REST API. Integrate image AI into
                your own products in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Start creating for free
        </h2>
        <p className="mt-3 text-muted-foreground">
          No credit card required. 5 free uses per tool to start.
        </p>
        <a
          href="/signin"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-base font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Sign In <ArrowRight className="size-4" />
        </a>
      </section>
    </>
  )
}
