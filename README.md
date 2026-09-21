# AI Speedtest

A local WebGPU inference benchmark built with Next.js 16, Tailwind 4, and this repository's unmodified shadcn/Base UI component preset. No API key or inference server.

## Run

```sh
npm install
npm run dev
```

Open the printed localhost URL in a WebGPU-enabled browser. Production hosting must use HTTPS. Click Start benchmark to download public model files (roughly 400 MB of weights plus runtime assets). Keep the tab visible, plug in your laptop, and close competing GPU workloads. Models are cached when browser storage permits. Cancellation terminates the worker immediately. No automatic CPU fallback silently mixes backends.

## Measurements

- Decode: SmolLM2-360M-Instruct q4f32_1, fixed prompt, 128 output tokens, greedy sampling, seed 42, ignore EOS. WebLLM counts the first token in prefill, so exports distinguish 128 output tokens from 127 decode steps.
- Prompt ingest: runtime prefill tok/s using actual token counts. resetChat() clears KV cache before every pass.
- First token: WebLLM runtime prefill time converted to ms, not UI streaming latency.
- Embeddings: Arctic Embed Small q0f32, four fixed documents, 384-dimensional outputs. Actual tokenizer counts divided by wall-clock request time, including tokenization and output transfer. Outputs checked for finite, nonzero vectors. Also reports docs/s.

One full unscored warm-up per model; three or five measured passes summarized by median. Models load sequentially to reduce peak GPU memory. Downloads and initialization are excluded from throughput. Total run duration includes preparation. Progress is weighted workflow progress, not an ETA or byte counter.

## AI Index v1

```text
round(1000 * (decode / 50)^0.5 * (prefill / 500)^0.25 * (embedding / 1000)^0.25)
```

Anchors are chosen scoring targets, not measured reference hardware. The unbounded index is not a percentile or a prediction for arbitrary models, native runtimes, NPUs, training, or VRAM capacity. Compare identical protocol, model precision, and runtime. First-token latency is informational and not double-counted. Background-tab runs and range/median variation above 20% are flagged.

Up to 20 completed runs are saved in localStorage. JSON export includes raw samples, model IDs, runtime/protocol, hardware/browser information, and conditions. Results are never uploaded. Public artifact downloads contact Hugging Face and GitHub. The npm runtime is pinned; upstream model repositories can change, so this is not a cryptographically frozen distribution.

## Architecture

- lib/benchmark.worker.ts: actual inference in a dedicated worker.
- lib/benchmark.ts: fixed workload, score, statistics, device detection, history validation.
- hooks/use-benchmark.ts: worker lifecycle, cancellation, progress, and persistence.
- components/benchmark/: dashboard, sample table, history, and methodology.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Tests cover score normalization/scaling, invalid samples, medians, variability, and corrupted/blocked storage. Actual GPU execution requires a WebGPU browser and model downloads. ESLint 9 is used because the installed Next.js React lint plugin is incompatible with ESLint 10.

## Primary sources

- [WebLLM usage and metrics](https://webllm.mlc.ai/docs/user/basic_usage.html)
- [Workers and caching](https://webllm.mlc.ai/docs/user/advanced_usage.html)
- [WebLLM source and embedding API](https://github.com/mlc-ai/web-llm)
- [Arctic Embed Small model card](https://huggingface.co/Snowflake/snowflake-arctic-embed-s)
- [WebGPU and secure contexts](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
