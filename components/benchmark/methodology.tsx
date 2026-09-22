import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DOCUMENTS, EMBED_MODEL, LLM_MODEL, PROMPT } from "@/lib/benchmark"

export function Methodology() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>What the numbers mean</h2>
          </CardTitle>
          <CardDescription>
            Actual model inference on your browser’s WebGPU adapter.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Definition title="LLM decode · tok/s">
            WebLLM’s autoregressive decoding throughput. The fixed workload
            generates 128 tokens with greedy decoding, seed 42, and
            end-of-sequence stopping disabled. The first token is produced by
            prefill; WebLLM measures the remaining 127 decode steps. Higher is
            better.
          </Definition>
          <Definition title="Prompt ingest · tok/s">
            WebLLM’s prefill throughput for a fixed, repeated passage. Token
            counts come from the model tokenizer. The KV cache is reset before
            every pass, so the whole prompt is processed again.
          </Definition>
          <Definition title="Time to first token · ms">
            WebLLM’s reported prefill time, in milliseconds. This is the
            runtime’s first-token metric, not user-perceived latency through a
            streaming UI. Lower is better.
          </Definition>
          <Definition title="Embeddings · tok/s and docs/s">
            Four fixed documents embedded together into 384-dimensional vectors.
            Actual token count divided by wall-clock request time, including
            tokenization and output transfer. Output vectors are checked for
            finite, nonzero values.
          </Definition>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>A score you can inspect</h2>
          </CardTitle>
          <CardDescription>
            AI Index v1 · an open-ended relative throughput index.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p>
            Each metric uses the median of 3 or 5 measured passes. One full
            warm-up per model is excluded, as are downloads, model loading, and
            shader compilation during warm-up.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-6">
            <code>
              {
                "1000 × (decode / 50)^0.50\n     × (prefill / 500)^0.25\n     × (embedding / 1000)^0.25"
              }
            </code>
          </pre>
          <p>
            The anchors—50, 500, and 1,000 tok/s—are chosen scoring targets, not
            measurements of a reference computer. A score of 1,000 is not a
            percentile. The score is unbounded, with decode weighted at 50%.
          </p>
          <Separator />
          <p className="text-muted-foreground">
            Compare the same protocol and model versions. Browser, driver,
            thermal state, power mode, and background tasks all affect
            performance. This does not measure model intelligence, dedicated
            NPUs, native CUDA performance, training speed, or the largest model
            your PC can run.
          </p>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            <h2>Reproducibility & sources</h2>
          </CardTitle>
          <CardDescription>
            Fixed workloads. Local execution. No account, API key, or results
            upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Definition title="Language model">
              <span className="font-mono text-xs break-all">{LLM_MODEL}</span>
              <br />
              4-bit weights, float32 computation; 2,048-token context.
            </Definition>
            <Definition title="Embedding model">
              <span className="font-mono text-xs break-all">{EMBED_MODEL}</span>
              <br />
              Float32 weights and computation; batch of 4.
            </Definition>
          </div>
          <p>
            Models and runtime artifacts download from Hugging Face and GitHub
            on first use and are cached when browser storage permits. The two
            models load sequentially to reduce peak GPU memory. Hardware details
            are limited to what the browser exposes; buffer limits are not VRAM
            capacity, and reported memory is an approximate privacy-limited
            value.
          </p>
          <Accordion>
            <AccordionItem value="inputs">
              <AccordionTrigger>
                Inspect the exact benchmark inputs
              </AccordionTrigger>
              <AccordionContent keepMounted>
                <div className="mt-4 flex flex-col gap-4">
                  <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap">
                    {PROMPT}
                  </pre>
                  <ol className="flex list-decimal flex-col gap-2 pl-5">
                    {DOCUMENTS.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Button
              variant="link"
              nativeButton={false}
              role="link"
              className="min-h-11"
              render={
                <a
                  href="https://webllm.mlc.ai/docs/user/basic_usage.html"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              WebLLM runtime & usage
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                data-icon="inline-end"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Button>
            <Button
              variant="link"
              nativeButton={false}
              role="link"
              className="min-h-11"
              render={
                <a
                  href="https://github.com/mlc-ai/web-llm/blob/v0.2.85/src/openai_api_protocols/chat_completion.ts"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Timing definitions
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                data-icon="inline-end"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Button>
            <Button
              variant="link"
              nativeButton={false}
              role="link"
              className="min-h-11"
              render={
                <a
                  href="https://huggingface.co/Snowflake/snowflake-arctic-embed-s"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Arctic Embed model card
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                data-icon="inline-end"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Button>
            <Button
              variant="link"
              nativeButton={false}
              role="link"
              className="min-h-11"
              render={
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              WebGPU support
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                data-icon="inline-end"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
function Definition({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="font-medium">{title}</h3>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
