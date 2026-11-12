"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/methodology", label: "Methodology" },
  { href: "/faq", label: "FAQ" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-link">
          <span className="brand-mark">
            <Image src="/brand/mark.svg" alt="" width={31} height={31} priority />
          </span>
          AI Speedtest
        </Link>
        <nav className="header-nav" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={pathname === link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Button
            variant="ghost"
            size="icon"
            className="theme-toggle"
            aria-label="Toggle color theme"
            title="Toggle color theme (D)"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <HugeiconsIcon icon={Sun03Icon} className="hidden dark:block" />
            <HugeiconsIcon icon={Moon02Icon} className="dark:hidden" />
          </Button>
        </div>
      </div>
    </header>
  )
}
