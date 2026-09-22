import type { Metadata } from "next"

// Override SITE_URL at build time only when the public origin changes.
const configuredUrl = process.env.SITE_URL || "https://speedtest.maty.as"
export const siteUrl = new URL(configuredUrl).origin
export const isIndexable =
  process.env.SITE_NOINDEX !== "true" && process.env.VERCEL_ENV !== "preview"
export const siteName = "AI Speedtest"
export const description =
  "Test your PC’s local AI performance with a free WebGPU benchmark. Measure LLM tokens per second, prompt processing, and embeddings in your browser."
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString()

export function pageMetadata(
  title: string,
  summary: string,
  path: string
): Metadata {
  const fullTitle = path === "/" ? title : `${title} | ${siteName}`
  return {
    title: fullTitle,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title: fullTitle,
      description: summary,
      url: path,
      images: [
        {
          url: "/brand/og-image.png",
          width: 1200,
          height: 630,
          alt: "AI Speedtest — How fast is your PC at AI? Local WebGPU benchmark.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: summary,
      images: ["/brand/og-image.png"],
    },
  }
}
