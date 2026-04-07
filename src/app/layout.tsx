import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { NavActions } from "@/components/nav-actions"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Imagenary.ai — AI Image Tools for Everyone",
  description:
    "Create children's books, extract text from images, refresh old photos, and generate new portraits — all powered by AI.",
  openGraph: {
    title: "Imagenary.ai — AI Image Tools for Everyone",
    description:
      "A suite of AI-powered image tools: create, extract, refresh, and generate.",
    url: "https://imagenary.ai",
    siteName: "Imagenary.ai",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 font-semibold text-lg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-6 text-accent"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Imagenary
        </a>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="/tools/extract" className="text-muted-foreground hover:text-foreground transition-colors">Text Extractor</a>
          <a href="/tools/refresh" className="text-muted-foreground hover:text-foreground transition-colors">Refresh</a>
          <a href="/tools/touchup" className="text-muted-foreground hover:text-foreground transition-colors">Touch-Up</a>
          <a href="/tools/generate" className="text-muted-foreground hover:text-foreground transition-colors">Generate</a>
          <a href="/tools/imageurl" className="text-muted-foreground hover:text-foreground transition-colors">Image URL</a>
          <a href="/tools/describe" className="text-muted-foreground hover:text-foreground transition-colors">Describe</a>
          <a href="/tools/storybunny" className="text-muted-foreground hover:text-foreground transition-colors">Storybook</a>
          <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <NavActions />
      </div>
    </header>
  )
}

