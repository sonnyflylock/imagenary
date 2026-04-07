import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.imagenary.ai"

  const pages = [
    { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/signin", priority: 0.5, changeFrequency: "yearly" as const },
    // Marketing / tool pages
    { url: "/tools/refresh", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/tools/touchup", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/tools/generate", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/tools/extract", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/tools/describe", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/tools/imageurl", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/tools/storybunny", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/api-docs", priority: 0.7, changeFrequency: "monthly" as const },
  ]

  return pages.map((p) => ({
    url: `${base}${p.url}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))
}
