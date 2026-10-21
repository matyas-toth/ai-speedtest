import Link from "next/link"
import { SiteHeader } from "@/components/site/header"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/methodology">Methodology</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <a href="https://maty.as" target="_blank" rel="noreferrer">
        maty.as
      </a>
    </footer>
  )
}

export function ArticleShell({
  title,
  intro,
  children,
}: {
  title: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="article-shell">
        <Link href="/" className="back-link">
          ← Back to benchmark
        </Link>
        <div className="article-heading">
          <h1>{title}</h1>
          {intro ? <p>{intro}</p> : null}
        </div>
        {children}
      </main>
    </>
  )
}
