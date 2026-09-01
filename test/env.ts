import dotenv from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"

const testDir = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(testDir, ".env.test") })

/**
 * Which harness answers the eval prompts. Keys are validated per runner in
 * `runners/index.ts`, so running Claude Code does not require a Gemini key and
 * vice versa.
 */
export const TEST_RUNNERS = ["gemini", "claude-code"] as const

const envSchema = z.object({
  TEST_RUNNER: z.enum(TEST_RUNNERS).default("gemini"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  /** Omit to let Claude Code use its own configured default model. */
  CLAUDE_CODE_MODEL: z.string().optional(),
  AGENT_MAX_ITERATIONS: z.coerce.number().int().positive().default(8),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid test environment variables:", parsed.error.issues)
  process.exit(1)
}

const testEnv = parsed.data

export default testEnv
