import type { Metadata } from "next"
import { Code, Zap, Shield, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "API",
  description:
    "Integrate Imagenary.ai tools into your own products via REST API. Extract text, refresh images, describe photos, and more.",
  alternates: { canonical: "https://www.imagenary.ai/api-docs" },
}

const endpoints = [
  {
    method: "POST",
    path: "/api/image",
    name: "Image Tools",
    description: "Extract text, describe images, refresh photos, touch-up, and generate faces.",
    params: [
      { name: "file", type: "File", required: true, note: "Image file (PNG, JPG, WebP). Not required for describe with image_url." },
      { name: "tool", type: "string", required: true, note: '"extract" | "describe" | "refresh" | "touchup" | "generate"' },
      { name: "model", type: "string", required: false, note: 'For extract: "cloud_vision" | "gemini" | "gpt4o"' },
      { name: "prompt", type: "string", required: false, note: "Custom prompt for describe, touchup, or generate." },
      { name: "image_url", type: "string", required: false, note: "URL of image to describe (alternative to file upload)." },
      { name: "strength", type: "number", required: false, note: "Touch-up strength 0.15–0.8 (default 0.35)." },
    ],
    example: `curl -X POST https://www.imagenary.ai/api/image \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@photo.jpg" \\
  -F "tool=extract" \\
  -F "model=gemini"`,
    response: `{
  "result": "Extracted text from the image...",
  "remaining": 480,
  "usedFree": false,
  "preview": false
}`,
  },
  {
    method: "POST",
    path: "/api/imageurl",
    name: "Image to URL",
    description: "Upload an image and get a public hosted URL.",
    params: [
      { name: "file", type: "File", required: true, note: "Image file up to 50MB." },
    ],
    example: `curl -X POST https://www.imagenary.ai/api/imageurl \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@photo.jpg"`,
    response: `{
  "url": "https://www.imagenary.ai/i/20260407-photo-abc123.jpg",
  "filename": "20260407-photo-abc123.jpg",
  "size": 245760,
  "type": "image/jpeg"
}`,
  },
]

export default function ApiDocsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="mx-auto max-w-4xl px-4 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <Code className="size-4" />
              REST API
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Build with Imagenary
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every tool on the platform is available via a simple REST API.
              Extract text, refresh images, generate descriptions, and host files — all from your own code.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a
                href="/signin"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-base font-medium text-accent-foreground hover:opacity-90 transition-opacity"
              >
                Get API Access <ArrowRight className="size-4" />
              </a>
              <a
                href="/pricing"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-medium hover:bg-muted transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex gap-3">
              <Zap className="size-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Simple integration</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Multipart form POST. No SDKs needed — works with curl, fetch, or any HTTP client.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="size-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Same pricing</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  API uses deduct from the same balance as the web tools. No separate API pricing.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Code className="size-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">All tools included</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Extract, describe, refresh, touch-up, generate, and image hosting — one API.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All API requests require a Bearer token. Get your token from your account settings after signing in.
        </p>
        <div className="rounded-xl border bg-zinc-950 p-5 overflow-x-auto">
          <pre className="text-sm text-zinc-300 font-mono">
{`Authorization: Bearer YOUR_ACCESS_TOKEN`}
          </pre>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Your access token is tied to your account and uses your balance. Keep it secret.
        </p>
      </section>

      {/* Endpoints */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="text-2xl font-bold mb-8">Endpoints</h2>
        <div className="space-y-12">
          {endpoints.map((ep) => (
            <div key={ep.path} className="rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
                <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent font-mono">
                  {ep.method}
                </span>
                <code className="text-sm font-mono font-medium">{ep.path}</code>
                <span className="ml-auto text-sm text-muted-foreground">{ep.name}</span>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-sm text-muted-foreground">{ep.description}</p>

                {/* Parameters */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-[100px_80px_60px_1fr] gap-2 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <span>Name</span>
                      <span>Type</span>
                      <span>Req</span>
                      <span>Description</span>
                    </div>
                    {ep.params.map((p) => (
                      <div key={p.name} className="grid grid-cols-[100px_80px_60px_1fr] gap-2 border-t px-4 py-2.5 text-sm">
                        <code className="font-mono text-xs">{p.name}</code>
                        <span className="text-xs text-muted-foreground">{p.type}</span>
                        <span className={`text-xs ${p.required ? "text-accent font-medium" : "text-muted-foreground"}`}>
                          {p.required ? "Yes" : "No"}
                        </span>
                        <span className="text-xs text-muted-foreground">{p.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Example request</h4>
                  <div className="rounded-xl border bg-zinc-950 p-5 overflow-x-auto">
                    <pre className="text-sm text-zinc-300 font-mono whitespace-pre">{ep.example}</pre>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Example response</h4>
                  <div className="rounded-xl border bg-zinc-950 p-5 overflow-x-auto">
                    <pre className="text-sm text-emerald-400 font-mono whitespace-pre">{ep.response}</pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Error codes */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6">Error codes</h2>
        <div className="rounded-xl border overflow-hidden">
          <div className="grid grid-cols-[80px_1fr] gap-4 bg-muted/50 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Code</span>
            <span>Meaning</span>
          </div>
          {[
            { code: "400", meaning: "Bad request — missing or invalid parameters." },
            { code: "401", meaning: "Not authenticated. Sign in or provide a valid Bearer token." },
            { code: "402", meaning: "No balance remaining. Top up at /pricing." },
            { code: "413", meaning: "File too large. Max 20MB for tools, 50MB for image hosting." },
            { code: "500", meaning: "Server error. Try again or contact support." },
          ].map((e) => (
            <div key={e.code} className="grid grid-cols-[80px_1fr] gap-4 border-t px-6 py-3">
              <code className="font-mono text-sm font-bold">{e.code}</code>
              <span className="text-sm text-muted-foreground">{e.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">Ready to integrate?</h2>
          <p className="mt-3 text-muted-foreground">
            Sign up for free, get your API token, and start building.
          </p>
          <a
            href="/signin"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-base font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Get started <ArrowRight className="size-4" />
          </a>
        </div>
      </section>
    </>
  )
}
