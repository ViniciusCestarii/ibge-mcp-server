import { query } from "@anthropic-ai/claude-agent-sdk"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { SYSTEM_PROMPT } from "../prompt.js"
import { AgentRun, AgentRunner, AgentStep } from "./runner.js"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
)

/** Name Claude Code gives this server's tools: `mcp__<server>__<tool>`. */
const MCP_SERVER_NAME = "ibge"
const TOOL_PREFIX = `mcp__${MCP_SERVER_NAME}__`

export interface ClaudeCodeRunnerOptions {
  model?: string
  maxTurns: number
  verbose?: boolean
}

export class ClaudeCodeRunner implements AgentRunner {
  readonly name = "claude-code"
  private readonly model?: string
  private readonly maxTurns: number
  private readonly verbose: boolean

  constructor({ model, maxTurns, verbose = false }: ClaudeCodeRunnerOptions) {
    this.model = model
    this.maxTurns = maxTurns
    this.verbose = verbose
  }

  async setup(): Promise<void> {}

  async teardown(): Promise<void> {}

  async run(prompt: string): Promise<AgentRun> {
    const steps: AgentStep[] = []
    const stepByToolUseId = new Map<string, number>()

    let answer = ""
    let iterations = 0

    const response = query({
      prompt,
      options: {
        cwd: projectRoot,
        model: this.model,
        maxTurns: this.maxTurns,
        systemPrompt: SYSTEM_PROMPT,
        tools: [],
        settingSources: [],
        // Nor MCP servers from elsewhere: .mcp.json, plugins or claude.ai
        // connectors tied to the logged-in account.
        strictMcpConfig: true,
        env: {
          ...process.env,
          ENABLE_CLAUDEAI_MCP_SERVERS: "false",
          // Keep large tool results inline instead of offloading them to a
          // file the model has no tools to read.
          MAX_MCP_OUTPUT_TOKENS: "200000",
        },
        mcpServers: {
          [MCP_SERVER_NAME]: {
            type: "stdio",
            command: "npx",
            args: ["tsx", "src/index.ts"],
            env: { ...process.env, TRANSPORT_TYPE: "stdio" } as Record<
              string,
              string
            >,
          },
        },
        canUseTool: async (toolName) =>
          toolName.startsWith(TOOL_PREFIX)
            ? { behavior: "allow", updatedInput: {} }
            : {
                behavior: "deny",
                message: `${toolName} is not allowed in tests.`,
              },
      },
    })

    for await (const message of response) {
      if (message.type === "assistant") {
        iterations++
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            const args = (block.input ?? {}) as Record<string, unknown>
            if (this.verbose) {
              console.log(`  → ${block.name}(${JSON.stringify(args)})`)
            }
            stepByToolUseId.set(block.id, steps.length)
            steps.push({
              toolName: stripPrefix(block.name),
              arguments: args,
              result: "",
            })
          }
        }
        continue
      }

      if (message.type === "user") {
        const content = message.message.content
        if (typeof content === "string") continue
        for (const block of content) {
          if (block.type !== "tool_result") continue
          const index = stepByToolUseId.get(block.tool_use_id)
          if (index === undefined) continue
          steps[index].result = flattenToolResult(block.content)
        }
        continue
      }

      if (message.type === "result") {
        if (message.subtype !== "success") {
          throw new Error(
            `Claude Code run failed (${message.subtype}) after ${message.num_turns} turns.`,
          )
        }
        answer = message.result
      }
    }

    return { answer, steps, iterations }
  }
}

function stripPrefix(toolName: string): string {
  return toolName.startsWith(TOOL_PREFIX)
    ? toolName.slice(TOOL_PREFIX.length)
    : toolName
}

function flattenToolResult(content: unknown): string {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""
  return content
    .filter(
      (part): part is { type: "text"; text: string } =>
        typeof part === "object" &&
        part !== null &&
        (part as { type?: string }).type === "text" &&
        typeof (part as { text?: unknown }).text === "string",
    )
    .map((part) => part.text)
    .join("\n")
}
