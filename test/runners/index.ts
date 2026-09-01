import { GeminiProvider } from "../ai/gemini.js"
import testEnv from "../env.js"
import { ClaudeCodeRunner } from "./claude-code.js"
import { ProviderRunner } from "./provider.js"
import { AgentRunner } from "./runner.js"

export * from "./runner.js"

/**
 * Builds the runner named by `TEST_RUNNER`, validating only the credentials
 * that runner actually needs.
 */
export function createRunner(verbose = false): AgentRunner {
  switch (testEnv.TEST_RUNNER) {
    case "gemini": {
      if (!testEnv.GEMINI_API_KEY) {
        throw new Error(
          "GEMINI_API_KEY is required in test/.env.test when TEST_RUNNER=gemini",
        )
      }
      return new ProviderRunner({
        provider: new GeminiProvider({
          apiKey: testEnv.GEMINI_API_KEY,
          model: testEnv.GEMINI_MODEL,
        }),
        maxIterations: testEnv.AGENT_MAX_ITERATIONS,
        verbose,
      })
    }
    case "claude-code":
      // Claude Code resolves its own credentials (an existing `claude` login or
      // ANTHROPIC_API_KEY), so there is nothing to validate here.
      return new ClaudeCodeRunner({
        model: testEnv.CLAUDE_CODE_MODEL,
        maxTurns: testEnv.AGENT_MAX_ITERATIONS,
        verbose,
      })
  }
}
