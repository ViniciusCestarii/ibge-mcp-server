import dotenv from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"

const testDir = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(testDir, ".env.test") })

const envSchema = z.object({
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required in test/.env.test"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  AGENT_MAX_ITERATIONS: z.coerce.number().int().positive().default(8),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid test environment variables:", parsed.error.issues)
  process.exit(1)
}

const testEnv = parsed.data

export default testEnv
