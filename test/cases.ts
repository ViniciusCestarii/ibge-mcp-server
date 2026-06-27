export interface PopulationCase {
  prompt: string
  /**
   * The real population to compare against.
   * TODO: replace the placeholder with the actual IBGE figure.
   */
  expectedPopulation: number
  /** Allowed relative error (0 = must match exactly). */
  tolerance?: number
}

export const populationCases: PopulationCase[] = [
  {
    prompt: "População da cidade São Paulo em 2018",
    expectedPopulation: 12176866,
    tolerance: 0,
  },
]
