import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.imagenary.ai"),
  title: {
    default: "Imagenary AI | All The AI Image Tools You Need",
    template: "%s | Imagenary AI",
  },
  description:
    "Create children's books, extract text from images, refresh old photos, and generate new portraits — all powered by AI.",
  openGraph: {
    title: "Imagenary AI — AI Image Tools for Everyone",
    description:
      "A suite of AI-powered image tools: create, extract, refresh, and generate.",
    url: "https://www.imagenary.ai",
    siteName: "Imagenary AI",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imagenary AI — AI Image Tools for Everyone",
    description:
      "Transform images, extract text, generate descriptions, and create illustrated stories — all powered by AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.imagenary.ai",
  },
  verification: {
    google: "kIy30HJ-qy5U4U7s7knoNTsmyQjsGTECR1buFtRNrkc",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Imagenary AI",
              url: "https://www.imagenary.ai",
              description:
                "AI-powered image tools: text extraction, image refresh, touch-up, face generation, image description, and children's book creation.",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
