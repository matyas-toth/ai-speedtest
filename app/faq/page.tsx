import { FaqList } from "@/components/site/faq-list"
import { ArticleShell } from "@/components/site/navigation"
import { StructuredData } from "@/components/site/structured-data"
import { faqs } from "@/lib/faq"
import { absoluteUrl, pageMetadata } from "@/lib/site"
export const metadata = pageMetadata(
  "Local AI benchmark FAQ",
  "Answers about testing local AI speed, WebGPU support, tokens per second, AI Index scores, model downloads, and benchmark privacy.",
  "/faq"
)
export default function Page() {
  return (
    <ArticleShell title="Frequently asked questions">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: absoluteUrl("/faq"),
          mainEntity: faqs.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }}
      />
      <FaqList items={faqs} />
    </ArticleShell>
  )
}
