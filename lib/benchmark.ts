export const PROTOCOL = "ai-speedtest/1.0"
export const LLM_MODEL = "SmolLM2-360M-Instruct-q4f32_1-MLC"
export const EMBED_MODEL = "snowflake-arctic-embed-s-q0f32-MLC-b4"
export const RUNTIME = "WebLLM 0.2.85"
export const OUTPUT_TOKENS = 128
export const PROMPT =
  "Summarize the following notes and explain their practical implications in detail.\n" +
  "Local artificial intelligence processes data on a personal computer. Language models generate text one token at a time. Prompt processing handles the input before generation begins. Embedding models turn documents into vectors for semantic search. Performance depends on the model, precision, memory, browser, and graphics driver. A repeatable benchmark uses fixed inputs and excludes model downloads and warm-up.\n".repeat(
    8
  )
export const DOCUMENTS = [
  "Local language models help people draft and summarize documents without sending their text to a remote server.",
  "Semantic search represents each document as a vector, then finds nearby vectors to retrieve relevant information.",
  "Graphics processors execute many operations in parallel. Memory bandwidth can limit autoregressive token generation.",
  "A reproducible benchmark holds the model, precision, input, and output length constant across measured trials.",
]
export type Phase =
  | "loading-llm"
  | "warmup-llm"
  | "llm"
  | "loading-embed"
  | "warmup-embed"
  | "embed"
export type Sample = {
  pass: number
  decode: number
  prefill: number
  ttft: number
  promptTokens: number
  outputTokens: number
  decodeTokens: number
  elapsedMs: number
}
export type EmbeddingSample = {
  pass: number
  tokensPerSecond: number
  documentsPerSecond: number
  tokens: number
  elapsedMs: number
  dimensions: number
}
export type DeviceInfo = {
  available: boolean
  gpu: string
  vendor: string
  architecture: string
  threads: number
  memory: number | null
  maxBufferMB: number | null
  f16: boolean
  browser: string
  reason?: string
}
export type Result = {
  id: string
  protocol: string
  runtime: string
  date: string
  device: DeviceInfo
  repetitions: number
  llmModel: string
  embeddingModel: string
  llm: Sample[]
  embeddings: EmbeddingSample[]
  durationMs: number
  score: number
  warnings: string[]
}
export type WorkerEvent =
  | { type: "progress"; phase: Phase; progress: number; message: string }
  | { type: "sample"; sample: Sample }
  | { type: "embedding"; sample: EmbeddingSample }
  | { type: "done" }
  | { type: "error"; message: string }

export function median(values: number[]): number {
  if (!values.length || values.some((v) => !Number.isFinite(v) || v <= 0))
    throw new Error("Missing or invalid benchmark measurements.")
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}
// A versioned, unbounded index. Anchors are design targets, not a reference PC or population percentiles.
export function calculateScore(
  llm: Sample[],
  embeddings: EmbeddingSample[]
): number {
  const decode = median(llm.map((s) => s.decode))
  const prefill = median(llm.map((s) => s.prefill))
  const embed = median(embeddings.map((s) => s.tokensPerSecond))
  return Math.round(
    1000 *
      Math.exp(
        0.5 * Math.log(decode / 50) +
          0.25 * Math.log(prefill / 500) +
          0.25 * Math.log(embed / 1000)
      )
  )
}
export function variation(values: number[]): number {
  return ((Math.max(...values) - Math.min(...values)) / median(values)) * 100
}
export async function detectDevice(): Promise<DeviceInfo> {
  const base: DeviceInfo = {
    available: false,
    gpu: "Not available",
    vendor: "Not exposed",
    architecture: "Not exposed",
    threads: navigator.hardwareConcurrency || 0,
    memory:
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
    maxBufferMB: null,
    f16: false,
    browser: navigator.userAgent,
  }
  if (!isSecureContext)
    return {
      ...base,
      reason:
        "WebGPU needs HTTPS or localhost. Open this app on a secure connection.",
    }
  if (!navigator.gpu)
    return {
      ...base,
      reason:
        "This browser does not expose WebGPU. Try an up-to-date Chrome or Edge with hardware acceleration enabled.",
    }
  try {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    })
    if (!adapter)
      return {
        ...base,
        reason:
          "No WebGPU adapter was available. Check browser hardware acceleration and your graphics driver.",
      }
    const info = adapter.info
    const gpu =
      [info.vendor, info.architecture, info.description]
        .filter(Boolean)
        .join(" · ") || "WebGPU adapter (name hidden)"
    return {
      ...base,
      available: true,
      gpu,
      vendor: info.vendor || "Not exposed",
      architecture: info.architecture || "Not exposed",
      maxBufferMB: Math.round(
        adapter.limits.maxStorageBufferBindingSize / 1048576
      ),
      f16: adapter.features.has("shader-f16"),
    }
  } catch (error) {
    return {
      ...base,
      reason:
        error instanceof Error ? error.message : "Unable to initialize WebGPU.",
    }
  }
}

export const HISTORY_KEY = "ai-speedtest:history:v1"
export function readHistory(): Result[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
    if (!Array.isArray(data)) return []
    return data
      .filter((r): r is Result => {
        try {
          return (
            r.protocol === PROTOCOL &&
            typeof r.id === "string" &&
            typeof r.date === "string" &&
            Number.isFinite(Date.parse(r.date)) &&
            typeof r.device?.gpu === "string" &&
            Array.isArray(r.warnings) &&
            [3, 5].includes(r.repetitions) &&
            r.llm.length === r.repetitions &&
            r.embeddings.length === r.repetitions &&
            calculateScore(r.llm, r.embeddings) === r.score
          )
        } catch {
          return false
        }
      })
      .slice(0, 20)
  } catch {
    return []
  }
}
