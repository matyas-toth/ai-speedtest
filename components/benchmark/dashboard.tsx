"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, PlayIcon, StopIcon } from "@hugeicons/core-free-icons"
import { SiteHeader } from "@/components/site/header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useBenchmark } from "@/hooks/use-benchmark"
import {
  median,
  type Result,
  type Sample,
  type EmbeddingSample,
} from "@/lib/benchmark"
import { BenchmarkGauge } from "./benchmark-gauge"

const format = (value: number | null | undefined, digits = 1) =>
  value == null
    ? "—"
    : value.toLocaleString(undefined, { maximumFractionDigits: digits })
const mid = (values: number[]) => (values.length ? median(values) : null)

function download(result: Result) {
  const blob = new Blob([JSON.stringify(result, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `ai-speedtest-${result.date.replace(/[:.]/g, "-")}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function Dashboard() {
  const test = useBenchmark()
  const [repetitions, setRepetitions] = useState("3")
  const [tab, setTab] = useState("benchmark")
  const [selected, setSelected] = useState<Result | null>(null)
  const [exportFeedback, setExportFeedback] = useState("")
  const [historyFeedback, setHistoryFeedback] = useState("")
  const [confirmClear, setConfirmClear] = useState(false)
  const shown = selected ?? test.result
  const llm = selected?.llm ?? test.llm
  const embeddings = selected?.embeddings ?? test.embeddings
  const device = selected?.device ?? test.device
  const hasMeasurements = llm.length > 0 || embeddings.length > 0
  const start = () => {
    setSelected(null)
    setExportFeedback("")
    test.start(Number(repetitions))
  }
  const metrics = [
    {
      title: "Text generation",
      value: mid(llm.map((s) => s.decode)),
      unit: "tok/s",
    },
    {
      title: "Prompt processing",
      value: mid(llm.map((s) => s.prefill)),
      unit: "tok/s",
    },
    {
      title: "Embeddings",
      value: mid(embeddings.map((s) => s.tokensPerSecond)),
      unit: "tok/s",
    },
    {
      title: "Time to first token",
      value: mid(llm.map((s) => s.ttft)),
      unit: "ms",
    },
  ]

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="dashboard-shell">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(String(value))
            setConfirmClear(false)
          }}
          className="gap-8"
        >
          <TabsList
            variant="line"
            className="dashboard-tabs"
            aria-label="Benchmark views"
          >
            <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
            <TabsTrigger value="history">
              History
              {test.history.length ? (
                <span className="history-count">{test.history.length}</span>
              ) : null}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="benchmark" className="space-y-6">
            <div className="dashboard-heading">
              <h1>Test your AI performance</h1>
              <p>
                Measure how fast your device runs AI models in your browser.
              </p>
            </div>
            {test.device && !test.device.available ? (
              <Alert>
                <AlertTitle>WebGPU is unavailable</AlertTitle>
                <AlertDescription>
                  {test.device.reason}{" "}
                  <Link href="/faq#question-6">Get help with WebGPU</Link>.
                </AlertDescription>
              </Alert>
            ) : null}
            {test.error && !selected ? (
              <Alert variant="destructive">
                <AlertTitle>The benchmark could not finish</AlertTitle>
                <AlertDescription className="break-words">
                  {test.error}
                  <p className="mt-2">
                    Check your connection and available GPU memory, then try
                    again.
                  </p>
                </AlertDescription>
              </Alert>
            ) : null}
            {selected ? (
              <div className="saved-run-banner">
                <p>Saved run from {new Date(selected.date).toLocaleString()}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected(null)
                    setExportFeedback("")
                  }}
                >
                  Back to current run
                </Button>
              </div>
            ) : null}
            {shown?.warnings.map((warning) => (
              <Alert key={warning}>
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            ))}

            <section className="benchmark-panel" aria-label="AI benchmark">
              <div className="gauge-panel">
                <BenchmarkGauge
                  llm={llm}
                  embeddings={embeddings}
                  score={shown?.score}
                  busy={test.busy}
                />
              </div>
              <div className="benchmark-controls">
                <div className="space-y-2">
                  <label htmlFor="test-length" className="text-sm font-medium">
                    Test length
                  </label>
                  <select
                    id="test-length"
                    value={repetitions}
                    onChange={(event) => setRepetitions(event.target.value)}
                    disabled={test.busy}
                    className="test-length"
                  >
                    <option value="3">Standard · 3 passes</option>
                    <option value="5">Extended · 5 passes</option>
                  </select>
                </div>
                {test.busy ? (
                  <Button
                    variant="outline"
                    className="run-button"
                    onClick={test.cancel}
                  >
                    <HugeiconsIcon icon={StopIcon} />
                    Cancel benchmark
                  </Button>
                ) : (
                  <Button
                    onClick={start}
                    disabled={!test.device?.available}
                    className="run-button"
                  >
                    <HugeiconsIcon icon={PlayIcon} />
                    {test.device === null
                      ? "Checking compatibility…"
                      : shown || hasMeasurements
                        ? "Run again"
                        : "Start benchmark"}
                  </Button>
                )}
                {test.busy ? (
                  <div className="run-progress">
                    <div className="flex justify-between gap-3 text-xs text-muted-foreground tabular-nums">
                      <span>
                        {Math.floor(test.elapsed / 60)}:
                        {String(test.elapsed % 60).padStart(2, "0")} elapsed
                      </span>
                      <span>{Math.round(test.progress)}%</span>
                    </div>
                    <Progress
                      value={test.progress}
                      aria-label="Benchmark progress"
                    />
                    <p role="status" className="break-words">
                      {test.status}
                    </p>
                    <p>Keep this tab visible for accurate results.</p>
                  </div>
                ) : (
                  <p className="benchmark-help" role="status">
                    {shown
                      ? `Completed ${shown.repetitions} passes in ${format(shown.durationMs / 1000, 0)} seconds.`
                      : "The first run downloads about 400 MB of model files, which are cached for future tests."}
                  </p>
                )}
                <div className="device-summary">
                  <span
                    className="device-indicator"
                    data-available={device?.available ?? false}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Graphics processor
                    </p>
                    <p className="mt-1 text-sm break-words">
                      {device?.available
                        ? device.gpu
                        : device
                          ? "WebGPU unavailable"
                          : "Detecting your GPU…"}
                    </p>
                  </div>
                </div>
              </div>
              <dl className="metrics-strip" aria-label="Benchmark measurements">
                {metrics.map((metric) => (
                  <div key={metric.title}>
                    <dt>{metric.title}</dt>
                    <dd>
                      <span>{format(metric.value)}</span>
                      <span className="metric-unit">{metric.unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            {test.notice && !selected ? (
              <p
                role="status"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {test.notice}
              </p>
            ) : null}
            {shown ? (
              <div className="result-actions">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => download(shown)}>
                    <HugeiconsIcon icon={Download01Icon} />
                    Download results
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          JSON.stringify(shown, null, 2)
                        )
                        setExportFeedback("Results copied to the clipboard.")
                      } catch {
                        setExportFeedback(
                          "Clipboard access is unavailable; download the results instead."
                        )
                      }
                    }}
                  >
                    Copy JSON
                  </Button>
                </div>
                <p role="status" className="text-sm text-muted-foreground">
                  {exportFeedback}
                </p>
              </div>
            ) : null}
            <details className="detail-section">
              <summary>Device and test details</summary>
              <div className="details-content">
                <dl className="device-facts">
                  <Fact
                    label="Graphics processor"
                    value={device?.gpu ?? "Detecting…"}
                  />
                  <Fact
                    label="Logical processors"
                    value={
                      device?.threads ? String(device.threads) : "Not exposed"
                    }
                  />
                  <Fact
                    label="Reported memory"
                    value={
                      device?.memory ? `≈ ${device.memory} GB` : "Not exposed"
                    }
                  />
                  <Fact
                    label="Storage buffer limit"
                    value={
                      device?.maxBufferMB
                        ? `${device.maxBufferMB} MB`
                        : "Not exposed"
                    }
                  />
                  <Fact
                    label="Float16 support"
                    value={
                      !device
                        ? "Checking…"
                        : device.f16
                          ? "Available"
                          : "Not exposed"
                    }
                  />
                  <Fact label="Language model" value="SmolLM2 · 360M" />
                  <Fact label="Embedding model" value="Arctic Embed · 33M" />
                  <Fact
                    label="Runtime"
                    value={shown?.runtime ?? "WebLLM 0.2.85"}
                  />
                </dl>
                <Link
                  href="/methodology"
                  className="text-sm text-primary hover:underline"
                >
                  How the benchmark works →
                </Link>
              </div>
            </details>
            {hasMeasurements ? (
              <details className="detail-section">
                <summary>Individual measurements</summary>
                <div className="details-content">
                  <Samples llm={llm} embeddings={embeddings} />
                  {embeddings.length ? (
                    <p className="text-xs text-muted-foreground">
                      Embedding throughput:{" "}
                      {format(mid(embeddings.map((s) => s.documentsPerSecond)))}{" "}
                      documents/s, with 384 dimensions and a batch size of 4.
                    </p>
                  ) : null}
                  {shown ? (
                    <details className="raw-result">
                      <summary>Raw JSON</summary>
                      <pre data-testid="result-json">
                        {JSON.stringify(shown, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              </details>
            ) : null}
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <div className="history-heading">
              <div>
                <h1>History</h1>
                <p>Completed benchmarks saved in this browser.</p>
              </div>
              {test.history.length ? (
                confirmClear ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm">
                      Clear {test.history.length} saved runs?
                    </span>
                    <Button
                      variant="destructive"
                      disabled={test.busy}
                      onClick={() => {
                        setHistoryFeedback(test.clearHistory())
                        setSelected(null)
                        setConfirmClear(false)
                      }}
                    >
                      Clear runs
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setConfirmClear(false)}
                    >
                      Keep runs
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    disabled={test.busy}
                    onClick={() => setConfirmClear(true)}
                  >
                    Clear history
                  </Button>
                )
              ) : null}
            </div>
            {historyFeedback ? (
              <p
                role="status"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {historyFeedback}
              </p>
            ) : null}
            {!test.history.length ? (
              <div className="history-empty">
                <h2>No saved benchmarks</h2>
                <p>
                  Your results will appear here after you complete a benchmark.
                </p>
                <Button variant="outline" onClick={() => setTab("benchmark")}>
                  Go to benchmark
                </Button>
              </div>
            ) : (
              <div className="history-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Graphics processor</TableHead>
                      <TableHead className="text-right">AI score</TableHead>
                      <TableHead className="text-right">
                        Text generation
                      </TableHead>
                      <TableHead className="text-right">Passes</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {test.history.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(run.date).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell
                          className="max-w-56 truncate"
                          title={run.device.gpu}
                        >
                          {run.device.gpu}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {format(run.score, 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {format(median(run.llm.map((s) => s.decode)))} tok/s
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {run.repetitions}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={test.busy}
                            aria-label={`View run from ${new Date(run.date).toLocaleString()}`}
                            onClick={() => {
                              setSelected(run)
                              setRepetitions(String(run.repetitions))
                              setExportFeedback("")
                              setTab("benchmark")
                            }}
                          >
                            View run →
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Samples({
  llm,
  embeddings,
}: {
  llm: Sample[]
  embeddings: EmbeddingSample[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pass</TableHead>
          <TableHead className="text-right">Generation (tok/s)</TableHead>
          <TableHead className="text-right">Prompt (tok/s)</TableHead>
          <TableHead className="text-right">First token (ms)</TableHead>
          <TableHead className="text-right">Embeddings (tok/s)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from(
          { length: Math.max(llm.length, embeddings.length) },
          (_, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell className="text-right tabular-nums">
                {format(llm[i]?.decode)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {format(llm[i]?.prefill)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {format(llm[i]?.ttft)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {format(embeddings[i]?.tokensPerSecond)}
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  )
}
