import { FaqList } from "@/components/site/faq-list"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
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
      title="Local AI benchmarking, answered."
      intro="Practical answers about running the test and understanding your PC’s results."
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
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>
            <h2>Frequently asked questions</h2>
          </CardTitle>
          <CardDescription>
            Getting started, understanding results, and keeping your data local.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FaqList items={faqs} />
        </CardContent>
      </Card>
    </ArticleShell>
  )
}
