import axios from "axios"
import {
  AiProvider,
  GenerateParams,
  ProviderMessage,
  ProviderResponse,
  ToolCall,
} from "./provider.js"

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models"

interface GeminiPart {
  text?: string
  /** Opaque signature Gemini 3.x requires echoed back with each functionCall. */
  thoughtSignature?: string
  functionCall?: { name: string; args?: Record<string, unknown> }
  functionResponse?: { name: string; response: Record<string, unknown> }
}

interface GeminiContent {
  role: "user" | "model"
  parts: GeminiPart[]
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[]
}

export interface GeminiProviderOptions {
  apiKey: string
  model: string
  /** Max attempts for transient (429/5xx) errors. Default 4. */
  maxRetries?: number
}

/** HTTP statuses worth retrying with backoff. */
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])

/**
 * Gemini implementation of {@link AiProvider} using the v1beta REST endpoint.
 *
 * It maps the neutral {@link ProviderMessage} history onto Gemini `contents`
 * and exposes MCP tools as `function_declarations`.
 */
export class GeminiProvider extends AiProvider {
  readonly name = "gemini"
  private readonly apiKey: string
  private readonly model: string
  private readonly maxRetries: number

  constructor({ apiKey, model, maxRetries = 4 }: GeminiProviderOptions) {
    super()
    this.apiKey = apiKey
    this.model = model
    this.maxRetries = maxRetries
  }

  async generate({
    system,
    messages,
    tools,
  }: GenerateParams): Promise<ProviderResponse> {
    const body = {
      system_instruction: { parts: [{ text: system }] },
      contents: messages.map(toGeminiContent),
      tools: tools.length
        ? [
            {
              function_declarations: tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                parameters: sanitizeSchema(tool.parameters),
              })),
            },
          ]
        : undefined,
    }

    const url = `${GEMINI_BASE_URL}/${this.model}:generateContent`

    const data = await this.post(url, body)

    const parts = data.candidates?.[0]?.content?.parts ?? []

    const textParts: string[] = []
    const toolCalls: ToolCall[] = []

    parts.forEach((part, index) => {
      if (part.text) textParts.push(part.text)
      if (part.functionCall) {
        toolCalls.push({
          id: `${part.functionCall.name}-${index}`,
          name: part.functionCall.name,
          arguments: part.functionCall.args ?? {},
          // Preserve the signature so it can be replayed in the next request.
          providerMetadata: part.thoughtSignature
            ? { thoughtSignature: part.thoughtSignature }
            : undefined,
        })
      }
    })

    return {
      text: textParts.length ? textParts.join("\n") : null,
      toolCalls,
    }
  }

  /**
   * POSTs to Gemini, retrying transient 429/5xx errors with exponential
   * backoff. On failure it throws a concise Error (status + response body)
   * instead of letting axios dump the whole request, which would leak the
   * API key and flood the logs.
   */
  private async post(url: string, body: unknown): Promise<GeminiResponse> {
    let lastError: unknown

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const { data } = await axios.post<GeminiResponse>(url, body, {
          params: { key: this.apiKey },
          headers: { "Content-Type": "application/json" },
          timeout: 60_000,
        })
        return data
      } catch (error) {
        lastError = error
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined

        if (
          status !== undefined &&
          RETRYABLE_STATUS.has(status) &&
          attempt < this.maxRetries
        ) {
          const delayMs = 500 * 2 ** (attempt - 1)
          console.warn(
            `  ⚠ Gemini ${status}, retry ${attempt}/${this.maxRetries - 1} in ${delayMs}ms`,
          )
          await new Promise((resolve) => setTimeout(resolve, delayMs))
          continue
        }
        break
      }
    }

    throw toCleanError(lastError)
  }
}

/** Turns an AxiosError into a compact Error without the request dump. */
function toCleanError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? "no response"
    const data = error.response?.data
    const detail =
      typeof data === "string"
        ? data
        : data
          ? JSON.stringify(data)
          : error.message
    return new Error(`Gemini request failed (${status}): ${detail}`)
  }
  return error instanceof Error ? error : new Error(String(error))
}

function toGeminiContent(message: ProviderMessage): GeminiContent {
  switch (message.role) {
    case "user":
      return { role: "user", parts: [{ text: message.content }] }
    case "assistant": {
      const parts: GeminiPart[] = []
      if (message.content) parts.push({ text: message.content })
      for (const call of message.toolCalls ?? []) {
        const signature = call.providerMetadata?.thoughtSignature
        parts.push({
          functionCall: { name: call.name, args: call.arguments },
          ...(typeof signature === "string"
            ? { thoughtSignature: signature }
            : {}),
        })
      }
      return { role: "model", parts }
    }
    case "tool":
      return {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: message.toolName,
              response: { result: message.content },
            },
          },
        ],
      }
  }
}

/**
 * Strips JSON Schema keywords Gemini's function declarations reject
 * (e.g. `$schema`, `additionalProperties`) while keeping the structure.
 */
function sanitizeSchema(schema: unknown): Record<string, unknown> {
  const stripKeys = new Set([
    "$schema",
    "additionalProperties",
    "$ref",
    "default",
  ])

  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value)) {
        if (stripKeys.has(key)) continue
        out[key] = walk(val)
      }
      return out
    }
    return value
  }

  return walk(schema) as Record<string, unknown>
}
