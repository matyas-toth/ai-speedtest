import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FaqList } from "@/components/site/faq-list"
import { faqs } from "@/lib/faq"

export function BenchmarkGuide() {
  return (
    <section aria-labelledby="guide-heading" className="flex flex-col gap-8">
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="guide-heading" className="text-balance">
              Your local AI benchmark, explained.
            </h2>
          </CardTitle>
          <CardDescription>
            Real model inference in your browser using WebGPU. No account or API
            key required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FaqList items={faqs.slice(1, 5)} />
        </CardContent>
        <CardFooter className="flex-wrap gap-3">
          <Button
            variant="outline"
            nativeButton={false}
            role="link"
            render={<Link href="/methodology" />}
            className="min-h-11"
          >
            Read the methodology
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              data-icon="inline-end"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            role="link"
            render={<Link href="/faq" />}
            className="min-h-11"
          >
            All questions
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              data-icon="inline-end"
              strokeWidth={2}
              aria-hidden="true"
            />
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
