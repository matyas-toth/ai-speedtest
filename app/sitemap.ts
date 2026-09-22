import type { MetadataRoute } from "next"
import { absoluteUrl, isIndexable } from "@/lib/site"
export default function sitemap(): MetadataRoute.Sitemap {
  return isIndexable
    ? ["/", "/methodology", "/faq", "/privacy"].map((path) => ({
        url: absoluteUrl(path),
      }))
    : []
}
