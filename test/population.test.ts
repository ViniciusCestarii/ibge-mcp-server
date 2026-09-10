import assert from "node:assert/strict"
import { after, before, describe, test } from "node:test"
import { evalCases } from "./cases.js"
import { compareNumber } from "./compare.js"
import { createRunner } from "./runners/index.js"

describe("IBGE data answers via MCP", () => {
  // Selected by TEST_RUNNER: our own agent loop over a raw provider, or the
  // Claude Code harness driving itself.
  const runner = createRunner(true)

  before(async () => {
    await runner.setup()
  })

  after(async () => {
    await runner.teardown()
  })

  for (const testCase of evalCases) {
    test(`[${runner.name}] (${testCase.category}) ${testCase.prompt}`, async () => {
      const run = await runner.run(testCase.prompt)

      console.log(
        `\nTools called: ${run.steps.map((s) => s.toolName).join(" → ") || "(none)"}`,
      )
      console.log(`Answer: ${run.answer}\n`)

      const comparison = compareNumber(run.answer, testCase.expectedValue)

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
