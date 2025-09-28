import axios from "axios";
import env from "@/env";
import { z } from "zod";
import { AgregadoResponse, Pesquisa } from "@/types/ibge";

export const agregadosTool = {
  name: "agregados",
  description: "Busca agregados de uma pesquisa por pesquisaId do IBGE",
  parameters: z.object({
    pesquisaId: z.string()
  }),
  execute: async (args: { pesquisaId: string }): Promise<string> => {
    const response = await axios.get<Pesquisa[]>(env.IBGE_API);

    const pesquisa = response.data.filter((pesquisa) => pesquisa.id === args.pesquisaId)[0];

    if (!pesquisa) {
      return `Pesquisa com id ${args.pesquisaId} não encontrada.`;
    }

    const agregados: AgregadoResponse[] = pesquisa.agregados.map((agregado) => {
      return {
        agregadoId: agregado.id,
        nome: agregado.nome
      }
    })

    return JSON.stringify(agregados, null, 2);  
  },
};
