import type { Metadata, Viewport } from "next"
import { Geist_Mono, Public_Sans } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteFooter } from "@/components/site/navigation"
import { siteUrl, isIndexable } from "@/lib/site"
import { cn } from "@/lib/utils"

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "AI Speedtest",
  robots: {
    index: isIndexable,
    follow: true,
    googleBot: {
      index: isIndexable,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
}
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
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
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-background focus:p-4"
          >
            Skip to content
          </a>
          {children}
          <SiteFooter />
        </ThemeProvider>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "yqeu9zi0ia");`}
        </Script>
      </body>
    </html>
  )
}
