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
      title="Privacy"
      toc={[
        { href: "#storage", label: "Browser storage" },
        { href: "#network", label: "Network requests" },
        { href: "#exports", label: "Result exports" },
      ]}
    >
      <div className="article-sections">
        <section id="storage">
          <h2>Browser storage</h2>
          <p>
            Your browser stores up to 20 completed runs, including measurements
            and the hardware and browser information it exposes. Your theme
            preference is saved locally, and model files may be cached when
            storage permits.
          </p>
          <p>
            You can remove saved runs from History, or clear this site’s data in
            your browser settings to remove history, preferences, and cached
            files.
          </p>
        </section>
        <section id="network">
          <h2>Network requests</h2>
          <p>
            Initial model and runtime downloads contact Hugging Face and GitHub.
            These services and the website host receive ordinary request
            information such as your IP address and browser headers.
          </p>
          <p>
            Microsoft Clarity records site usage, including pages viewed,
            clicks, and scrolls. It may set cookies, and session recordings can
            include visible screen content. Microsoft also receives ordinary
            request information such as your IP address and browser headers.
          </p>
        </section>
        <section id="exports">
          <h2>Result exports</h2>
          <p>
            Downloading results creates a JSON file on your device containing
            raw measurements, model and protocol details, hardware and browser
            information, and run conditions. Copying results puts the same
            information on your clipboard, so you can review it before sharing.
          </p>
          <p>
            The application does not automatically publish or upload result
            files, although usage recordings may capture results visible on
            screen.
          </p>
        </section>
      </div>
    </ArticleShell>
  )
}
