import { z } from "zod";

const envSchema = z.object({
  TRANSPORT_TYPE: z.enum(["stdio", "httpStream"]).default("stdio"),
  PORT: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().int().default(3000)),
  IBGE_API_AGREGADOS: z.url().default("https://servicodados.ibge.gov.br/api/v3/agregados"),
  IBGE_API_LOCALIDADES: z.url().default("https://servicodados.ibge.gov.br/api/v1/localidades"),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error("Invalid environment variables:", envParse.error.format());
  process.exit(1);
}

const env = envParse.data;

export default env
