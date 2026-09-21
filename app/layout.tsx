import type { Metadata } from "next"
import { Geist_Mono, Public_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "AI Speedtest - Measure your PC’s local AI performance",
  description:
    "Benchmark real language model generation, prompt ingestion, and embeddings in your browser with WebGPU. Local execution, transparent scoring, and exportable results.",
}

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        publicSans.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
