export interface AgentStep {
  toolName: string
  arguments: Record<string, unknown>
  result: string
}

export interface AgentRun {
  answer: string
  steps: AgentStep[]
  iterations: number
}

export interface AgentRunner {
  readonly name: string

  /** Called once before the first run (connect clients, spawn servers). */
  setup(): Promise<void>

  /** Called once after the last run. */
  teardown(): Promise<void>

  run(prompt: string): Promise<AgentRun>
}
