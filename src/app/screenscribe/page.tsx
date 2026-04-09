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
  title: "ScreenScribe — Never Type It Out Again. AI Copy & Paste for Your Browser.",
  description:
    "ScreenScribe is a free browser extension that clips anything on your screen and uses AI to put the text right into your clipboard. No typing, no setup. By Imagenary AI.",
  openGraph: {
    title: "ScreenScribe — Never Type It Out Again",
    description:
      "Clip anything in your browser. AI reads it and puts the text right into your clipboard. Free, no setup.",
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
    title: "Straight to your clipboard",
    description: "Select an area, AI reads it, text lands in your clipboard. Paste anywhere — done.",
  },
  {
    icon: Shield,
    title: "Free, no account needed",
    description: "10 free extractions out of the box. No sign-up, no API keys, no setup required.",
  },
  {
    icon: Keyboard,
    title: "Alt+C and go",
    description: "Hit Alt+C to start clipping instantly. No menus, no clicks. Customize the shortcut in your browser.",
  },
  {
    icon: Clock,
    title: "Everything you've clipped",
    description: "Full extraction history saved locally in your browser. Re-copy anything with one click.",
  },
  {
    icon: Globe,
    title: "If you can see it, clip it",
    description: "Webpages, PDFs, slides, videos, dashboards, social media, memes — anything on your screen.",
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
              Never type it out again.
            </h1>
            <p className="mt-2 text-xl font-medium">
              Screen<span className="text-emerald-500">Scribe</span> — Copy &amp; paste in the AI era.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Clip anything in your browser — text in images, PDFs, slides,
              videos, dashboards — and AI reads it and puts it right into your
              clipboard. No typing, no account, no setup. Just click, drag, done.
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
          <p className="mt-2 text-center text-muted-foreground">Three steps. Three seconds. Text in your clipboard.</p>
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
                Stop retyping what{"'"}s already on your screen
              </h2>
              <p className="mt-3 text-muted-foreground">
                That text in an image, that code in a video, that data in a
                dashboard — you shouldn{"'"}t have to type it out. Clip it,
                and it{"'"}s in your clipboard.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Clip text from images & screenshots",
                  "Copy code from video tutorials — no pausing, no retyping",
                  "Pull data from charts & dashboards into spreadsheets",
                  "Digitize receipts, invoices, and printed docs",
                  "Read and translate text in foreign languages",
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
            Never type it out again.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            10 free clips. No account needed. Download ScreenScribe and
            let AI handle the copy &amp; paste.
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
