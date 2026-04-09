import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ScanText,
  ArrowRight,
  Download,
  MousePointerClick,
  Clipboard,
  Chrome,
  Globe,
  Keyboard,
  Zap,
  Shield,
  Clock,
  MonitorSmartphone,
} from "lucide-react"

export const metadata = {
  title: "ScreenScribe — Select, Extract, Copy. AI Text from Any Screen.",
  description:
    "ScreenScribe is a free browser extension that lets you select any area of your screen and instantly extract text with AI. No setup required. By Imagenary AI.",
  openGraph: {
    title: "ScreenScribe — AI Text Extractor for Your Browser",
    description:
      "Select any area of your screen and instantly extract text with AI. Free, no setup required.",
  },
}

const steps = [
  {
    icon: MousePointerClick,
    title: "Click the icon",
    description: "Click the ScreenScribe icon in your browser toolbar, or press Alt+C.",
  },
  {
    icon: ScanText,
    title: "Select an area",
    description: "Draw a rectangle around the text you want to extract. A crosshair appears — just click and drag.",
  },
  {
    icon: Clipboard,
    title: "Text is copied",
    description: "AI reads the selected area and copies the extracted text to your clipboard instantly.",
  },
]

const features = [
  {
    icon: Zap,
    title: "Instant extraction",
    description: "Select any area of your screen — text is extracted and copied to your clipboard in seconds.",
  },
  {
    icon: Shield,
    title: "Free, no account needed",
    description: "10 free extractions out of the box. No sign-up, no API keys, no setup required.",
  },
  {
    icon: Keyboard,
    title: "Keyboard shortcut",
    description: "Press Alt+C to start selecting instantly. Customize the shortcut in your browser settings.",
  },
  {
    icon: Clock,
    title: "Extraction history",
    description: "All your extractions are saved locally in your browser. Nothing leaves your machine.",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    description: "Any webpage, any tab. PDFs, slides, social media, dashboards, images — if you can see it, ScreenScribe can read it.",
  },
  {
    icon: MonitorSmartphone,
    title: "Bring your own model",
    description: "Use our built-in AI for free, or plug in your own Gemini, Claude, or GPT-4o API key.",
  },
]

const installSteps = {
  chrome: [
    "Download the ScreenScribe extension (.zip)",
    "Unzip the downloaded file to a folder",
    <>Open <a href="chrome://extensions" target="_blank" className="text-emerald-500 underline underline-offset-2">chrome://extensions</a> in your browser</>,
    <>Enable <strong>&quot;Developer mode&quot;</strong> (top-right toggle)</>,
    <>Click <strong>&quot;Load unpacked&quot;</strong> and select the unzipped folder. <span className="block mt-1 text-xs text-muted-foreground/80">Note: Do not click into the folder — instead, select the folder and hit the &quot;Select Folder&quot; button on the bottom right.</span></>,
    <>ScreenScribe appears in your toolbar — click the <strong>extensions puzzle icon</strong> to see it</>,
    <>Hit the <strong>pin icon</strong> next to ScreenScribe so it stays visible in your toolbar</>,
    "Click the ScreenScribe icon to start extracting!",
  ],
  edge: [
    "Download the ScreenScribe extension (.zip)",
    "Unzip the downloaded file to a folder",
    <>Open <a href="edge://extensions" target="_blank" className="text-emerald-500 underline underline-offset-2">edge://extensions</a> in your browser</>,
    <>Enable <strong>&quot;Developer mode&quot;</strong> (bottom-left toggle)</>,
    <>Click <strong>&quot;Load unpacked&quot;</strong> and select the unzipped folder. <span className="block mt-1 text-xs text-muted-foreground/80">Note: Do not click into the folder — instead, select the folder and hit the &quot;Select Folder&quot; button on the bottom right.</span></>,
    <>ScreenScribe appears in your toolbar — click the <strong>extensions puzzle icon</strong> to see it</>,
    <>Hit the <strong>pin icon</strong> next to ScreenScribe so it stays visible in your toolbar</>,
    "Click the ScreenScribe icon to start extracting!",
  ],
}

