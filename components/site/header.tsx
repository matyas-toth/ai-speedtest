"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <header className="site-header">
      <Link href="/" className="brand-link">
        <Image src="/brand/mark.svg" alt="" width={28} height={28} priority />
        AI Speedtest
      </Link>
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label="Toggle color theme"
        title="Toggle color theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        <HugeiconsIcon icon={Sun03Icon} className="hidden dark:block" />
        <HugeiconsIcon icon={Moon02Icon} className="dark:hidden" />
      </Button>
    </header>
  )
}
