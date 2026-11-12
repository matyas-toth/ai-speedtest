"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Copy01Icon,
  CpuIcon,
  Download01Icon,
  InformationCircleIcon,
  PlayIcon,
  RefreshIcon,
  TrashIcon,
} from "@hugeicons/core-free-icons"
import { SiteHeader } from "@/components/site/header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBenchmark } from "@/hooks/use-benchmark"
import {
  estimateScore,
  median,
  type EmbeddingSample,
  type Phase,
  type Result,
  type Sample,
} from "@/lib/benchmark"
import { BenchmarkGauge } from "./benchmark-gauge"

const format = (value: number | null | undefined, digits = 1) =>
  value == null
    ? "–"
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

function dateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function tableDate(value: string) {
  const date = new Date(value)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  })
}

function shortGpu(value: string) {
  const parts = value.split(" · ")
  let label = parts.at(-1) ?? value
  label = label
    .replace(/^NVIDIA\s+/i, "")
    .replace(/^AMD\s+/i, "")
    .replace(/^Intel\s+/i, "")
    .replace(/^Apple\s+/i, "")
    .replace(/\s*GPU$/i, "")
    .replace(/^GeForce\s+/i, "")
    .replace(/^Radeon\s+/i, "")
    .replace(/^Graphics\s+/i, "")
    .trim()
  return label || value
}

function browserLabel(value: string) {
  const edge = /Edg\/(\d+)/.exec(value)
  const chrome = /Chrome\/(\d+)/.exec(value)
  const firefox = /Firefox\/(\d+)/.exec(value)
  const safari = /Version\/(\d+).*Safari/.exec(value)
  const browser = edge
    ? `Edge ${edge[1]}`
    : chrome
      ? `Chrome ${chrome[1]}`
      : firefox
        ? `Firefox ${firefox[1]}`
        : safari
          ? `Safari ${safari[1]}`
          : ""
  const os = /Windows/.test(value)
    ? "Windows"
    : /Mac OS X/.test(value)
      ? "macOS"
      : /Android/.test(value)
        ? "Android"
        : /Linux/.test(value)
          ? "Linux"
          : ""
  return [browser, os].filter(Boolean).join(" on ") || "Not exposed"
}

function phaseIndex(phase: Phase | null) {
  if (!phase) return 0
  if (phase === "loading-llm") return 0
  if (phase === "warmup-llm") return 1
  if (phase === "llm") return 2
  return 3
}

type SortKey = "date" | "score" | "generation" | "passes"
type SortState = { key: SortKey; dir: "asc" | "desc" }

