import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  ImageIcon,
  BookOpen,
  ScanText,
  RefreshCw,
  Paintbrush,
  UserCircle,
  Link2,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react"

const categories = [
  {
    title: "Image to Data",
    subtitle: "Extract information and URLs from images",
    tools: [
      {
        name: "Text Extractor",
        tagline: "Instant OCR & Image Intelligence",
        description:
          "Pull text from any image — receipts, documents, screenshots, handwriting. AI-powered extraction that understands layout, tables, and handwriting.",
        icon: ScanText,
        href: "/tools/extract",
        badge: "Live",
        color: "text-blue-500",
      },
      {
        name: "Image to URL",
        tagline: "Host Any Image Instantly",
        description:
          "Upload a local image and get a public URL in seconds. Perfect for sharing images with AI tools, SSH sessions, and anywhere you need a hosted image link.",
        icon: Link2,
        href: "/tools/imageurl",
        badge: "New",
        color: "text-cyan-500",
      },
      {
        name: "Image Describer",
        tagline: "AI Image to Text Description",
        description:
          "Upload an image or paste a URL — AI describes it in rich detail. Use the description as a prompt for image generators, alt-text, or any text-based workflow.",
        icon: FileText,
        href: "/tools/describe",
        badge: "New",
        color: "text-amber-500",
      },
    ],
  },
  {
    title: "Image Morph",
    subtitle: "Transform and enhance your images with AI",
    tools: [
      {
        name: "Image Refresh",
        tagline: "Instantly Revive Old & Blurry Photos",
        description:
          "Upload a blurry, low-res, or dated photo and get back a crisp, high-quality version. Perfect for outdated profile pictures, old headshots, and compressed images.",
        icon: RefreshCw,
        href: "/tools/refresh",
        badge: "Live",
        color: "text-emerald-500",
      },
      {
        name: "Guided Touch-Up",
        tagline: "Prompt-Driven Image Enhancement",
        description:
          "Describe what you want changed — \"make the lighting warmer\", \"remove the background\", \"add a professional look\" — and AI applies the edit while preserving the original subject.",
        icon: Paintbrush,
        href: "/tools/touchup",
        badge: "Beta",
        color: "text-purple-500",
      },
      {
        name: "Face Generate",
        tagline: "New Images with Your Face",
        description:
          "Upload a face photo and describe the scene you want. AI generates a brand-new image featuring the source face — professional headshots, creative portraits, lifestyle shots.",
        icon: UserCircle,
        href: "/tools/generate",
        badge: "Beta",
        color: "text-rose-500",
      },
    ],
  },
  {
    title: "Products",
    subtitle: "Complete AI-powered creative tools",
    tools: [
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
    ],
  },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Imagenary.ai",
  url: "https://www.imagenary.ai",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  description:
    "AI-powered image tools: extract text (OCR), refresh old photos, describe images, host images as URLs, guided touch-up, face generation, and children's book creation.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "5 free uses, then pay-as-you-go from $0.05/use",
  },
  featureList: [
    "Text Extraction (OCR)",
    "Image Refresh",
    "Image Description",
    "Image to URL",
    "Guided Touch-Up",
    "Face Generate",
    "AI Storybook Creator",
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center lg:py-32">
          <Badge variant="accent" className="mb-4">
            <Sparkles className="mr-1 size-3" />
            7 AI tools, one platform
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Every image tool you need,{" "}
            <span className="text-accent">powered by AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Transform images, extract text, generate descriptions, host files,
            and create illustrated stories &mdash; all from one platform.
            Free to start.
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

      {/* Tool Categories */}
      {categories.map((cat) => (
        <section key={cat.title} className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">{cat.title}</h2>
            <p className="mt-1 text-muted-foreground">{cat.subtitle}</p>
          </div>
          <div className={`grid gap-6 ${cat.tools.length === 1 ? "md:grid-cols-1 max-w-md" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {cat.tools.map((tool) => (
              <a key={tool.name} href={tool.href} className="group">
                <Card className="h-full transition-all hover:ring-accent/40 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <tool.icon className={`size-8 ${tool.color}`} />
                      <Badge
                        variant={tool.badge === "New" ? "accent" : tool.badge === "Beta" ? "outline" : "secondary"}
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
      ))}

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
          No credit card required. 5 free uses to start.
        </p>
        <a
          href="/signin"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-base font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Sign In <ArrowRight className="size-4" />
        </a>
      </section>

      {/* Footer — homepage only */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold mb-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-5 text-accent"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Imagenary.ai
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered image tools for creators, businesses, and developers.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Image to Data</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/tools/extract" className="hover:text-foreground">Text Extractor</a></li>
                <li><a href="/tools/imageurl" className="hover:text-foreground">Image to URL</a></li>
                <li><a href="/tools/describe" className="hover:text-foreground">Image Describer</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Image Morph</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/tools/refresh" className="hover:text-foreground">Image Refresh</a></li>
                <li><a href="/tools/touchup" className="hover:text-foreground">Guided Touch-Up</a></li>
                <li><a href="/tools/generate" className="hover:text-foreground">Face Generate</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/tools/storybunny" className="hover:text-foreground">Storybook</a></li>
                <li><a href="/pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="/api-docs" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
