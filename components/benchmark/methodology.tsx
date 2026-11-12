import { DOCUMENTS, EMBED_MODEL, LLM_MODEL, PROMPT_PARAGRAPH } from "@/lib/benchmark"

export function Methodology() {
  return (
    <div className="article-sections">
      <section id="measurements">
        <h2>Measurements</h2>
        <dl className="measurement-definitions">
          <Definition title="Text generation" unit="tok/s">
            SmolLM2 generates 128 output tokens using greedy decoding with seed
            42 and end-of-sequence stopping disabled. The first token comes from
            prompt processing, so throughput covers the remaining 127 decoding
            steps.
          </Definition>
          <Definition title="Prompt processing" unit="tok/s">
            The model reads a fixed prompt using a fresh KV cache for every
            pass. Token counts come from the model’s tokenizer.
          </Definition>
          <Definition title="Time to first token" unit="ms">
            WebLLM reports the time spent processing the prompt before producing
            the first token. This measures runtime prefill latency rather than
            latency through a streaming interface, and lower values are better.
          </Definition>
          <Definition title="Embeddings" unit="tok/s">
            Arctic Embed processes four fixed documents into 384-dimensional
            vectors. Throughput includes tokenization and output transfer, and
            the output is checked for finite, nonzero values.
          </Definition>
        </dl>
      </section>
      <section id="score">
        <h2>AI score</h2>
        <p>
          The score combines the median throughput of each workload, with text
          generation weighted at 50%. Higher scores indicate faster performance
          on this test.
        </p>
        <pre className="score-formula">
          <code>
            {
              "1000 × (decode / 50)^0.50\n     × (prefill / 500)^0.25\n     × (embedding / 1000)^0.25"
            }
          </code>
        </pre>
        <p>
          A score of 1,000 corresponds to chosen targets of 50 generation tok/s,
          500 prompt tok/s, and 1,000 embedding tok/s. These targets are not
          measurements of a reference computer, and the score is neither a
          percentile nor a hardware ranking.
        </p>
      </section>
      <section id="conditions">
        <h2>Test conditions</h2>
        <p>
          Each model completes one unscored warm-up before three or five
          measured passes. Downloads, model loading, and shader compilation
          during warm-up are excluded from the results, and models load
          sequentially to reduce peak GPU memory.
        </p>
        <p>
          Keep the tab visible and close competing GPU workloads for a more
          consistent result. Compare runs using the same protocol and model
          versions, since the browser, graphics driver, power mode, and device
          temperature can affect performance.
        </p>
        <p>
          The test measures inference through the browser’s WebGPU adapter; it
          does not measure dedicated NPUs, native CUDA performance, training
          speed, model intelligence, or the largest model your device can run.
        </p>
      </section>
      <section id="models">
        <h2>Models and inputs</h2>
        <dl className="model-definitions">
          <div>
            <dt>Language model</dt>
            <dd>
              <code>{LLM_MODEL}</code>
              <p>
                The model uses 4-bit weights, float32 computation, and a
                2,048-token context.
              </p>
            </dd>
          </div>
          <div>
            <dt>Embedding model</dt>
            <dd>
              <code>{EMBED_MODEL}</code>
              <p>
                The model uses float32 weights and computation with a batch size
                of four.
              </p>
            </dd>
          </div>
        </dl>
        <p>
          Model and runtime files download from Hugging Face and GitHub on first
          use and are cached when browser storage permits. Reported hardware
          details are limited to what the browser exposes; storage buffer limits
          do not represent GPU memory capacity.
        </p>
        <details className="detail-section">
          <summary>Test prompt</summary>
          <div className="details-content">
            <div>
              <pre className="benchmark-input">{PROMPT_PARAGRAPH}</pre>
              <p className="detail-caption">
                The benchmark repeats this paragraph eight times to reach the
                fixed prompt length.
              </p>
            </div>
            <div>
              <h3 className="detail-sublabel">Embedding documents</h3>
              <ol className="list-decimal space-y-3 pl-5">
                {DOCUMENTS.map((document) => (
                  <li key={document}>{document}</li>
                ))}
              </ol>
            </div>
          </div>
        </details>
      </section>
      <section id="sources">
        <h2>Sources</h2>
        <ul className="source-links">
          <li>
            <a
              href="https://webllm.mlc.ai/docs/user/basic_usage.html"
              target="_blank"
              rel="noreferrer"
            >
              WebLLM runtime documentation ↗
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mlc-ai/web-llm/blob/v0.2.85/src/openai_api_protocols/chat_completion.ts"
              target="_blank"
              rel="noreferrer"
            >
              Timing definitions ↗
            </a>
          </li>
          <li>
            <a
              href="https://huggingface.co/Snowflake/snowflake-arctic-embed-s"
              target="_blank"
              rel="noreferrer"
            >
              Arctic Embed model card ↗
            </a>
          </li>
          <li>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API"
              target="_blank"
              rel="noreferrer"
            >
              WebGPU documentation ↗
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}

function Definition({
  title,
  unit,
  children,
}: {
  title: string
  unit: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt>
        {title} <span>{unit}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  )
}
