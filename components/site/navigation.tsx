import Link from "next/link"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PROTOCOL } from "@/lib/benchmark"

export function SiteFooter() {
  return (
    <footer className="mt-auto">

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <Button
            variant="ghost"
            nativeButton={false}
            role="link"
            render={<Link href="/" />}
            className="min-h-11"
          >
            <Image src="/brand/mark.svg" alt="" width={24} height={24} />
            AI Speedtest
          </Button>
          <nav aria-label="Footer" className="flex flex-wrap gap-1">
            {[
              ["/methodology", "Methodology"],
              ["/faq", "FAQ"],
              ["/privacy", "Privacy"],
            ].map(([href, label]) => (
              <Button
                key={href}
                variant="ghost"
                nativeButton={false}
                role="link"
                render={<Link href={href} />}
                className="min-h-11"
              >
                {label}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            made by{" "}
            <Button
              variant="link"
              nativeButton={false}
              role="link"
              render={
                <Link href="https://maty.as" target="_blank" rel="noreferrer" />
              }
              className="min-h-11"
            >
              maty.as
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                data-icon="inline-end"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Button>
          </p>
          <p>{PROTOCOL} · WebLLM 0.2.85</p>
        </div>
      </div>
    </footer>
  )
}
export function ArticleShell({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <>
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Button
          variant="ghost"
          nativeButton={false}
          role="link"
          render={<Link href="/" />}
          className="min-h-11"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            data-icon="inline-start"
            strokeWidth={2}
            aria-hidden="true"
          />
          AI Speedtest
        </Button>
        <nav aria-label="Main" className="flex flex-wrap gap-1">
          {[
            ["/", "Benchmark"],
            ["/methodology", "Methodology"],
            ["/faq", "FAQ"],
          ].map(([href, label]) => (
            <Button
              key={href}
              variant="ghost"
              nativeButton={false}
              role="link"
              render={<Link href={href} />}
              className="min-h-11"
            >
              {label}
            </Button>
          ))}
        </nav>
      </header>
      <Separator />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 sm:gap-10 sm:px-8 sm:py-12"
      >
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="text-base leading-relaxed text-pretty text-muted-foreground">
            {intro}
          </p>
        </div>
        {children}
      </main>
    </>
  )
}
