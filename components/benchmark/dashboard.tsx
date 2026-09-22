"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Download01Icon,
  Moon02Icon,
  PlayIcon,
  StopIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { useBenchmark } from "@/hooks/use-benchmark"
import {
  median,
  type Result,
  type Sample,
  type EmbeddingSample,
} from "@/lib/benchmark"
import { Methodology } from "./methodology"

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

export function Dashboard({ children }: { children?: React.ReactNode }) {
  const test = useBenchmark()
  const [repetitions, setRepetitions] = useState("3")
  const [tab, setTab] = useState("benchmark")
  const [selected, setSelected] = useState<Result | null>(null)
  const [exportFeedback, setExportFeedback] = useState("")
  const { resolvedTheme, setTheme } = useTheme()
  const shown = selected || test.result
  const llm = selected?.llm || test.llm
  const embeddings = selected?.embeddings || test.embeddings
  const start = () => {
    setSelected(null)
    test.start(Number(repetitions))
  }
  const metrics = [
    {
      title: "LLM decode",
      value: mid(llm.map((s) => s.decode)),
      unit: "tok/s",
      description: "Generating new text",
      detail: "128 output tokens · SmolLM2",
    },
    {
      title: "Prompt ingest",
      value: mid(llm.map((s) => s.prefill)),
      unit: "tok/s",
      description: "Reading your input",
      detail: "Fixed prompt · fresh KV cache",
    },
    {
      title: "Embeddings",
      value: mid(embeddings.map((s) => s.tokensPerSecond)),
      unit: "tok/s",
      description: "Turning text into vectors",
      detail: "4 documents · Arctic Embed S",
    },
    {
      title: "First token",
      value: mid(llm.map((s) => s.ttft)),
      unit: "ms",
      description: "Runtime prefill latency",
      detail: "Lower is better",
    },
  ]
  return (
    <div>
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <Image src="/brand/mark.svg" alt="" width={28} height={28} />
          AI Speedtest
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle color theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <HugeiconsIcon icon={Moon02Icon} />
          </Button>
        </div>
      </header>
      <Separator />
      <main
        id="main-content"
        className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-12"
      >
        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex max-w-2xl flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How fast is your PC at AI?
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              A free local AI speed test for your PC. Measure LLM tokens per
              second, prompt processing, and embeddings with real models running
              in your browser.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">
              {test.device === null
                ? "Checking WebGPU…"
                : test.device.available
                  ? "WebGPU available"
                  : "WebGPU unavailable"}
            </Badge>
          </div>
        </section>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(String(value))}
          className="gap-7"
        >
          <TabsList variant="line">
            <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
            <TabsTrigger value="history">
              History
              {test.history.length > 0 ? ` (${test.history.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="methodology">Methodology</TabsTrigger>
          </TabsList>
          <TabsContent value="benchmark" className="flex flex-col gap-6">
            {test.device && !test.device.available ? (
              <Alert>
                <AlertTitle>WebGPU is needed to run this suite</AlertTitle>
                <AlertDescription>
                  {test.device.reason} You can still explore the methodology and
                  saved results.
                </AlertDescription>
              </Alert>
            ) : null}
            {test.error ? (
              <Alert variant="destructive">
                <AlertTitle>Benchmark interrupted</AlertTitle>
                <AlertDescription className="break-words">
                  {test.error}
                  <p className="mt-2">
                    Check your connection and available GPU memory, close other
                    GPU-heavy tabs, then try again. No complete score was saved.
                  </p>
                </AlertDescription>
              </Alert>
            ) : null}
            {test.notice ? (
              <Alert>
                <AlertTitle>Run information</AlertTitle>
                <AlertDescription>{test.notice}</AlertDescription>
              </Alert>
            ) : null}
            {shown?.warnings.map((warning) => (
              <Alert key={warning}>
                <AlertTitle>Result conditions</AlertTitle>
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            ))}
            {selected ? (
              <Alert>
                <AlertTitle>
                  Viewing a saved run ·{" "}
                  {new Date(selected.date).toLocaleString()}
                </AlertTitle>
                <AlertDescription>
                  {selected.device.gpu}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSelected(null)}
                  >
                    Back to current run
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>
                      {test.busy
                        ? "Benchmark in progress"
                        : "Your AI benchmark"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Fact label="Language model" value="SmolLM2 · 360M" />
                    <Fact label="Embedding model" value="Arctic Embed · 33M" />
                    <Fact label="Execution" value="Local WebGPU" />
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium">
                        {test.busy
                          ? "Preparing & measuring"
                          : shown
                            ? "Measurements ready"
                            : "Ready to measure"}
                      </p>
                    </div>
                    <Progress
                      value={
                        test.busy ? test.progress : shown ? 100 : test.progress
                      }
                      aria-label="Benchmark progress"
                    />
                    <p
                      role="status"
                      className="min-h-10 text-xs leading-relaxed break-words text-muted-foreground"
                    >
                      {selected
                        ? "Loaded from this browser’s local history."
                        : test.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Select
                      value={repetitions}
                      onValueChange={(value) => {
                        if (value) setRepetitions(value)
                      }}
                      disabled={test.busy}
                      items={[
                        { value: "3", label: "Standard · 3 passes" },
                        { value: "5", label: "Extended · 5 passes" },
                      ]}
                    >
                      <SelectTrigger aria-label="Benchmark repetitions">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="3">Standard · 3 passes</SelectItem>
                          <SelectItem value="5">Extended · 5 passes</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {test.busy ? (
                      <Button variant="destructive" onClick={test.cancel}>
                        <HugeiconsIcon
                          icon={StopIcon}
                          data-icon="inline-start"
                        />
                        Cancel run
                      </Button>
                    ) : (
                      <Button
                        onClick={start}
                        disabled={!test.device?.available}
                        size="lg"
                      >
                        <HugeiconsIcon
                          icon={PlayIcon}
                          data-icon="inline-start"
                        />
                        {test.result ? "Run again" : "Start benchmark"}
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          data-icon="inline-end"
                        />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI score</CardTitle>
                  <CardDescription>higher is faster</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-center gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-6xl font-medium tracking-tighter sm:text-7xl">
                      {shown ? format(shown.score, 0) : "—"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      points
                    </span>
                  </div>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {shown
                      ? "Weighted from the median throughput of all three workloads. Compare runs using the same suite."
                      : "Your score appears after all workloads finish. Every point comes from measured inference."}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTab("methodology")}
                  >
                    How scoring works
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      data-icon="inline-end"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!shown}
                    onClick={async () => {
                      if (!shown) return
                      try {
                        await navigator.clipboard.writeText(
                          JSON.stringify(shown, null, 2)
                        )
                        setExportFeedback("Result JSON copied to clipboard.")
                      } catch {
                        setExportFeedback(
                          "Clipboard access was blocked. Use Export JSON to download the result."
                        )
                      }
                    }}
                  >
                    Copy JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!shown}
                    onClick={() => {
                      if (shown) download(shown)
                    }}
                  >
                    <HugeiconsIcon
                      icon={Download01Icon}
                      data-icon="inline-start"
                    />
                    Export JSON
                  </Button>
                  <p
                    aria-live="polite"
                    className="w-full text-xs text-muted-foreground"
                  >
                    {exportFeedback}
                  </p>
                  {shown ? (
                    <details className="w-full min-w-0">
                      <summary className="cursor-pointer text-xs text-muted-foreground">
                        Inspect raw JSON
                      </summary>
                      <pre
                        className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs"
                        data-testid="result-json"
                      >
                        {JSON.stringify(shown, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </CardFooter>
              </Card>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.title} size="sm">
                  <CardHeader>
                    <CardTitle>{metric.title}</CardTitle>
                    <CardDescription>{metric.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-medium tracking-tight">
                        {format(metric.value)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {metric.unit}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-[1.65fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Measured passes</CardTitle>
                  <CardDescription>
                    {llm.length || embeddings.length
                      ? "Raw samples behind the medians. Warm-up passes are excluded."
                      : "Results populate here as each workload finishes."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Samples llm={llm} embeddings={embeddings} />
                  {embeddings.length ? (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Embedding throughput:{" "}
                      {format(mid(embeddings.map((s) => s.documentsPerSecond)))}{" "}
                      docs/s · 384 dimensions · batch size 4
                    </p>
                  ) : null}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Your environment</CardTitle>
                  <CardDescription>
                    Reported by{" "}
                    {selected ? "the saved run’s browser" : "your browser"}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Fact
                    label="GPU adapter"
                    value={
                      (selected?.device || test.device)?.gpu || "Detecting…"
                    }
                  />
                  <Separator />
                  <div className="grid grid-cols-2 gap-5">
                    <Fact
                      label="Logical processors"
                      value={String(
                        (selected?.device || test.device)?.threads || "—"
                      )}
                    />
                    <Fact
                      label="Reported memory"
                      value={
                        (selected?.device || test.device)?.memory
                          ? `≈ ${(selected?.device || test.device)?.memory} GB`
                          : "Not exposed"
                      }
                    />
                    <Fact
                      label="Storage buffer limit"
                      value={
                        (selected?.device || test.device)?.maxBufferMB
                          ? `${(selected?.device || test.device)?.maxBufferMB} MB`
                          : "—"
                      }
                    />
                    <Fact
                      label="Float16 support"
                      value={
                        (selected?.device || test.device)?.f16
                          ? "Available"
                          : test.device
                            ? "Not exposed"
                            : "Checking…"
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="history" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Your previous runs</h2>
              </div>
              <Button
                variant="outline"
                disabled={!test.history.length || test.busy}
                onClick={test.clearHistory}
              >
                Clear history
              </Button>
            </div>
            {!test.history.length ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No completed runs yet</EmptyTitle>
                  <EmptyDescription>
                    Run your first benchmark to create a baseline for this
                    device.
                  </EmptyDescription>
                </EmptyHeader>
                <Button variant="outline" onClick={() => setTab("benchmark")}>
                  Go to benchmark
                </Button>
              </Empty>
            ) : (
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>GPU</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Decode</TableHead>
                        <TableHead>Passes</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {test.history.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell>
                            {new Date(run.date).toLocaleString()}
                          </TableCell>
                          <TableCell className="max-w-64 truncate">
                            {run.device.gpu}
                          </TableCell>
                          <TableCell>{format(run.score, 0)}</TableCell>
                          <TableCell>
                            {format(median(run.llm.map((s) => s.decode)))} tok/s
                          </TableCell>
                          <TableCell>{run.repetitions}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={test.busy}
                              onClick={() => {
                                setSelected(run)
                                setTab("benchmark")
                              }}
                            >
                              View run
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="methodology">
            <Methodology />
          </TabsContent>
        </Tabs>
        {children}
      </main>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium break-words">{value}</span>
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
  if (!llm.length && !embeddings.length)
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyTitle>Real numbers only</EmptyTitle>
          <EmptyDescription>
            Start a benchmark to see per-pass token counts, timings, and
            throughput.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pass</TableHead>
          <TableHead>Decode tok/s</TableHead>
          <TableHead>Ingest tok/s</TableHead>
          <TableHead>First token ms</TableHead>
          <TableHead>Embed tok/s</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from(
          { length: Math.max(llm.length, embeddings.length) },
          (_, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{format(llm[i]?.decode)}</TableCell>
              <TableCell>{format(llm[i]?.prefill)}</TableCell>
              <TableCell>{format(llm[i]?.ttft)}</TableCell>
              <TableCell>{format(embeddings[i]?.tokensPerSecond)}</TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  )
}
