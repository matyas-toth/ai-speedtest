import type { MetadataRoute } from "next"
import { absoluteUrl, isIndexable } from "@/lib/site"
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(isIndexable ? { allow: "/" } : { disallow: "/" }),
    },
    ...(isIndexable ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
  }
}
