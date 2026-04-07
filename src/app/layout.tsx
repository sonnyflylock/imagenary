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

function NavDropdown({ label, items }: { label: string; items: { name: string; href: string }[] }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
        {label}
        <svg className="size-3 opacity-60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="min-w-[160px] rounded-lg border bg-background p-1 shadow-lg">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

const navMenus = {
  morph: [
    { name: "Image Refresh", href: "/tools/refresh" },
    { name: "Guided Touch-Up", href: "/tools/touchup" },
    { name: "Face Generate", href: "/tools/generate" },
  ],
  data: [
    { name: "Text Extractor", href: "/tools/extract" },
    { name: "Image Describer", href: "/tools/describe" },
    { name: "Image to URL", href: "/tools/imageurl" },
  ],
  products: [
    { name: "Storybook", href: "/tools/storybunny" },
  ],
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
          <NavDropdown label="Image Morph" items={navMenus.morph} />
          <NavDropdown label="Image to Data" items={navMenus.data} />
          <NavDropdown label="Products" items={navMenus.products} />
          <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <NavActions />
      </div>
    </header>
  )
}

