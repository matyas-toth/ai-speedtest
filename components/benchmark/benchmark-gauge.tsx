"use client"

import { useEffect, useRef } from "react"

const targetScore = 1000

function scaleMax(score: number) {
  if (score <= 1500) return 1500
  if (score <= 3000) return 3000
  return Math.ceil((score * 1.1) / 1000) * 1000
}

export function BenchmarkGauge({
  score,
  busy,
}: {
  score?: number
  busy: boolean
}) {
  const hasReading = score != null
  const value = score ?? 0
  const max = scaleMax(value)
  return (
    <div
      className="benchmark-gauge"
      data-testid="benchmark-gauge"
      data-stage={hasReading ? "score" : "ready"}
      role="img"
      aria-label={
        hasReading
          ? `AI score: ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} points`
          : busy
            ? "Measuring AI score"
            : "AI score will appear after the benchmark"
      }
    >
      <Dial
        value={value}
        max={max}
        hasReading={hasReading}
        emptyText={busy ? "Measuring" : "Not run"}
      />
    </div>
  )
}

function point(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180
  return {
    x: Number((230 + Math.cos(radians) * radius).toFixed(3)),
    y: Number((222 + Math.sin(radians) * radius).toFixed(3)),
  }
}

const start = point(150, 168)
const end = point(390, 168)
const arc = `M ${start.x} ${start.y} A 168 168 0 1 1 ${end.x} ${end.y}`
const ticks = Array.from({ length: 31 }, (_, i) => {
  const angle = 150 + i * 8
  const major = i % 10 === 0
  return {
    from: point(angle, major ? 147 : 155),
    to: point(angle, 160),
    angle,
    major,
  }
})
const scaleLabels = Array.from({ length: 4 }, (_, i) => {
  const angle = 150 + i * 80
  return { ...point(angle, 132), ratio: i / 3 }
})

function Dial({
  value,
  max,
  hasReading,
  emptyText,
}: {
  value: number
  max: number
  hasReading: boolean
  emptyText: string
}) {
  const needle = useRef<SVGGElement>(null)
  const fill = useRef<SVGPathElement>(null)
  const number = useRef<HTMLSpanElement>(null)
  const current = useRef({ value: 0, ratio: 0 })
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const from = { ...current.current }
    const started = performance.now()
    let frame = 0
    const render = (now: number) => {
      const t = reduced.matches ? 1 : Math.min(1, (now - started) / 900)
      const ease = 1 - Math.pow(1 - t, 3)
      const ratio = from.ratio + (value / max - from.ratio) * ease
      const displayed = from.value + (value - from.value) * ease
      current.current = { value: displayed, ratio }
      needle.current?.setAttribute(
        "transform",
        `rotate(${150 + 240 * ratio} 230 222)`
      )
      fill.current?.setAttribute("stroke-dasharray", `${ratio * 100} 100`)
      if (number.current)
        number.current.textContent = hasReading
          ? displayed.toLocaleString(undefined, { maximumFractionDigits: 0 })
          : emptyText
      if (t < 1) frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [value, max, hasReading, emptyText])

  const targetRatio = targetScore / max
  const targetAngle = 150 + 240 * targetRatio
  const targetInner = point(targetAngle, 178)
  const targetOuter = point(targetAngle, 193)
  const targetLabel = point(targetAngle, 208)

  return (
    <div className="gauge-dial">
      <svg viewBox="0 0 460 392" className="gauge-svg" aria-hidden="true">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--signal)" />
            <stop offset="55%" stopColor="var(--signal-bright)" />
            <stop offset="100%" stopColor="var(--signal-warm)" />
          </linearGradient>
        </defs>
        <path
          d={arc}
          fill="none"
          stroke="var(--track)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {hasReading ? (
          <path
            ref={fill}
            d={arc}
            pathLength="100"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="0 100"
          />
        ) : null}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.from.x}
            y1={tick.from.y}
            x2={tick.to.x}
            y2={tick.to.y}
            stroke="var(--muted-foreground)"
            strokeWidth={tick.major ? 1.4 : 1}
            strokeLinecap="round"
            opacity={tick.major ? 0.7 : 0.34}
          />
        ))}
        {scaleLabels.map((label, i) => {
          const labelValue = max * label.ratio
          if (Math.abs(labelValue - targetScore) < 1) return null
          return (
            <text
              key={i}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted-foreground)"
              fontFamily="var(--font-mono)"
              fontSize="11.5"
              fontWeight={400}
              letterSpacing="0.04em"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {i === 0
                ? "0"
                : labelValue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
            </text>
          )
        })}
        <line
          x1={targetInner.x}
          y1={targetInner.y}
          x2={targetOuter.x}
          y2={targetOuter.y}
          stroke="var(--signal)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text
          x={targetLabel.x}
          y={targetLabel.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--signal)"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="500"
          letterSpacing="0.02em"
        >
          1,000
        </text>
        {hasReading ? (
          <g ref={needle} transform="rotate(150 230 222)">
            <path
              d="M 230 212 A 10 10 0 0 0 230 232 L 370 222 Z"
              fill="var(--foreground)"
            />
          </g>
        ) : null}
      </svg>
      <div className="gauge-readout" aria-hidden="true">
        <span
          ref={number}
          className="gauge-value"
          data-empty={!hasReading}
        >
          {emptyText}
        </span>
      </div>
    </div>
  )
}
