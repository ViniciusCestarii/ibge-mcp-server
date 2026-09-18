export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}
export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  providerMetadata?: Record<string, unknown>
}

export type ProviderMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content?: string; toolCalls?: ToolCall[] }
  | { role: "tool"; toolCallId: string; toolName: string; content: string }
export interface ProviderResponse {
  text: string | null
  toolCalls: ToolCall[]
}

export interface GenerateParams {
  system: string
  messages: ProviderMessage[]
  tools: ToolDefinition[]
}
export abstract class AiProvider {
  abstract readonly name: string

  abstract generate(params: GenerateParams): Promise<ProviderResponse>
}