export default function ScreenScribePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/20" />
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent">
              <ScanText className="mr-1 size-3" /> Browser Extension
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Screen<span className="text-emerald-500">Scribe</span>
            </h1>
            <p className="mt-2 text-xl text-muted-foreground">
              Select. Extract. Copy.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              A free browser extension that lets you select any area of your
              screen and instantly extract text with AI. No account, no API
              keys, no setup. Just click, drag, and go.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/screenscribe/download"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-500 px-7 text-base font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                <Download className="size-4" />
                Download Free
              </a>
              <a
                href="#install"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-background px-7 text-base font-medium hover:bg-muted transition-colors"
              >
                Install Guide <ArrowRight className="size-4" />
              </a>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              10 free extractions included. Chrome, Edge & Firefox.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center">How it works</h2>
          <p className="mt-2 text-center text-muted-foreground">Three steps. Three seconds.</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <step.icon className="size-7 text-emerald-500" />
                </div>
                <div className="mt-1 text-sm font-medium text-emerald-500">Step {i + 1}</div>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center">Why ScreenScribe</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="h-full">
                <CardContent className="pt-6">
                  <f.icon className="size-6 text-emerald-500" />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo / Visual */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                Works on anything you can see
              </h2>
              <p className="mt-3 text-muted-foreground">
                PDFs in your browser, slides, social media posts, dashboards,
                code screenshots, recipe images, memes — if there{"'"}s text on
                your screen, ScreenScribe can grab it.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Grab text from images & screenshots",
                  "Copy code from video tutorials",
                  "Extract data from charts & dashboards",
                  "Digitize printed documents & receipts",
                  "Read text in foreign languages",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                      &#10003;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock UI */}
            <div className="flex-shrink-0 w-80 rounded-xl border bg-muted/30 p-5">
              <div className="rounded-lg border bg-background p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-5 rounded bg-emerald-500/20 flex items-center justify-center">
                    <ScanText className="size-3 text-emerald-500" />
                  </div>
                  <span className="text-sm font-semibold">ScreenScribe</span>
                </div>
                <div className="rounded-lg bg-[#1e293b] p-3 text-xs text-white/90 font-mono leading-relaxed">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400">&#10003;</span>
                    <span className="text-emerald-400 font-semibold">Text Extracted</span>
                  </div>
                  <div className="rounded bg-white/5 p-2 text-white/70">
                    The quarterly revenue increased by 23% compared to the previous year, reaching $4.2M in Q3...
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-white/40">
                    <span>&#10003; Copied to clipboard</span>
                    <span>7 free left</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Powered by AI</span>
                  <span className="text-emerald-500 font-medium">Imagenary AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Install Guide */}
      <section className="border-t bg-muted/30" id="install">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold text-center">Install in 2 minutes</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Available for Chrome, Edge, and Firefox. No store listing needed.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Chrome */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Chrome className="size-6 text-blue-500" />
                  <h3 className="font-semibold text-lg">Chrome / Edge</h3>
                </div>
                <ol className="space-y-3">
                  {installSteps.chrome.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6">
                  <a
                    href="/screenscribe/download"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                  >
                    <Download className="size-4" />
                    Download for Chrome / Edge
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Firefox */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="size-6 text-orange-500" />
                  <h3 className="font-semibold text-lg">Firefox</h3>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 p-4 text-sm text-orange-700 dark:text-orange-400">
                  <Clock className="size-4 shrink-0" />
                  <span>Firefox version coming soon. Join the waitlist below.</span>
                </div>
                <div className="mt-6">
                  <a
                    href="mailto:support@imagenary.ai?subject=ScreenScribe Firefox waitlist"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Notify Me
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold">
            Stop retyping. Start <span className="text-emerald-500">scribing</span>.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            10 free extractions. No account needed. Download ScreenScribe and
            start extracting text from your screen in seconds.
          </p>
          <div className="mt-8">
            <a
              href="/screenscribe/download"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-500 px-8 text-base font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              <Download className="size-4" />
              Download ScreenScribe — Free
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Part of the{" "}
            <a href="/" className="text-emerald-500 hover:underline">
              Imagenary AI
            </a>{" "}
            suite of image tools.
          </p>
        </div>
      </section>
    </>
  )
}
