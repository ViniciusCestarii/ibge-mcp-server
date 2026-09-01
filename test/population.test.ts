import assert from "node:assert/strict"
import { after, before, describe, test } from "node:test"
import { runAgent } from "./agent.js"
import { GeminiProvider } from "./ai/gemini.js"
import { AiProvider } from "./ai/provider.js"
import { evalCases } from "./cases.js"
import { compareNumber } from "./compare.js"
import testEnv from "./env.js"
import { McpTestClient } from "./mcp-client.js"

describe("IBGE data answers via MCP + AI provider", () => {
  const client = new McpTestClient()

  // Swap this for any other AiProvider implementation to test a different model.
  const provider: AiProvider = new GeminiProvider({
    apiKey: testEnv.GEMINI_API_KEY,
    model: testEnv.GEMINI_MODEL,
  })

  before(async () => {
    await client.connect()
  })

  after(async () => {
    await client.close()
  })

  for (const testCase of evalCases) {
    test(`[${provider.name}] (${testCase.category}) ${testCase.prompt}`, async () => {
      const run = await runAgent({
        provider,
        client,
        prompt: testCase.prompt,
        maxIterations: testEnv.AGENT_MAX_ITERATIONS,
        verbose: true,
      })

      console.log(
        `\nTools called: ${run.steps.map((s) => s.toolName).join(" → ") || "(none)"}`,
      )
      console.log(`Answer: ${run.answer}\n`)

      const comparison = compareNumber(
        run.answer,
        testCase.expectedValue,
        testCase.tolerance ?? 0,
      )

      assert.ok(
        comparison.passed,
        `Expected value ${testCase.expectedValue} not found in answer.\n` +
          `Closest number: ${comparison.closest} (relative error ${comparison.relativeError}).\n` +
          `Numbers seen: ${comparison.foundNumbers.join(", ")}\n` +
          `Answer: ${run.answer}`,
      )
    })
  }
})
