import { runAgent } from "../agent.js"
import { AiProvider } from "../ai/provider.js"
import { McpTestClient } from "../mcp-client.js"
import { AgentRun, AgentRunner } from "./runner.js"

export interface ProviderRunnerOptions {
  provider: AiProvider
  maxIterations: number
  verbose?: boolean
}

/**
 * Runs the prompt through our own agentic loop (`runAgent`) on top of a raw
 * {@link AiProvider}, talking to the MCP server over stdio.
 */
export class ProviderRunner implements AgentRunner {
  readonly name: string
  private readonly client = new McpTestClient()
  private readonly provider: AiProvider
  private readonly maxIterations: number
  private readonly verbose: boolean

  constructor({
    provider,
    maxIterations,
    verbose = false,
  }: ProviderRunnerOptions) {
    this.provider = provider
    this.maxIterations = maxIterations
    this.verbose = verbose
    this.name = provider.name
  }

  async setup(): Promise<void> {
    await this.client.connect()
  }

  async teardown(): Promise<void> {
    await this.client.close()
  }

  run(prompt: string): Promise<AgentRun> {
    return runAgent({
      provider: this.provider,
      client: this.client,
      prompt,
      maxIterations: this.maxIterations,
      verbose: this.verbose,
    })
  }
}
