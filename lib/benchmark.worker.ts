import { MLCEngine } from "@mlc-ai/web-llm"
import {
  DOCUMENTS,
  EMBED_MODEL,
  LLM_MODEL,
  OUTPUT_TOKENS,
  PROMPT,
  type Phase,
  type WorkerEvent,
} from "./benchmark"

const send = (event: WorkerEvent) => self.postMessage(event)
let running = false
self.onmessage = async (event: MessageEvent<{ repetitions: number }>) => {
  if (running) return
  running = true
  const repetitions = event.data.repetitions === 5 ? 5 : 3
  let phase: Phase = "loading-llm"
  let engine: MLCEngine | undefined
  const progress = (message: string, value: number) =>
    send({ type: "progress", phase, message, progress: value })
  try {
    engine = new MLCEngine({
      initProgressCallback: (report) =>
        progress(report.text, report.progress * 100),
      logLevel: "WARN",
    })
    progress("Downloading and preparing SmolLM2…", 0)
    await engine.reload(LLM_MODEL, { context_window_size: 2048 })
    phase = "warmup-llm"
    progress(
      "Warming up the full language workload. This pass is not scored.",
      0
    )
    for (let pass = 0; pass <= repetitions; pass++) {
      // Explicitly clear the KV cache: repeated prompts must never become cache-hit benchmarks.
      await engine.resetChat()
      if (pass > 0) {
        phase = "llm"
        progress(
          `Language model · measured pass ${pass} of ${repetitions}`,
          ((pass - 1) / repetitions) * 100
        )
      }
      const started = performance.now()
      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: PROMPT }],
        max_tokens: OUTPUT_TOKENS,
        temperature: 0,
        seed: 42,
        ignore_eos: true,
        stream: false,
      })
      const elapsedMs = performance.now() - started
      const usage = response.usage
      if (
        !usage ||
        usage.completion_tokens !== OUTPUT_TOKENS - 1 ||
        response.choices[0]?.finish_reason !== "length"
      )
        throw new Error(
          `The language workload returned ${usage?.completion_tokens ?? "no"} decode steps with finish reason ${response.choices[0]?.finish_reason}. Expected 127 decode steps after the first prefill token. Please retry.`
        )
      const values = [
        usage.extra.decode_tokens_per_s,
        usage.extra.prefill_tokens_per_s,
        usage.extra.time_to_first_token_s,
      ]
      if (values.some((v) => !Number.isFinite(v) || v <= 0))
        throw new Error("The runtime returned invalid language-model timings.")
      if (pass > 0)
        send({
          type: "sample",
          sample: {
            pass,
            decode: values[0],
            prefill: values[1],
            ttft: values[2] * 1000,
            promptTokens: usage.prompt_tokens,
            outputTokens: OUTPUT_TOKENS,
            decodeTokens: usage.completion_tokens,
            elapsedMs,
          },
        })
    }
    // Release the language model before loading embeddings to keep peak memory low.
    await engine.unload()
    phase = "loading-embed"
    progress("Downloading and preparing Arctic Embed Small…", 0)
    await engine.reload(EMBED_MODEL)
    phase = "warmup-embed"
    progress(
      "Warming up four-document embedding batches. This pass is not scored.",
      0
    )
    for (let pass = 0; pass <= repetitions; pass++) {
      if (pass > 0) {
        phase = "embed"
        progress(
          `Embeddings · measured pass ${pass} of ${repetitions}`,
          ((pass - 1) / repetitions) * 100
        )
      }
      const started = performance.now()
      const response = await engine.embeddings.create({ input: DOCUMENTS })
      const elapsedMs = performance.now() - started
      if (
        response.data.length !== DOCUMENTS.length ||
        response.data.some(
          (d) =>
            d.embedding.length !== 384 ||
            d.embedding.some((v) => !Number.isFinite(v)) ||
            !d.embedding.some((v) => v !== 0)
        )
      )
        throw new Error("Embedding output validation failed.")
      const tokens = response.usage.prompt_tokens
      if (!Number.isFinite(tokens) || tokens <= 0 || elapsedMs <= 0)
        throw new Error("Invalid embedding timing or token count.")
      if (pass > 0)
        send({
          type: "embedding",
          sample: {
            pass,
            tokensPerSecond: tokens / (elapsedMs / 1000),
            documentsPerSecond: DOCUMENTS.length / (elapsedMs / 1000),
            tokens,
            elapsedMs,
            dimensions: 384,
          },
        })
    }
    await engine.unload()
    engine = undefined
    send({ type: "done" })
  } catch (error) {
    send({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    })
  } finally {
    if (engine) await engine.unload().catch(() => {})
    running = false
  }
}
