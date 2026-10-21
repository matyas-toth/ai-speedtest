export const faqs = [
  {
    question: "What does the benchmark test?",
    answer:
      "The benchmark runs a language model and an embedding model on your device through WebGPU to measure text generation, prompt processing, embeddings, and time to first token.",
  },
  {
    question: "How do I test my PC’s AI performance?",
    answer:
      "Select Start benchmark in a browser with WebGPU enabled, keeping your laptop plugged in and the tab visible while the test runs. The first run downloads about 400 MB of model weights plus runtime files, warms up each model, and measures three or five passes to calculate median results.",
  },
  {
    question: "What does tokens per second mean?",
    answer:
      "Tokens are pieces of text, and tokens per second (tok/s) measures how quickly a model generates or processes them. Higher throughput means faster processing, but comparisons are meaningful only when the model, tokenizer, and workload match.",
  },
  {
    question: "How should I interpret my AI score?",
    answer:
      "A higher score indicates faster combined throughput on this workload, with 1,000 corresponding to chosen targets of 50 generation tok/s, 500 prompt tok/s, and 1,000 embedding tok/s. The score is a relative index rather than a percentile or hardware ranking, so compare runs using the same protocol, model versions, and conditions.",
  },
  {
    question: "Does AI Speedtest measure my GPU, CPU, or NPU?",
    answer:
      "The models run through the browser’s WebGPU adapter, so results reflect that graphics processor along with the browser, driver, and runtime. The test does not measure a dedicated NPU, native CUDA, model training, or maximum usable model size, and it does not fall back to CPU inference.",
  },
  {
    question: "Why is WebGPU unavailable in my browser?",
    answer:
      "WebGPU depends on your browser, operating system, graphics driver, and GPU, and requires HTTPS or localhost. Try updating your browser and graphics driver, then check that hardware acceleration is enabled in your browser settings.",
  },
  {
    question: "Are my benchmark results uploaded?",
    answer:
      "The application saves up to 20 completed runs in your browser and does not automatically upload result files. Model downloads contact Hugging Face and GitHub, while Microsoft Clarity records site usage and may capture results visible on screen; the Privacy page explains these requests and recordings.",
  },
  {
    question: "Can I compare this score with native AI benchmarks?",
    answer:
      "This test uses SmolLM2-360M-Instruct and Arctic Embed Small through WebLLM and WebGPU, so comparisons with native benchmarks depend on matching models, quantization, runtimes, and workloads. The score reflects this test’s performance and does not predict every local AI application.",
  },
] as const
