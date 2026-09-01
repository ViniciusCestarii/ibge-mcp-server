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
  /** Model alias or id; omit to use whatever Claude Code is configured with. */
  model?: string
  maxTurns: number
  verbose?: boolean
}

/**
 * Hands the prompt to the Claude Code harness and lets it run its own agentic
 * loop, with this project's MCP server wired in over stdio.
 *
 * Unlike {@link ProviderRunner} there is no loop of ours here: we only observe
 * the message stream to reconstruct the same {@link AgentRun} shape the
 * assertions expect. The harness is locked down on purpose — no built-in tools,
 * no filesystem settings — so a run exercises this server's tools and nothing
 * else.
 */
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

  /** Claude Code spawns the MCP server itself, so there is nothing to set up. */
  async setup(): Promise<void> {}

  async teardown(): Promise<void> {}

  async run(prompt: string): Promise<AgentRun> {
    const steps: AgentStep[] = []
    /** tool_use id -> index in `steps`, so results can be filled in later. */
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
        // Only this server's tools: no Bash/Read/Write, and no user or project
        // settings leaking in and changing what the model can reach.
        tools: [],
        settingSources: [],
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

      // Tool results come back as a synthetic user turn.
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

/** Mirrors `McpTestClient.callTool`: keep the text, drop everything else. */
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
