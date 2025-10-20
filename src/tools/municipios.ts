import axios from "axios";
import env from "@/env";
import { z } from "zod";
import { Municipio, MunicipioResponse } from "@/types/localidades.js";

export const municipiosTool = {
  name: "municipios",
  description: "Busca municípios do Brasil pelo nome do município junto com seu id",
  parameters: z.object({
    nomesMunicipios: z.array(z.string())
  }),
  execute: async (args: { nomesMunicipios: string[] }): Promise<string> => {
    const response = await axios.get<Municipio[]>(`${env.IBGE_API_LOCALIDADES}/municipios`);

    const municipios: Municipio[] = response.data;

    const municipiosResponse: MunicipioResponse[] = municipios.flatMap((municipio) => args.nomesMunicipios.includes(municipio.nome) ? [{
      id: municipio.id,
      nome: municipio.nome,
    }] : [])

    return JSON.stringify(municipiosResponse, null, 2);
  },
};
