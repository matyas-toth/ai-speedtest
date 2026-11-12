"use client"

import { useEffect, useRef, useState } from "react"
import {
  calculateScore,
  detectDevice,
  EMBED_MODEL,
  HISTORY_KEY,
  LLM_MODEL,
  PROTOCOL,
  readHistory,
  RUNTIME,
  variation,
  type DeviceInfo,
  type EmbeddingSample,
  type Phase,
  type Result,
  type Sample,
  type WorkerEvent,
} from "@/lib/benchmark"

export function useBenchmark() {
  const [device, setDevice] = useState<DeviceInfo | null>(null)
  const [history, setHistory] = useState<Result[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("Ready when you are")
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase | null>(null)
  const [llm, setLlm] = useState<Sample[]>([])
  const [embeddings, setEmbeddings] = useState<EmbeddingSample[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const worker = useRef<Worker | null>(null)
  const started = useRef(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const hidden = useRef(false)

  useEffect(() => {
    let active = true
    detectDevice().then((value) => {
      if (active) setDevice(value)
    })
    // Defer browser storage hydration outside the synchronous effect body.
    queueMicrotask(() => {
      if (active) setHistory(readHistory())
    })
    const onVisibility = () => {
      if (worker.current && document.hidden) hidden.current = true
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      active = false
      worker.current?.terminate()
      if (timer.current) clearInterval(timer.current)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  function stopWorker() {
    worker.current?.terminate()
    worker.current = null
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setBusy(false)
  }
  function cancel() {
    stopWorker()
    setLlm([])
    setEmbeddings([])
    setProgress(0)
    setPhase(null)
    setError(null)
    setStatus("Run cancelled")
    setNotice(
      "The run was cancelled and its partial measurements were discarded."
    )
  }
  function start(repetitions: number) {
    if (worker.current || !device?.available) return
    setBusy(true)
    setResult(null)
    setLlm([])
    setEmbeddings([])
    setError(null)
    setNotice(null)
    setProgress(0)
    setPhase(null)
    setElapsed(0)
    setStatus("Starting local benchmark…")
    started.current = performance.now()
    hidden.current = document.hidden
    const samples: Sample[] = []
    const embeddingSamples: EmbeddingSample[] = []
    const fail = (message: string) => {
      stopWorker()
      setPhase(null)
      setStatus("Run could not finish")
      setError(message)
    }
    try {
      const current = new Worker(
        new URL("../lib/benchmark.worker.ts", import.meta.url),
        { type: "module" }
      )
      worker.current = current
      timer.current = setInterval(
        () =>
          setElapsed(Math.floor((performance.now() - started.current) / 1000)),
        1000
      )
      current.onerror = (event) =>
        fail(
          event.message ||
            "The benchmark worker failed. Check your connection, GPU driver, and available memory, then retry."
        )
      current.onmessage = (event: MessageEvent<WorkerEvent>) => {
        if (worker.current !== current) return
        const data = event.data
        if (data.type === "error") {
          fail(data.message)
          return
        }
        if (data.type === "progress") {
          setStatus(data.message)
          setPhase(data.phase)
          const ranges = {
            "loading-llm": [0, 20],
            "warmup-llm": [20, 5],
            llm: [25, 35],
            "loading-embed": [60, 20],
            "warmup-embed": [80, 5],
            embed: [85, 15],
          }
          const [base, span] = ranges[data.phase]
          setProgress(
            base + (Math.min(100, Math.max(0, data.progress)) / 100) * span
          )
        }
        if (data.type === "sample") {
          samples.push(data.sample)
          setLlm([...samples])
        }
        if (data.type === "embedding") {
          embeddingSamples.push(data.sample)
          setEmbeddings([...embeddingSamples])
        }
        if (data.type === "done") {
          try {
            if (
              samples.length !== repetitions ||
              embeddingSamples.length !== repetitions
            )
              throw new Error("Incomplete benchmark. No score was saved.")
            const warnings: string[] = []
            if (hidden.current)
              warnings.push(
                "This tab was in the background during the run, and browser throttling can affect the result, so rerun with the tab visible."
              )
            if (
              variation(samples.map((s) => s.decode)) > 20 ||
              variation(samples.map((s) => s.prefill)) > 20 ||
              variation(embeddingSamples.map((s) => s.tokensPerSecond)) > 20
            )
              warnings.push(
                "Measured passes varied by more than 20%, so close other workloads and rerun for a more stable result."
              )
            const completed: Result = {
              id: crypto.randomUUID(),
              protocol: PROTOCOL,
              runtime: RUNTIME,
              date: new Date().toISOString(),
              device,
              repetitions,
              llmModel: LLM_MODEL,
              embeddingModel: EMBED_MODEL,
              llm: samples,
              embeddings: embeddingSamples,
              durationMs: performance.now() - started.current,
              score: calculateScore(samples, embeddingSamples),
              warnings,
            }
            setResult(completed)
            setProgress(100)
            setPhase(null)
            setStatus("Benchmark complete")
            const next = [completed, ...readHistory()].slice(0, 20)
            setHistory(next)
            try {
              localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
            } catch {
              setNotice(
                "Results are ready, but this browser could not save history, so export JSON to keep this run."
              )
            }
            stopWorker()
          } catch (error) {
            fail(
              error instanceof Error
                ? error.message
                : "Could not validate the result."
            )
          }
        }
      }
      current.postMessage({ repetitions })
    } catch (error) {
      fail(
        error instanceof Error ? error.message : "Unable to start the worker."
      )
    }
  }
  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY)
      setHistory([])
      return "Saved benchmark history has been cleared."
    } catch {
      return "This browser did not allow clearing local history."
    }
  }
  function restoreHistory(runs: Result[]) {
    setHistory(runs)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(runs))
      return "Saved benchmark history has been restored."
    } catch {
      return "History was restored for this session, but the browser did not allow saving it."
    }
  }
  return {
    device,
    history,
    result,
    busy,
    status,
    progress,
    phase,
    llm,
    embeddings,
    error,
    notice,
    elapsed,
    start,
    cancel,
    clearHistory,
    restoreHistory,
  }
}
