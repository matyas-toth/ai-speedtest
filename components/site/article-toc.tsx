"use client"

import { useEffect, useState } from "react"

export function ArticleToc({
  items,
}: {
  items: { href: string; label: string }[]
}) {
  const [active, setActive] = useState(items[0]?.href ?? "")
  const key = items.map((item) => item.href).join("|")
  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => section !== null)
    if (!sections.length) return
    let frame = 0
    const update = () => {
      frame = 0
      const offset = 110
      let current = sections[0].id
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset) current = section.id
      }
      setActive(`#${current}`)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return (
    <aside className="article-toc" aria-label="On this page">
      <nav>
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            data-active={active === item.href}
            aria-current={active === item.href ? "location" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
