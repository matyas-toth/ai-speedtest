"use client"

import { useEffect, useRef, useState } from "react"
import type { EmbeddingSample, Sample } from "@/lib/benchmark"

type Reading = {
  stage: "decode" | "embed" | "score"
  value: number
  pass: number
}
const labels = { decode: "LLM decode", embed: "Embeddings", score: "AI score" }
const floors = { decode: 100, embed: 5000, score: 3000 }

// All samples are retained: a fast worker cannot overwrite a reading mid-sweep.
export function BenchmarkGauge({
  llm,
  embeddings,
  score,
  busy,
  repetitions,
  saved = false,
  status,
}: {
  llm: Sample[]
  embeddings: EmbeddingSample[]
  score?: number
  busy: boolean
  repetitions: number
  saved?: boolean
  status: string
}) {
  const [reading, setReading] = useState<Reading | null>(
    saved && score != null ? { stage: "score", value: score, pass: 0 } : null
  )
  const source = useRef({ llm, embeddings, score, busy, saved })
  useEffect(() => {
    source.current = { llm, embeddings, score, busy, saved }
  }, [llm, embeddings, score, busy, saved])
  useEffect(() => {
    let cursor = 0
    let nextAt = 0
    const timer = window.setInterval(() => {
      const data = source.current
      if (data.saved) return
      if (!data.busy && data.score == null) return
      const sequence: Reading[] = [
        ...data.llm.map((s) => ({
          stage: "decode" as const,
          value: s.decode,
          pass: s.pass,
        })),
        ...data.embeddings.map((s) => ({
          stage: "embed" as const,
          value: s.tokensPerSecond,
          pass: s.pass,
        })),
        ...(data.score == null
          ? []
          : [{ stage: "score" as const, value: data.score, pass: 0 }]),
      ]
      if (performance.now() < nextAt) return
      if (cursor < sequence.length) {
        setReading(sequence[cursor++])
        nextAt = performance.now() + 1500
      } else if (data.score != null) window.clearInterval(timer)
    }, 80)
    return () => window.clearInterval(timer)
  }, [])

  const stage = reading?.stage ?? (busy ? "decode" : "score")
  const max = Math.max(
    floors[stage],
    Math.ceil((reading?.value ?? 0) / floors[stage]) * floors[stage]
  )
  const value = reading?.value ?? 0
  return (
    <div
      className="flex w-full flex-col items-center"
      data-testid="benchmark-gauge"
      data-stage={reading?.stage ?? "ready"}
      data-pass={reading?.pass ?? 0}
    >
      <Dial value={value} max={max} stage={stage} reading={reading} />
      {reading && reading.stage !== "score" ? (
        <div
          className="mt-1 flex gap-2"
          role="status"
          aria-label={`${reading.pass} of ${repetitions} samples shown`}
        >
          {Array.from({ length: repetitions }, (_, i) => (
            <span
              key={i}
              className="h-1 w-7 rounded-full bg-muted"
              style={
                i < reading.pass
                  ? { backgroundColor: `var(--gauge-${stage})` }
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}
      <ol
        className="mt-2 flex gap-5 text-xs text-muted-foreground"
        aria-label="Benchmark stages"
      >
        {(["decode", "embed", "score"] as const).map((item, i) => (
          <li
            key={item}
            className="flex items-center gap-1.5"
            style={
              stage === item && reading
                ? { color: `var(--gauge-${item})` }
                : undefined
            }
          >
            <span className="size-1.5 rounded-full bg-current" />
            {i === 2 ? "Score" : labels[item]}
          </li>
        ))}
      </ol>
      <span className="sr-only">{status}</span>
    </div>
  )
}

function point(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180
  return {
    x: Number((220 + Math.cos(radians) * radius).toFixed(3)),
    y: Number((220 + Math.sin(radians) * radius).toFixed(3)),
  }
}
const start = point(150, 182)
const end = point(390, 182)
const arc = `M ${start.x} ${start.y} A 182 182 0 1 1 ${end.x} ${end.y}`
const ticks = Array.from({ length: 49 }, (_, i) => {
  const angle = 150 + i * 5
  return {
    from: point(angle, i % 8 === 0 ? 153 : 159),
    to: point(angle, 166),
    major: i % 8 === 0,
  }
})

function Dial({
  value,
  max,
  stage,
  reading,
}: {
  value: number
  max: number
  stage: Reading["stage"]
  reading: Reading | null
}) {
  const needle = useRef<SVGGElement>(null)
  const fill = useRef<SVGPathElement>(null)
  const number = useRef<HTMLSpanElement>(null)
  const current = useRef({ value: 0, ratio: 0, stage })
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const from = { ...current.current }
    const changed = from.stage !== stage
    const started = performance.now()
    let frame = 0
    const render = (now: number) => {
      const t = reduced.matches ? 1 : Math.min(1, (now - started) / 1100)
      // Reset only when changing workloads; passes animate from the previous value.
      const reset = changed && t < 0.25
      const progress = changed ? Math.max(0, (t - 0.25) / 0.75) : t
      const ease = 1 - Math.pow(1 - progress, 3)
      const ratio = reset
        ? from.ratio * (1 - t / 0.25)
        : (changed ? 0 : from.ratio) +
        (value / max - (changed ? 0 : from.ratio)) * ease
      const displayed = reset
        ? 0
        : (changed ? 0 : from.value) +
        (value - (changed ? 0 : from.value)) * ease
      current.current = {
        value: displayed,
        ratio,
        stage,
      }
      needle.current?.setAttribute(
        "transform",
        `rotate(${150 + 240 * ratio} 220 220)`
      )
      fill.current?.setAttribute("stroke-dasharray", `${ratio * 100} 100`)
      if (number.current)
        number.current.textContent = reading
          ? displayed.toLocaleString(undefined, {
            maximumFractionDigits: stage === "score" ? 0 : 1,
            minimumFractionDigits: stage === "score" ? 0 : 1,
          })
          : "—"
      if (t < 1) frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [value, max, stage, reading])
  return (
    <div
      className="relative aspect-[440/400] w-full max-w-[470px] sm:aspect-[440/350]"
      style={{ color: `var(--gauge-${stage})` }}
    >
      <svg
        viewBox="0 0 440 350"
        className="size-full overflow-visible"
        aria-hidden="true"
      >
        <path
          d={arc}
          fill="none"
          stroke="currentColor"
          strokeWidth="30"
          opacity="0.035"
          className="transition-colors duration-700"
        />
        <path
          d={arc}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          ref={fill}
          d={arc}
          pathLength="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="0 100"
          className="transition-colors duration-700"
        />
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.from.x}
            y1={tick.from.y}
            x2={tick.to.x}
            y2={tick.to.y}
            stroke={tick.major ? "var(--muted-foreground)" : "var(--border)"}
            strokeWidth={tick.major ? 2 : 1}
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const p = point(150 + i * 40, i === 0 || i === 6 ? 205 : 133)
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted-foreground)"
              fontSize="10"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {((max * i) / 6).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </text>
          )
        })}
        <g ref={needle} transform="rotate(150 220 220)">
          <path
            d="M 212 215 L 358 220 L 212 225 Z"
            fill="currentColor"
            className="transition-colors duration-700"
          />
        </g>
        <circle
          cx="220"
          cy="220"
          r="12"
          fill="var(--background)"
          stroke="currentColor"
          strokeWidth="3"
          className="transition-colors duration-700"
        />
      </svg>
      <div className="absolute inset-x-0 top-[68%] flex flex-col items-center gap-1">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-700">
          {reading ? labels[stage] : ""}
        </span>
        <span
          ref={number}
          className="text-5xl leading-tight font-semibold tracking-tighter text-foreground tabular-nums sm:text-6xl"
        >
          —
        </span>
        <span className="text-xs text-muted-foreground">
          {reading
            ? stage === "score"
              ? "points"
              : "tokens / second"
            : "Local WebGPU benchmark"}
        </span>
      </div>
    </div>
  )
}