export function Dashboard() {
  const test = useBenchmark()
  const [repetitions, setRepetitions] = useState("3")
  const [tab, setTab] = useState("benchmark")
  const [selected, setSelected] = useState<Result | null>(null)
  const [exportFeedback, setExportFeedback] = useState("")
  const [historyFeedback, setHistoryFeedback] = useState("")
  const [confirmClear, setConfirmClear] = useState(false)
  const [sort, setSort] = useState<SortState>({ key: "date", dir: "desc" })
  const shown = selected ?? test.result
  const llm = selected?.llm ?? test.llm
  const embeddings = selected?.embeddings ?? test.embeddings
  const device = selected?.device ?? test.device
  const unavailable = device !== null && !device.available
  const metrics = [
    {
      title: "Text generation",
      value: mid(llm.map((s) => s.decode)),
      unit: "tok/s",
      digits: 1,
    },
    {
      title: "Prompt processing",
      value: mid(llm.map((s) => s.prefill)),
      unit: "tok/s",
      digits: 0,
    },
    {
      title: "Embeddings",
      value: mid(embeddings.map((s) => s.tokensPerSecond)),
      unit: "tok/s",
      digits: 0,
    },
    {
      title: "First token",
      value: mid(llm.map((s) => s.ttft)),
      unit: "ms",
      digits: 0,
    },
  ]
  const sortedHistory = [...test.history].sort((a, b) => {
    const direction = sort.dir === "asc" ? 1 : -1
    if (sort.key === "date")
      return (Date.parse(a.date) - Date.parse(b.date)) * direction
    if (sort.key === "score") return (a.score - b.score) * direction
    if (sort.key === "passes")
      return (a.repetitions - b.repetitions) * direction
    return (
      (median(a.llm.map((s) => s.decode)) -
        median(b.llm.map((s) => s.decode))) *
      direction
    )
  })
  const scoreDeltas = new Map<string, number>()
  const chronological = [...test.history].sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date)
  )
  chronological.forEach((run, index) => {
    for (let i = index - 1; i >= 0; i--) {
      const previous = chronological[i]
      if (
        previous.repetitions === run.repetitions &&
        previous.device.gpu === run.device.gpu
      ) {
        scoreDeltas.set(run.id, run.score - previous.score)
        break
      }
    }
  })
  const toggleSort = (key: SortKey) => {
    setSort((previous) =>
      previous.key === key
        ? { key, dir: previous.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    )
  }
  const start = () => {
    setSelected(null)
    setExportFeedback("")
    test.start(Number(repetitions))
  }
  const copyResult = async (result: Result) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setExportFeedback("Results copied to the clipboard.")
    } catch {
      setExportFeedback(
        "Clipboard access is unavailable; download the results instead."
      )
    }
  }
  const openRun = (run: Result) => {
    setSelected(run)
    setRepetitions(String(run.repetitions))
    setExportFeedback("")
    setHistoryFeedback("")
    setTab("benchmark")
  }
  const liveScore = test.busy ? estimateScore(llm, embeddings) : null
  const gaugeScore = shown?.score ?? liveScore ?? undefined
  const isState =
    unavailable || (test.error && !test.result && !test.busy)
  const heading = selected ? (
    <>
      Saved <em>run</em>
    </>
  ) : unavailable ? (
    <>
      Benchmark <em>unavailable</em>
    </>
  ) : test.error && !test.result && !test.busy ? (
    <>
      Run <em>failed</em>
    </>
  ) : test.busy ? (
    <>
      Benchmark <em>in progress</em>
    </>
  ) : (
    <>
      Your <em>AI score</em>
    </>
  )

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="dashboard-shell">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(String(value))
            setConfirmClear(false)
            setHistoryFeedback("")
          }}
          className="gap-0"
        >
          <div className="dashboard-topline">
            {selected ? (
              <button
                type="button"
                className="back-link saved-back"
                onClick={() => {
                  setSelected(null)
                  setExportFeedback("")
                  setTab("history")
                }}
              >
                ← History
              </button>
            ) : (
              <TabsList
                variant="default"
                className="view-tabs"
                aria-label="Benchmark views"
              >
                <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
                <TabsTrigger value="history">
                  History
                  {test.history.length ? (
                    <span className="tab-count">{test.history.length}</span>
                  ) : null}
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          <TabsContent value="benchmark" className="space-y-0">
            <div
              className={`dashboard-heading${shown ? " is-result" : test.busy ? " is-running" : ""}${isState ? " is-state" : ""}`}
            >
              <h1>{heading}</h1>
              {selected ? (
                <p className="dashboard-meta">
                  {dateTime(selected.date)}, {selected.repetitions} passes
                </p>
              ) : null}
            </div>

            <section className="benchmark-panel" aria-label="AI benchmark">
              {unavailable ? (
                <div className="instrument-body">
                  <div className="unavailable-state">
                    <div className="unavailable-copy">
                      <span className="unavailable-icon">
                        <HugeiconsIcon icon={CpuIcon} size={22} />
                      </span>
                      <h2>WebGPU isn&apos;t available here</h2>
                      {device?.reason &&
                      device.reason !== "This browser does not expose WebGPU." ? (
                        <p>{device.reason}</p>
                      ) : null}
                    </div>
                    <div className="unavailable-panel">
                      <ul className="unavailable-steps">
                        <li>Update Chrome, Edge, or another Chromium browser.</li>
                        <li>Enable hardware acceleration in the browser settings.</li>
                        <li>Update the graphics driver, then reload this page.</li>
                      </ul>
                      <Button
                        variant="outline"
                        render={<Link href="/faq#question-6" />}
                        nativeButton={false}
                      >
                        Read the WebGPU checklist
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : test.error && !shown && !test.busy ? (
                <div className="instrument-body">
                  <div className="unavailable-state">
                    <div className="unavailable-copy">
                      <span className="unavailable-icon" data-tone="error">
                        <HugeiconsIcon icon={Alert02Icon} size={22} />
                      </span>
                      <h2>The benchmark could not finish</h2>
                      <p>{test.error}</p>
                    </div>
                    <div className="unavailable-panel">
                      <TestLength
                        repetitions={repetitions}
                        setRepetitions={setRepetitions}
                      />
                      <Button className="run-button" onClick={start}>
                        <HugeiconsIcon icon={RefreshIcon} />
                        Try again
                      </Button>
                      <Button
                        variant="outline"
                        render={<Link href="/faq#question-6" />}
                        nativeButton={false}
                      >
                        WebGPU help
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="instrument-body">
                    <div className="gauge-panel">
                      <BenchmarkGauge score={gaugeScore} busy={test.busy} />
                    </div>
                    <div className="benchmark-controls">
                      {test.busy ? (
                        <RunningState
                          progress={test.progress}
                          elapsed={test.elapsed}
                          status={test.status}
                          phase={test.phase}
                          cancel={test.cancel}
                        />
                      ) : shown ? (
                        <>
                          <MetricGrid metrics={metrics} />
                          <ResultActions
                            feedback={exportFeedback}
                            onDownload={() => download(shown)}
                            onCopy={() => copyResult(shown)}
                            onRunAgain={start}
                          />
                        </>
                      ) : (
                        <>
                          <ReadyState
                            repetitions={repetitions}
                            setRepetitions={setRepetitions}
                            notice={test.notice}
                            device={device}
                            hasMeasurements={llm.length > 0 || embeddings.length > 0}
                            onStart={start}
                          />
                          <MetricGrid metrics={metrics} />
                        </>
                      )}
                      <div className="device-summary">
                        <span
                          className="device-indicator"
                          data-available={device?.available ?? false}
                          aria-hidden="true"
                        />
                        <span className="device-name" title={device?.gpu}>
                          {device?.available
                            ? device.gpu
                            : device
                              ? "WebGPU unavailable"
                              : "Detecting your GPU…"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>

            {shown ? (
              <div className="details-stack">
                <details className="detail-section">
                  <summary>Device and test details</summary>
                  <div className="details-content">
                    <dl className="device-facts">
                      <Fact label="Graphics processor" value={device?.gpu ?? "Detecting…"} />
                      <Fact
                        label="Logical processors"
                        value={device?.threads ? String(device.threads) : "Not exposed"}
                      />
                      <Fact
                        label="Reported memory"
                        value={device?.memory ? `≈ ${device.memory} GB` : "Not exposed"}
                      />
                      <Fact
                        label="Storage buffer limit"
                        value={
                          device?.maxBufferMB ? `${device.maxBufferMB} MB` : "Not exposed"
                        }
                      />
                      <Fact
                        label="Float16 support"
                        value={
                          !device ? "Checking…" : device.f16 ? "Available" : "Not exposed"
                        }
                      />
                      <Fact label="Language model" value="SmolLM2 360M" />
                      <Fact label="Embedding model" value="Arctic Embed 33M" />
                      <Fact label="Runtime" value={shown?.runtime ?? "WebLLM 0.2.85"} />
                      <Fact
                        label="Browser"
                        value={
                          device?.browser ? browserLabel(device.browser) : "Not exposed"
                        }
                      />
                      <Fact label="Passes" value={`${shown.repetitions} measured`} />
                      <Fact
                        label="Duration"
                        value={`${format(shown.durationMs / 1000, 1)} s`}
                      />
                      <Fact label="Recorded" value={dateTime(shown.date)} />
                    </dl>
                    <Link href="/methodology" className="detail-link">
                      How the benchmark works
                      <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                    </Link>
                  </div>
                </details>
                <details className="detail-section">
                  <summary>Individual measurements</summary>
                  <div className="details-content">
                    <Samples llm={llm} embeddings={embeddings} />
                    <details className="raw-result">
                      <summary>Raw JSON</summary>
                      <pre data-testid="result-json">
                        {JSON.stringify(shown, null, 2)}
                      </pre>
                    </details>
                  </div>
                </details>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="history" className="space-y-0">
            <div className="history-heading">
              <h1>
                Run <em>history</em>
              </h1>
              <div className="history-heading-actions">
                {test.history.length && !confirmClear ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={test.busy}
                    onClick={() => setConfirmClear(true)}
                  >
                    <HugeiconsIcon icon={TrashIcon} size={16} />
                    Clear history
                  </Button>
                ) : null}
              </div>
            </div>

            {historyFeedback ? (
              <p role="status" className="notice-line">
                <HugeiconsIcon icon={InformationCircleIcon} size={14} />
                {historyFeedback}
              </p>
            ) : null}

            {!test.history.length ? (
              <div className="history-empty">
                <EmptyDial />
                <h2>No runs yet</h2>
                <Button onClick={() => setTab("benchmark")}>
                  Run a benchmark
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </Button>
              </div>
            ) : (
              <>
                <HistoryTrend runs={test.history} />
                {confirmClear ? (
                  <div className="confirm-strip" role="alert">
                    <p>
                      <HugeiconsIcon icon={Alert02Icon} size={15} />
                      Deleting all {test.history.length} saved runs from this
                      browser cannot be undone.
                    </p>
                    <div className="actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        autoFocus
                        onClick={() => setConfirmClear(false)}
                      >
                        Keep runs
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="danger-solid"
                        disabled={test.busy}
                        onClick={() => {
                          setHistoryFeedback(test.clearHistory())
                          setSelected(null)
                          setConfirmClear(false)
                        }}
                      >
                        Delete all runs
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="history-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortHeader label="Date" sortKey="date" sort={sort} onSort={toggleSort} />
                        <TableHead>Device</TableHead>
                        <SortHeader label="Score" sortKey="score" sort={sort} onSort={toggleSort} />
                        <SortHeader
                          label="Text generation"
                          sortKey="generation"
                          sort={sort}
                          onSort={toggleSort}
                        />
                        <SortHeader label="Passes" sortKey="passes" sort={sort} onSort={toggleSort} />
                        <TableHead>
                          <span className="sr-only">View run</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHistory.map((run) => (
                        <TableRow
                          key={run.id}
                          onClick={() => openRun(run)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              openRun(run)
                            }
                          }}
                          tabIndex={0}
                          aria-label={`View run from ${dateTime(run.date)}`}
                        >
                          <TableCell>
                            <span className="run-date">{tableDate(run.date)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="gpu-name" title={run.device.gpu}>
                              {shortGpu(run.device.gpu)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="score-cell">
                              <strong>{format(run.score, 0)}</strong>
                              {scoreDeltas.has(run.id) ? (
                                <span
                                  className="score-delta"
                                  data-direction={
                                    scoreDeltas.get(run.id)! > 0
                                      ? "up"
                                      : scoreDeltas.get(run.id)! < 0
                                        ? "down"
                                        : "flat"
                                  }
                                >
                                  {scoreDeltas.get(run.id)! > 0
                                    ? `+${scoreDeltas.get(run.id)}`
                                    : scoreDeltas.get(run.id)}
                                </span>
                              ) : null}
                            </span>
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {format(median(run.llm.map((s) => s.decode)))} tok/s
                          </TableCell>
                          <TableCell className="tabular-nums">{run.repetitions}</TableCell>
                          <TableCell>
                            <HugeiconsIcon
                              icon={ArrowRight01Icon}
                              size={16}
                              className="row-chevron"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="history-cards">
                  {sortedHistory.map((run) => (
                    <button key={run.id} className="run-card" onClick={() => openRun(run)}>
                      <span className="run-card-date">{tableDate(run.date)}</span>
                      <span className="run-card-score">
                        {format(run.score, 0)}
                        {scoreDeltas.has(run.id) ? (
                          <span
                            className="run-card-delta"
                            data-direction={
                              scoreDeltas.get(run.id)! > 0
                                ? "up"
                                : scoreDeltas.get(run.id)! < 0
                                  ? "down"
                                  : "flat"
                            }
                          >
                            {scoreDeltas.get(run.id)! > 0
                              ? `+${scoreDeltas.get(run.id)}`
                              : scoreDeltas.get(run.id)}
                          </span>
                        ) : null}
                      </span>
                      <span className="run-card-gpu" title={run.device.gpu}>
                        {shortGpu(run.device.gpu)}
                      </span>
                      <span className="run-card-meta">
                        <span>{format(median(run.llm.map((s) => s.decode)))} tok/s</span>
                        <span>{run.repetitions} passes</span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={16}
                          className="run-card-chevron"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}

function ReadyState({
  repetitions,
  setRepetitions,
  notice,
  device,
  hasMeasurements,
  onStart,
}: {
  repetitions: string
  setRepetitions: (value: string) => void
  notice: string | null
  device: ReturnType<typeof useBenchmark>["device"]
  hasMeasurements: boolean
  onStart: () => void
}) {
  return (
    <>
      {notice ? (
        <p className="notice-line" role="status">
          <HugeiconsIcon icon={InformationCircleIcon} size={14} />
          {notice}
        </p>
      ) : null}
      <TestLength repetitions={repetitions} setRepetitions={setRepetitions} />
      <Button className="run-button" onClick={onStart} disabled={!device?.available}>
        <HugeiconsIcon icon={PlayIcon} />
        {device === null
          ? "Checking compatibility…"
          : hasMeasurements
            ? "Run again"
            : "Start benchmark"}
      </Button>
    </>
  )
}

function TestLength({
  repetitions,
  setRepetitions,
}: {
  repetitions: string
  setRepetitions: (value: string) => void
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Test length">
      {[
        { value: "3", label: "3 passes" },
        { value: "5", label: "5 passes" },
      ].map((option) => (
        <label key={option.value} data-selected={repetitions === option.value}>
          <input
            type="radio"
            name="test-length"
            value={option.value}
            checked={repetitions === option.value}
            onChange={() => setRepetitions(option.value)}
            className="sr-only"
          />
          <span className="seg-title">{option.label}</span>
        </label>
      ))}
    </div>
  )
}

function RunningState({
  progress,
  elapsed,
  status,
  phase,
  cancel,
}: {
  progress: number
  elapsed: number
  status: string
  phase: Phase | null
  cancel: () => void
}) {
  const active = phaseIndex(phase)
  const steps = ["Load", "Warm-up", "Generate", "Embed"]
  return (
    <>
      <div className="run-progress">
        <div className="progress-meta">
          <span>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} elapsed
          </span>
          <strong>{Math.round(progress)}%</strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Benchmark progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="progress-fill" style={{ width: `${Math.max(2, progress)}%` }} />
        </div>
        <div className="phase-steps" aria-hidden="true">
          {steps.map((step, index) => (
            <span
              className="phase-step"
              data-status={index < active ? "done" : index === active ? "active" : "idle"}
              key={step}
            >
              {step}
            </span>
          ))}
        </div>
        <p className="sr-only" role="status">
          {status}
        </p>
      </div>
      <Button variant="outline" className="cancel-button" onClick={cancel}>
        <HugeiconsIcon icon={Cancel01Icon} />
        Cancel benchmark
      </Button>
    </>
  )
}

function ResultActions({
  feedback,
  onDownload,
  onCopy,
  onRunAgain,
}: {
  feedback: string
  onDownload: () => void
  onCopy: () => void
  onRunAgain: () => void
}) {
  return (
    <div className="result-actions-block">
      <div className="result-actions-row">
        <Button variant="outline" onClick={onRunAgain}>
          <HugeiconsIcon icon={PlayIcon} size={14} />
          Run again
        </Button>
        <Button variant="outline" onClick={onDownload}>
          <HugeiconsIcon icon={Download01Icon} size={14} />
          Download
        </Button>
        <Button variant="outline" onClick={onCopy}>
          <HugeiconsIcon icon={Copy01Icon} size={14} />
          Copy JSON
        </Button>
      </div>
      <p className="result-feedback" role="status">
        {feedback}
      </p>
    </div>
  )
}

function MetricGrid({
  metrics,
}: {
  metrics: { title: string; value: number | null; unit: string; digits: number }[]
}) {
  return (
    <dl className="metrics-strip" aria-label="Benchmark measurements">
      {metrics.map((metric) => (
        <div className="metric" key={metric.title}>
          <dt>{metric.title}</dt>
          <dd>
            <span>{format(metric.value, metric.digits)}</span>
            <span className="metric-unit">{metric.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

function HistoryTrend({ runs }: { runs: Result[] }) {
  if (runs.length < 2) return null
  const points = [...runs].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
  const values = points.map((run) => run.score)
  const min = Math.min(...values, 1000) - 100
  const max = Math.max(...values, 1000) + 100
  const width = 1000
  const height = 120
  const padX = 18
  const padY = 16
  const x = (index: number) =>
    padX + (index / Math.max(1, points.length - 1)) * (width - padX * 2)
  const y = (value: number) =>
    padY + (1 - (value - min) / (max - min)) * (height - padY * 2)
  const line = points
    .map((run, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(run.score)}`)
    .join(" ")
  const targetY = y(1000)
  return (
    <div className="history-trend">
      <h2>Score trend</h2>
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <line
          x1={padX}
          y1={targetY}
          x2={width - padX}
          y2={targetY}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="5 6"
        />
        <text
          x={width - padX}
          y={targetY - 6}
          textAnchor="end"
          fill="var(--muted-foreground)"
          fontFamily="var(--font-mono)"
          fontSize="11"
        >
          1,000
        </text>
        <path
          d={line}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((run, index) => {
          const latest = index === points.length - 1
          return (
            <circle
              key={run.id}
              cx={x(index)}
              cy={y(run.score)}
              r={latest ? 5 : 3.5}
              fill={latest ? "var(--signal)" : "var(--card)"}
              stroke="var(--signal)"
              strokeWidth={latest ? 0 : 1.5}
            />
          )
        })}
      </svg>
    </div>
  )
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string
  sortKey: SortKey
  sort: SortState
  onSort: (key: SortKey) => void
}) {
  const active = sort.key === sortKey
  return (
    <TableHead aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className="sort-button" onClick={() => onSort(sortKey)}>
        {label}
        {active ? (
          <HugeiconsIcon
            icon={sort.dir === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
            size={14}
          />
        ) : null}
      </button>
    </TableHead>
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

function Samples({ llm, embeddings }: { llm: Sample[]; embeddings: EmbeddingSample[] }) {
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
        {Array.from({ length: Math.max(llm.length, embeddings.length) }, (_, i) => (
          <TableRow key={i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell className="text-right tabular-nums">{format(llm[i]?.decode)}</TableCell>
            <TableCell className="text-right tabular-nums">{format(llm[i]?.prefill)}</TableCell>
            <TableCell className="text-right tabular-nums">{format(llm[i]?.ttft)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {format(embeddings[i]?.tokensPerSecond)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EmptyDial() {
  return (
    <svg className="empty-dial" viewBox="0 0 120 76" fill="none" aria-hidden="true">
      <path
        d="M 12 68 A 48 48 0 1 1 108 68"
        stroke="var(--border)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 12 68 A 48 48 0 0 1 44 26"
        stroke="var(--signal)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="60" cy="68" r="4" fill="var(--card)" stroke="var(--signal)" strokeWidth="2" />
      <line
        x1="60"
        y1="68"
        x2="90"
        y2="38"
        stroke="var(--foreground)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
