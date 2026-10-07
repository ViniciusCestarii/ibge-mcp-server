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

  test(`[${runner.name}] (data-hora) usa a data atual para responder`, async () => {
    const run = await runner.run(
      "Quantos anos se passaram desde o Censo de 2022 até o ano atual?",
    )

    const toolNames = run.steps.map((s) => s.toolName)
    console.log(`\nTools called: ${toolNames.join(" → ") || "(none)"}`)
    console.log(`Answer: ${run.answer}\n`)

    assert.ok(
      toolNames.includes("data-hora"),
      `Expected 'data-hora' to be called. Tools called: ${toolNames.join(", ")}`,
    )

    const anoAtual = Number(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
      }).format(new Date()),
    )
    const comparison = compareNumber(run.answer, anoAtual - 2022)

    assert.ok(
      comparison.passed,
      `Expected ${anoAtual - 2022} in answer.\nAnswer: ${run.answer}`,
    )
  })

  test(`[${runner.name}] (fonteUrl) cita a URL da fonte dos dados`, async () => {
    const run = await runner.run(
      "População de Brasília em 2018. Inclua na resposta o link da fonte dos dados.",
    )

    console.log(
      `\nTools called: ${run.steps.map((s) => s.toolName).join(" → ") || "(none)"}`,
    )
    console.log(`Answer: ${run.answer}\n`)

    const fonteUrls = run.steps
      .filter((s) => s.toolName === "agregado-dados")
      .flatMap((s) => {
        try {
          const { fonteUrl } = JSON.parse(s.result) as { fonteUrl?: string }
          return fonteUrl ? [fonteUrl, decodeURIComponent(fonteUrl)] : []
        } catch {
          return []
        }
      })

    assert.ok(fonteUrls.length > 0, "No fonteUrl returned by 'agregado-dados'.")
    assert.ok(
      fonteUrls.some((url) => run.answer.includes(url)),
      `Expected one of the fonteUrls in answer.\n` +
        `fonteUrls: ${fonteUrls.join(", ")}\nAnswer: ${run.answer}`,
    )
  })
})
