export const faqs = [
  {
    question: "What is AI Speedtest?",
    answer:
      "AI Speedtest is a free browser benchmark that measures local AI inference through WebGPU. It runs real language and embedding models on your device and reports text generation speed, prompt processing speed, embedding throughput, and runtime first-token latency. It is not an internet speed test.",
  },
  {
    question: "How do I test my PC’s AI performance?",
    answer:
      "Open AI Speedtest in a browser with WebGPU enabled, plug in your laptop, close competing GPU workloads, and select Start benchmark. Keep the tab visible. The first run downloads roughly 400 MB of model weights plus runtime files, performs an unscored warm-up, and measures three or five passes. Results use the median of those passes.",
  },
  {
    question: "What does tokens per second mean?",
    answer:
      "Tokens per second (tok/s) measures how many model tokens are processed each second. Decode throughput measures new text generation; prefill throughput measures prompt processing. Tokens are pieces of text rather than whole words, so compare results from the same model, tokenizer, and benchmark protocol.",
  },
  {
    question: "What is a good AI Index score?",
    answer:
      "AI Index v1 is a relative throughput score, not a percentile or a hardware ranking. A score of 1,000 corresponds to chosen anchors of 50 decode tok/s, 500 prefill tok/s, and 1,000 embedding tok/s. Higher scores mean higher combined throughput on this workload. Compare runs using the same protocol, model versions, and conditions.",
  },
  {
    question: "Does AI Speedtest measure my GPU, CPU, or NPU?",
    answer:
      "The models run through the browser’s WebGPU adapter. Results reflect that adapter together with the browser, driver, and runtime. This test does not directly benchmark a dedicated NPU, native CUDA, model training, or maximum usable model size. It does not silently fall back to CPU inference.",
  },
  {
    question: "Why is WebGPU unavailable in my browser?",
    answer:
      "WebGPU availability depends on your browser, operating system, graphics driver, GPU, and browser settings. The site needs HTTPS in production (localhost works for development). Update your browser and graphics driver and check hardware acceleration. The benchmark reports the adapter capabilities your browser exposes.",
  },
  {
    question: "Are my benchmark results uploaded?",
    answer:
      "No. Benchmark inference runs on your device and results are not uploaded by the application. Up to 20 completed runs are stored in this browser’s localStorage, and you can export JSON yourself. Initial model and runtime downloads contact Hugging Face and GitHub; those providers and the website host may receive normal request information.",
  },
  {
    question: "Can I compare this score with native AI benchmarks?",
    answer:
      "Not directly. AI Speedtest uses SmolLM2-360M-Instruct and Arctic Embed Small through WebLLM and WebGPU. Different model sizes, quantization, runtimes, and workload definitions change performance. Compare like-for-like runs; this score does not predict all local AI applications.",
  },
] as const
