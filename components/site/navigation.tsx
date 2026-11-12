import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site/header"
import { ArticleToc } from "@/components/site/article-toc"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link href="/" className="brand-link">
          <span className="brand-mark">
            <Image src="/brand/mark.svg" alt="" width={31} height={31} />
          </span>
          AI Speedtest
        </Link>
        <div className="footer-meta">
          <Link href="/privacy">Privacy</Link>
          <p>© {new Date().getFullYear()} AI Speedtest</p>
          <a href="https://maty.as" target="_blank" rel="noreferrer">
            maty.as
          </a>
        </div>
      </div>
    </footer>
  )
}

export function ArticleShell({
  title,
  toc,
  children,
}: {
  title: string
  toc: { href: string; label: string }[]
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="article-shell">
        <Link href="/" className="back-link">
          ← Back to benchmark
        </Link>
        <header className="article-heading">
          <h1>{title}</h1>
        </header>
        <div className="article-layout">
          <ArticleToc items={toc} />
          <div className="article-body">{children}</div>
        </div>
      </main>
    </>
  )
}
