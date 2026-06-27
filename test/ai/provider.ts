/**
 * Provider-agnostic abstractions for an agentic, tool-calling LLM.
 *
 * Concrete providers (Gemini, and any future OpenAI/Anthropic/etc.) extend
 * {@link AiProvider} and translate these neutral types to/from their own wire
 * format. The agent loop in `agent.ts` only ever talks to this interface, so
 * swapping providers requires no changes to the test logic.
 */

/** A tool the model may call, described with a JSON Schema for its arguments. */
export interface ToolDefinition {
  name: string
  description: string
  /** JSON Schema object describing the tool's input. */
  parameters: Record<string, unknown>
}

/** A request from the model to invoke a tool. */
export interface ToolCall {
  /** Stable id used to correlate the call with its result. */
  id: string
  name: string
  arguments: Record<string, unknown>
  /**
   * Opaque, provider-specific data that must be echoed back verbatim when the
   * call is replayed in the history (e.g. Gemini's `thoughtSignature`). The
   * agent loop treats this as a black box.
   */
  providerMetadata?: Record<string, unknown>
}

/** A single turn in the conversation passed to the provider. */
export type ProviderMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content?: string; toolCalls?: ToolCall[] }
  | { role: "tool"; toolCallId: string; toolName: string; content: string }

/** What a provider returns for one generation step. */
export interface ProviderResponse {
  /** Free-text answer, if the model produced any. */
  text: string | null
  /** Tool calls the model wants executed before continuing. */
  toolCalls: ToolCall[]
}

export interface GenerateParams {
  system: string
  messages: ProviderMessage[]
  tools: ToolDefinition[]
}

/** Base class every AI provider implements. */
export abstract class AiProvider {
  /** Human-readable provider name, used in logs. */
  abstract readonly name: string

  /** Run one generation step given the conversation so far and the tools. */
  abstract generate(params: GenerateParams): Promise<ProviderResponse>
}
