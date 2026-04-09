"use client"

import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { NavActions } from "./nav-actions"

const toolLinks = {
  morph: [
    { name: "Image Refresh", tool: "/tools/refresh", app: "/app/refresh" },
    { name: "Guided Touch-Up", tool: "/tools/touchup", app: "/app/touchup" },
    { name: "Face Generate", tool: "/tools/generate", app: "/app/generate" },
  ],
  data: [
    { name: "Text Extractor", tool: "/tools/extract", app: "/app/extract" },
    { name: "Image to URL", tool: "/tools/imageurl", app: "/app/imageurl" },
    { name: "Image Describer", tool: "/tools/describe", app: "/app/describe" },
  ],
  products: [
    { name: "Storybook", tool: "/tools/storybunny", app: "/tools/storybunny" },
  ],
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

export function Navbar() {
  const { user } = useAuth()
  const loggedIn = !!user

  const morph = toolLinks.morph.map((t) => ({ name: t.name, href: loggedIn ? t.app : t.tool }))
  const data = toolLinks.data.map((t) => ({ name: t.name, href: loggedIn ? t.app : t.tool }))
  const products = toolLinks.products.map((t) => ({ name: t.name, href: loggedIn ? t.app : t.tool }))

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Image src="/favicon.png" alt="Imagenary AI" width={24} height={24} className="rounded" />
          Imagenary
        </a>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <NavDropdown label="Image to Data" items={data} />
          <NavDropdown label="Image Morph" items={morph} />
          <NavDropdown label="Products" items={products} />
          <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <NavActions />
      </div>
    </header>
  )
}
