import axios from "axios";
import env from "@/env";
import { z } from "zod";

export const agregadoMetadadoTool = {
  name: "agregado-metadado",
  description: "Busca metadados (variáveis, nivelTerritorial, periodicidade, etc.) de um agregado por id",
  parameters: z.object({
    id: z.string()
  }),
  execute: async (args: {id: string}): Promise<string> => {
    const response = await axios.get<object[]>(`${env.IBGE_API}/${args.id}/metadados`);

    return JSON.stringify(response.data, null, 2);
  },
};
