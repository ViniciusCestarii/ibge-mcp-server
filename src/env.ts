import { z } from "zod";

const envSchema = z.object({
  TRANSPORT_TYPE: z.enum(["stdio", "httpStream"]).optional(),
  PORT: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().int().min(1).max(65535).default(3000)),
  IBGE_API: z.string().url().default("https://servicodados.ibge.gov.br/api/v3/agregados"),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error("Invalid environment variables:", envParse.error.format());
  process.exit(1);
}

const env = envParse.data;

export default env