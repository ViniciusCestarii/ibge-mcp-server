import axios from "axios";
import env from "@/env";
import { z } from "zod";

export const agregadoDadosTool = {
  name: "agregado-dados",
  description: "Busca os dados de um agregado no IBGE",
  parameters: z.object({
    agregadoId: z.string(),
    periodo: z.string(),
    variavelId: z.string(),
    localidades: z.string(),
    classificacao: z.string().optional(),
  }),
  execute: async (args: {
    agregadoId: string;
    periodo: string;
    variavelId: string;
    localidades: string;
    classificacao?: string;
  }): Promise<string> => {
    const { agregadoId, periodo, variavelId, localidades, classificacao } = args;

    let url = `${env.IBGE_API_AGREGADOS}/${agregadoId}/periodos/${periodo}/variaveis/${variavelId}?localidades=${encodeURIComponent(localidades)}`;

    if (classificacao) {
      url += `&classificacao=${encodeURIComponent(classificacao)}`;
    }

    const response = await axios.get<object[]>(url);

    const dados = {
      "fonteUrl": url,
      "dados": response.data
    }

    return JSON.stringify(dados, null, 2);
  },
};