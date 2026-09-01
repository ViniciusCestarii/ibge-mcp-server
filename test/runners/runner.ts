export interface AgentStep {
  toolName: string
  arguments: Record<string, unknown>
  result: string
}

export interface AgentRun {
  /** The model's final natural-language answer. */
  answer: string
  /** Every tool invocation made along the way, in order. */
  steps: AgentStep[]
  /** Number of generation rounds used. */
  iterations: number
}

/**
 * A way of answering a prompt with this MCP server's tools.
 *
 * Two shapes exist today: {@link ProviderRunner}, which drives our own agentic
 * loop over an {@link AiProvider}, and {@link ClaudeCodeRunner}, which hands
 * the prompt to the Claude Code harness and lets it run its own loop. Tests
 * only ever talk to this interface, so adding a harness costs no test changes.
 */
export interface AgentRunner {
  /** Human-readable name, used in test titles and logs. */
  readonly name: string

  /** Called once before the first run (connect clients, spawn servers). */
  setup(): Promise<void>

  /** Called once after the last run. */
  teardown(): Promise<void>

  run(prompt: string): Promise<AgentRun>
}
