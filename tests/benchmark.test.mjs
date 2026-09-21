import test from "node:test"
import assert from "node:assert/strict"
import {
  calculateScore,
  median,
  variation,
  readHistory,
  HISTORY_KEY,
  PROTOCOL,
} from "../lib/benchmark.ts"

const sample = (decode = 50, prefill = 500) => ({
  pass: 1,
  decode,
  prefill,
  ttft: 20,
  promptTokens: 100,
  outputTokens: 128,
  decodeTokens: 127,
  elapsedMs: 2000,
})
const embedding = (tokensPerSecond = 1000) => ({
  pass: 1,
  tokensPerSecond,
  documentsPerSecond: 10,
  tokens: 100,
  elapsedMs: 100,
  dimensions: 384,
})
test("median resists outliers without mutating raw measurements", () => {
  const values = [100, 1, 90]
  assert.equal(median(values), 90)
  assert.deepEqual(values, [100, 1, 90])
  assert.equal(median([2, 4]), 3)
})
test("invalid samples never produce scores", () => {
  for (const value of [NaN, Infinity, -1, 0])
    assert.throws(() => calculateScore([sample(value)], [embedding()]))
  assert.throws(() => calculateScore([], [embedding()]))
  assert.throws(() => calculateScore([sample()], []))
})
test("score anchors and multiplicative scaling are consistent", () => {
  assert.equal(calculateScore([sample()], [embedding()]), 1000)
  assert.equal(calculateScore([sample(100, 1000)], [embedding(2000)]), 2000)
  assert.equal(calculateScore([sample(200)], [embedding()]), 2000)
  assert.equal(
    calculateScore([sample(50), sample(1), sample(50)], [embedding()]),
    1000
  )
})
test("variation identifies unstable runs", () => {
  assert.equal(variation([50, 50, 50]), 0)
  assert.equal(variation([40, 50, 60]), 40)
})
test("history tolerates blocked storage, malformed JSON and invalid scores", () => {
  const values = new Map()
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: (key) => values.get(key) },
  })
  assert.deepEqual(readHistory(), [])
  values.set(HISTORY_KEY, "broken")
  assert.deepEqual(readHistory(), [])
  values.set(
    HISTORY_KEY,
    JSON.stringify([null, {}, { protocol: PROTOCOL, score: 1000 }])
  )
  assert.deepEqual(readHistory(), [])
  const result = {
    id: "test",
    protocol: PROTOCOL,
    date: "2026-09-21T12:00:00Z",
    device: { gpu: "test GPU" },
    warnings: [],
    repetitions: 3,
    llm: [sample(), sample(), sample()],
    embeddings: [embedding(), embedding(), embedding()],
    score: 1000,
  }
  values.set(HISTORY_KEY, JSON.stringify([result, { ...result, score: 99999 }]))
  assert.equal(readHistory().length, 1)
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("blocked")
    },
  })
  assert.deepEqual(readHistory(), [])
  delete globalThis.localStorage
})
