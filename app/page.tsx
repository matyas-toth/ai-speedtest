import { Dashboard } from "@/components/benchmark/dashboard"
import { BenchmarkGuide } from "@/components/site/benchmark-guide"
import { StructuredData } from "@/components/site/structured-data"
import { absoluteUrl, description, pageMetadata, siteName } from "@/lib/site"
export const metadata = pageMetadata(
  "AI Speedtest — Free Local AI & WebGPU Benchmark",
  description,
  "/"
)
export default function Page() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": absoluteUrl("/#website"),
              name: siteName,
              url: absoluteUrl("/"),
              inLanguage: "en",
            },
            {
              "@type": "WebApplication",
              "@id": absoluteUrl("/#application"),
              name: siteName,
              url: absoluteUrl("/"),
              description,
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web browser with WebGPU",
              browserRequirements:
                "Requires JavaScript, WebGPU, and HTTPS (or localhost).",
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              featureList: [
                "Local LLM inference benchmark",
                "Prompt processing throughput",
                "Embedding throughput",
                "JSON result export",
              ],
              image: absoluteUrl("/brand/og-image.png"),
            },
          ],
        }}
      />
      <Dashboard>
        <BenchmarkGuide />
      </Dashboard>
    </>
  )
}
