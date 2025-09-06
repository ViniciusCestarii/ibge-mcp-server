import { z } from "zod";

const envSchema = z.object({
  TRANSPORT_TYPE: z.enum(["stdio", "httpStream"]).optional(),
  PORT: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().int().min(1).max(65535).default(3000)),
});

const envParse = envSchema.safeParse({
  TRANSPORT_TYPE: process.env.TRANSPORT_TYPE,
  PORT: process.env.PORT,
});

if (!envParse.success) {
  console.error("Invalid environment variables:", envParse.error.format());
  process.exit(1);
}

const env = envParse.data;

export default env