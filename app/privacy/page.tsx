import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArticleShell } from "@/components/site/navigation"
import { pageMetadata } from "@/lib/site"
export const metadata = pageMetadata(
  "Benchmark privacy & local storage",
  "Learn what AI Speedtest stores locally, what happens during model downloads, and how benchmark results and JSON exports are handled.",
  "/privacy"
)
export default function Page() {
  return (
    <ArticleShell
      title="Your benchmark stays on your device."
      intro="AI Speedtest runs inference locally. The application does not upload your benchmark results or require an account."
    >
      <div className="grid max-w-4xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>What this browser stores</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-pretty">
              Up to 20 completed benchmark runs are saved in localStorage,
              including measurements and hardware and browser information
              exposed by your browser. Your theme preference is also stored
              locally. Model files may be cached when browser storage permits.
              Clear this site’s data in your browser settings to remove local
              history, preferences, and cached files.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Downloads and network requests</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-pretty">
              The initial model and runtime downloads contact Hugging Face and
              GitHub. Those services and the website host can receive ordinary
              request information such as your IP address and browser headers.
              Their handling of those requests is separate from local benchmark
              processing. The application includes no analytics or advertising
              trackers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Exporting results</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-pretty">
              JSON export creates a file on your device. It includes raw
              samples, model and protocol details, browser and hardware
              information, and run conditions. Review that file before sharing
              it. Exporting does not automatically publish it or send it to a
              server.
            </p>
          </CardContent>
        </Card>
      </div>
    </ArticleShell>
  )
}
