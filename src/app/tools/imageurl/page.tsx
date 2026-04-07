import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link2, ArrowRight, Terminal, Globe, Clock, Shield } from "lucide-react"

export const metadata = {
  title: "Image to URL — Host Any Image Instantly | Imagenary.ai",
  description:
    "Upload a local image and get a public URL in seconds. Perfect for sharing images with AI tools, SSH sessions, and remote environments.",
}

const features = [
  {
    name: "Instant URLs",
    icon: Clock,
    description:
      "Upload any image and get a shareable URL in under 2 seconds. No sign-up walls, no waiting.",
  },
  {
    name: "AI-Friendly",
    icon: Terminal,
    description:
      "URLs work with Claude, ChatGPT, and any AI that accepts image URLs. Perfect for SSH and terminal sessions.",
  },
  {
    name: "Public & Direct",
    icon: Globe,
    description:
      "Direct image URLs — no landing pages, no redirects. Paste the URL anywhere and the image loads.",
  },
]

export default function ImageUrlPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cyan-50 to-transparent dark:from-cyan-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <Link2 className="mr-1 size-3" /> Image to URL
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Turn any local image into a{" "}
              <span className="text-cyan-500">shareable URL</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload an image from your device and get a public URL instantly.
              Share it with AI assistants, paste it into SSH sessions, or use
              it anywhere you need a hosted image.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/app/imageurl"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-cyan-500 px-6 text-base font-medium text-white hover:bg-cyan-600 transition-colors"
              >
                Upload an Image <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-2xl font-bold mb-8">Why Image to URL?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.name} className="h-full">
              <CardHeader>
                <f.icon className="size-7 text-cyan-500" />
                <CardTitle className="text-lg">{f.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            Built for real workflows
          </h2>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <Terminal className="mx-auto size-8 text-cyan-500 mb-3" />
              <h3 className="font-semibold">SSH & Remote Sessions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Working in a terminal with no access to local files? Upload
                the image here, paste the URL into your AI chat.
              </p>
            </div>
            <div>
              <Globe className="mx-auto size-8 text-cyan-500 mb-3" />
              <h3 className="font-semibold">Share Anywhere</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Direct image URLs work in Slack, Discord, emails, docs —
                anywhere that renders images from a URL.
              </p>
            </div>
            <div>
              <Shield className="mx-auto size-8 text-cyan-500 mb-3" />
              <h3 className="font-semibold">No Account Needed</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Quick uploads don&apos;t require sign-in. Images are hosted
                for 24 hours, then automatically deleted.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
