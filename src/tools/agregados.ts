import axios from "axios";
import env from "@/env";

export const agregadosTool = {
  name: "agregados",
  description: "Busca por agregados do IBGE",
  execute: async (): Promise<string> => {
    const response = await axios.get<object[]>(env.IBGE_API);

    return JSON.stringify(response.data, null, 2);
  },
};
