import type { MetadataRoute } from "next"
import { description } from "@/lib/site"
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Speedtest",
    short_name: "AI Speedtest",
    description,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#2454eb",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
