import { AiProvider, ProviderMessage } from "./ai/provider.js"
import { McpTestClient } from "./mcp-client.js"

const SYSTEM_PROMPT = `Você é um assistente que responde perguntas sobre dados do IBGE.
Use as ferramentas disponíveis para descobrir ids de localidades, agregados, variáveis e buscar os dados antes de responder.
Sempre que possível, descubra os ids necessários chamando as ferramentas em vez de adivinhar.
Responda em português, de forma objetiva, incluindo o número exato encontrado.`

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

export interface RunAgentOptions {
  provider: AiProvider
  client: McpTestClient
  prompt: string
  maxIterations: number
  /** Set to log each tool call as it happens. */
  verbose?: boolean
}

/**
 * Drives the agentic loop: feed the prompt to the provider, execute whatever
 * tools it asks for via MCP, feed the results back, and repeat until the model
 * answers with text instead of tool calls (or we hit the iteration cap).
 */
export async function runAgent({
  provider,
  client,
  prompt,
  maxIterations,
  verbose = false,
}: RunAgentOptions): Promise<AgentRun> {
  const tools = await client.listTools()
  const messages: ProviderMessage[] = [{ role: "user", content: prompt }]
  const steps: AgentStep[] = []

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const response = await provider.generate({
      system: SYSTEM_PROMPT,
      messages,
      tools,
    })

    if (response.toolCalls.length === 0) {
      return {
        answer: response.text ?? "",
        steps,
        iterations: iteration,
      }
    }

    messages.push({
      role: "assistant",
      content: response.text ?? undefined,
      toolCalls: response.toolCalls,
    })

    for (const call of response.toolCalls) {
      if (verbose) {
        console.log(`  → ${call.name}(${JSON.stringify(call.arguments)})`)
      }

      let result: string
      try {
        result = await client.callTool(call.name, call.arguments)
      } catch (error) {
        result = `Erro ao chamar a ferramenta: ${
          error instanceof Error ? error.message : String(error)
        }`
      }

      steps.push({ toolName: call.name, arguments: call.arguments, result })
      messages.push({
        role: "tool",
        toolCallId: call.id,
        toolName: call.name,
        content: result,
      })
    }
  }

  return {
    answer: `Limite de ${maxIterations} iterações atingido sem resposta final.`,
    steps,
    iterations: maxIterations,
  }
}
