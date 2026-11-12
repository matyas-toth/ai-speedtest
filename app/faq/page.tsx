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
    <ArticleShell
      title="Frequently asked questions"
      toc={[
        { href: "#question-1", label: "What the test measures" },
        { href: "#question-2", label: "Running a test" },
        { href: "#question-3", label: "Tokens per second" },
        { href: "#question-4", label: "Interpreting the score" },
        { href: "#question-5", label: "GPU or CPU" },
        { href: "#question-6", label: "WebGPU support" },
        { href: "#question-7", label: "Privacy" },
        { href: "#question-8", label: "Native comparisons" },
      ]}
    >
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
