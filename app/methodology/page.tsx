import { Methodology } from "@/components/benchmark/methodology"
import { ArticleShell } from "@/components/site/navigation"
import { StructuredData } from "@/components/site/structured-data"
import { absoluteUrl, pageMetadata } from "@/lib/site"
export const metadata = pageMetadata(
  "AI benchmark methodology & scoring",
  "Inspect AI Speedtest’s models, fixed workloads, tokens-per-second measurements, warm-up procedure, and AI Index v1 scoring formula.",
  "/methodology"
)
export default function Page() {
  return (
    <ArticleShell
      title="How AI Speedtest measures performance"
      intro="A repeatable WebGPU workload with real models, fixed inputs, and a score you can inspect. Here is exactly what we measure—and what the results can tell you."
    >
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "AI benchmark methodology & scoring",
          url: absoluteUrl("/methodology"),
          about: "WebGPU inference benchmarking",
          isPartOf: { "@id": absoluteUrl("/#website") },
        }}
      />
      <Methodology />
    </ArticleShell>
  )
}
