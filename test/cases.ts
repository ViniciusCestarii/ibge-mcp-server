export type EvalCategory =
  | "populacao"
  | "domicilios"
  | "economia"
  | "agropecuaria"
  | "precos"
  | "registro-civil"

export interface EvalCase {
  prompt: string
  /**
   * The real value the answer must contain. Set to 0 as a placeholder when the
   * exact IBGE figure still needs to be looked up (see `note`).
   */
  expectedValue: number
  /** Allowed relative error (0 = must match exactly). */
  tolerance?: number
  /** Indicator family the prompt exercises. */
  category: EvalCategory
  /** What the agent must figure out, plus any value still to be verified. */
  note?: string
}

export const evalCases: EvalCase[] = [
  // --- População ----------------------------------------------------------
  {
    prompt: "População de Brasília em 2018",
    expectedValue: 2974703,
    tolerance: 0,
    category: "populacao",
    note: "Baseline: município (N6), estimativa de 2018.",
  },
  {
    prompt: "Qual foi a população total do Brasil no Censo de 2022?",
    expectedValue: 203080756,
    tolerance: 0,
    category: "populacao",
    note: "Nível Brasil (N1), Censo 2022.",
  },
  {
    prompt:
      "Entre São Paulo e Rio de Janeiro, qual cidade tinha mais habitantes no Censo de 2022 e quantos?",
    expectedValue: 11451245,
    tolerance: 0,
    category: "populacao",
    note: "Complexo: busca duas cidades e compara; resposta = São Paulo. VERIFICAR valor.",
  },

  // --- Domicílios ---------------------------------------------------------
  {
    prompt:
      "Quantos domicílios particulares permanentes ocupados havia no Brasil no Censo de 2022?",
    expectedValue: 0,
    tolerance: 0.001,
    category: "domicilios",
    note: "TODO: preencher valor. Pesquisa do Censo, variável de domicílios.",
  },

  // --- Economia (PIB / empresas) -----------------------------------------
  {
    prompt: "Qual foi o PIB do município de São Paulo em 2020, em mil reais?",
    expectedValue: 0,
    tolerance: 0.001,
    category: "economia",
    note: "TODO: preencher valor. Pesquisa 'Produto Interno Bruto dos Municípios'.",
  },
  {
    prompt:
      "Quantas empresas e outras organizações ativas existiam no Brasil no último ano disponível?",
    expectedValue: 0,
    tolerance: 0.001,
    category: "economia",
    note: "TODO: preencher valor. CEMPRE; exige descobrir o último período ('-1').",
  },

  // --- Agropecuária -------------------------------------------------------
  {
    prompt:
      "Qual foi a quantidade produzida de soja (em grão) no Brasil em 2021, em toneladas?",
    expectedValue: 0,
    tolerance: 0.005,
    category: "agropecuaria",
    note: "TODO: preencher valor. Produção Agrícola Municipal (PAM), classificação por produto = soja.",
  },
  {
    prompt: "Qual era o efetivo de bovinos no Brasil em 2021, em cabeças?",
    expectedValue: 0,
    tolerance: 0.005,
    category: "agropecuaria",
    note: "TODO: preencher valor. Pesquisa da Pecuária Municipal (PPM).",
  },

  // --- Preços (decimal / percentual) -------------------------------------
  {
    prompt:
      "Qual foi a variação acumulada do IPCA no ano de 2022, em porcentagem?",
    expectedValue: 5.79,
    tolerance: 0.02,
    category: "precos",
    note: "Valor decimal/percentual. CONFIRMAR (IPCA acumulado 2022 ≈ 5,79%).",
  },

  // --- Registro Civil -----------------------------------------------------
  {
    prompt: "Quantos nascidos vivos foram registrados no Brasil em 2021?",
    expectedValue: 0,
    tolerance: 0.001,
    category: "registro-civil",
    note: "TODO: preencher valor. Estatísticas do Registro Civil.",
  },
]
