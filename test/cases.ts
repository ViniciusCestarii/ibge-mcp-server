export type EvalCategory =
  | "populacao"
  | "domicilios"
  | "economia"
  | "agropecuaria"
  | "precos"
  | "registro-civil"
  /** Exige cruzar mais de uma pesquisa na mesma resposta. */
  | "cruzado"

export interface EvalCase {
  prompt: string
  /**
   * The real value the answer must contain, taken from the IBGE API itself
   * (see `note` for the aggregate/variable it came from).
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
    prompt:
      "oi, vc sabe qnts pessoa moravam em brasilia em 2018? é pra um trabalho da facul, obg",
    expectedValue: 2974703,
    tolerance: 0,
    category: "populacao",
    note: "Mesmo dado do baseline acima, perguntado como um cidadão comum perguntaria.",
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
    expectedValue: 11451999,
    tolerance: 0,
    category: "populacao",
    note: "Complexo: busca duas cidades e compara; resposta = São Paulo. Agregado 4714, variável 93 (Rio de Janeiro: 6.211.223).",
  },

  // --- Domicílios ---------------------------------------------------------
  {
    prompt:
      "Quantos domicílios particulares permanentes ocupados havia no Brasil no Censo de 2022?",
    expectedValue: 72456368,
    tolerance: 0.001,
    category: "domicilios",
    note: "Agregado 4712, variável 381 (Domicílios particulares permanentes ocupados), N1.",
  },

  // --- Economia (PIB / empresas) -----------------------------------------
  {
    prompt: "Qual foi o PIB do município de São Paulo em 2020, em mil reais?",
    expectedValue: 746909330,
    tolerance: 0.001,
    category: "economia",
    note: "Agregado 5938, variável 37 (PIB a preços correntes, em mil reais), N6[3550308].",
  },
  {
    prompt:
      "Quantas empresas e outras organizações ativas existiam no Brasil no ano 2024?",
    expectedValue: 11222295,
    tolerance: 0.001,
    category: "economia",
    note: "CEMPRE; Agregado 9509, variável 367; valor de 2024.",
  },

  // --- Agropecuária -------------------------------------------------------
  {
    prompt:
      "Qual foi a quantidade produzida de soja (em grão) no Brasil em 2021, em toneladas?",
    expectedValue: 134799179,
    tolerance: 0.005,
    category: "agropecuaria",
    note: "Produção Agrícola Municipal (PAM), classificação por produto = soja. Agregado 1612, variável 214, classificação 81[2713].",
  },
  {
    prompt: "Qual era o efetivo de bovinos no Brasil em 2021, em cabeças?",
    expectedValue: 224601992,
    tolerance: 0.005,
    category: "agropecuaria",
    note: "Pesquisa da Pecuária Municipal (PPM). Agregado 3939, variável 105, classificação 79[2670].",
  },

  // --- Cruzado (duas pesquisas + ranking) --------------------------------
  {
    prompt:
      "Entre todas as 27 unidades da federação, qual tinha o maior número de bovinos por habitante em 2022? " +
      "Use o efetivo de bovinos da Pesquisa da Pecuária Municipal e a população residente do Censo 2022, " +
      "e informe quantas cabeças por habitante são.",
    expectedValue: 11.19,
    tolerance: 0.02,
    category: "cruzado",
    note:
      "O mais pesado da suíte: exige duas pesquisas em nível N3[all] (27 UFs cada, 54 séries no total), " +
      "cruzar as duas listas por UF, dividir e ranquear. Resposta: Rondônia, 17.688.225 bovinos " +
      "(agregado 3939, variável 105, classificação 79[2670]) / 1.581.196 habitantes " +
      "(agregado 4714, variável 93) = 11,1866 cabeças/habitante. " +
      "A margem para o 2º colocado é grande (Mato Grosso, 9,36), então arredondar não muda o vencedor; " +
      "a tolerância de 2% aceita desde 'cerca de 11' até '11,19'.",
  },

  // --- Preços (decimal / percentual) -------------------------------------
  {
    prompt:
      "Qual foi a variação acumulada do IPCA no ano de 2022, em porcentagem?",
    expectedValue: 5.79,
    tolerance: 0.02,
    category: "precos",
    note: "Valor decimal/percentual. Agregado 1737, variável 69 (variação acumulada no ano), período 202212 = 5,79%.",
  },

  // --- Registro Civil -----------------------------------------------------
  {
    prompt:
      "Quantos nascidos vivos, nascidos em 2021, foram registrados no Brasil em 2021, por lugar do registro?",
    expectedValue: 2635854,
    tolerance: 0.001,
    category: "registro-civil",
    note: "Estatísticas do Registro Civil. Agregado 2679, variável 217, classificação 232[58297] (ano de nascimento = 2021). O prompt precisa fixar dois recortes, senão há mais de uma resposta certa: (1) ano de nascimento — somando todos os anos de nascimento, os registros de 2021 dão 2.708.884; (2) critério territorial — pelo lugar de residência da mãe (agregado 2609) o mesmo recorte dá 2.630.703.",
  },
]
