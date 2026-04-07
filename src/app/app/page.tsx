"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  ScanText,
  RefreshCw,
  Paintbrush,
  UserCircle,
  Link2,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react"

const categories = [
  {
    title: "Image Morph",
    subtitle: "Transform and enhance your images",
    tools: [
      {
        name: "Image Refresh",
        tagline: "Revive old & blurry photos",
        icon: RefreshCw,
        app: "/app/refresh",
        info: "/tools/refresh",
        badge: "Live",
        color: "text-emerald-500",
      },
      {
        name: "Guided Touch-Up",
        tagline: "Prompt-driven image edits",
        icon: Paintbrush,
        app: "/app/touchup",
        info: "/tools/touchup",
        badge: "Beta",
        color: "text-purple-500",
      },
      {
        name: "Face Generate",
        tagline: "New images with your face",
        icon: UserCircle,
        app: "/app/generate",
        info: "/tools/generate",
        badge: "Beta",
        color: "text-rose-500",
      },
    ],
  },
  {
    title: "Image to Data",
    subtitle: "Extract information from images",
    tools: [
      {
        name: "Text Extractor",
        tagline: "OCR & image intelligence",
        icon: ScanText,
        app: "/app/extract",
        info: "/tools/extract",
        badge: "Live",
        color: "text-blue-500",
      },
      {
        name: "Image Describer",
        tagline: "AI image to text description",
        icon: FileText,
        app: "/app/describe",
        info: "/tools/describe",
        badge: "New",
        color: "text-amber-500",
      },
      {
        name: "Image to URL",
        tagline: "Host any image instantly",
        icon: Link2,
        app: "/app/imageurl",
        info: "/tools/imageurl",
        badge: "New",
        color: "text-cyan-500",
      },
    ],
  },
  {
    title: "Products",
    subtitle: "Complete AI-powered creative tools",
    tools: [
      {
        name: "Storybook",
        tagline: "AI children's book creator",
        icon: BookOpen,
        app: "/tools/storybunny",
        info: "/tools/storybunny",
        badge: "Live",
        color: "text-orange-500",
      },
    ],
  },
]

const FREE_USES_TOTAL = 5

export default function AppDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    router.push("/signin")
    return null
  }

  const freeUsed = user.freeExtract + user.freeRefresh + user.freeTouchup + user.freeGenerate
  const freeRemaining = Math.max(0, FREE_USES_TOTAL - freeUsed)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Welcome + balance */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your tools</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a tool to get started.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
            {user.balanceCents > 0 ? (
              <>
                <span className="font-semibold">${(user.balanceCents / 100).toFixed(2)}</span>
                <span className="text-muted-foreground ml-1">balance</span>
              </>
            ) : (
              <>
                <span className="font-semibold">{freeRemaining}</span>
                <span className="text-muted-foreground ml-1">free uses left</span>
              </>
            )}
          </div>
          <a
            href="/pricing"
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Top up
          </a>
        </div>
      </div>

      {/* Tool categories */}
      {categories.map((cat) => (
        <section key={cat.title} className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{cat.title}</h2>
            <p className="text-sm text-muted-foreground">{cat.subtitle}</p>
          </div>
          <div className={`grid gap-4 ${cat.tools.length === 1 ? "md:grid-cols-1 max-w-md" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {cat.tools.map((tool) => (
              <Card key={tool.name} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <tool.icon className={`size-7 ${tool.color}`} />
                    <Badge
                      variant={tool.badge === "New" ? "accent" : tool.badge === "Beta" ? "outline" : "secondary"}
                    >
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-base">{tool.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {tool.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={tool.app}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
                    >
                      Use <ArrowRight className="size-3" />
                    </a>
                    <a
                      href={tool.info}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      Learn more
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
