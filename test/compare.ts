export interface ComparisonResult {
  passed: boolean
  /** Every integer parsed out of the answer text. */
  foundNumbers: number[]
  /** The found number closest to the expected value, if any. */
  closest: number | null
  /** Relative difference of `closest` vs expected (0 = exact). */
  relativeError: number | null
}

/**
 * Checks whether the model's answer contains the expected population number.
 *
 * Handles pt-BR / en formatting (`12.252.023`, `12,252,023`, `12252023`) by
 * extracting digit groups and stripping separators, then accepts a match
 * within `tolerance` (relative) to allow for rounding in the answer.
 */
export function comparePopulation(
  answer: string,
  expected: number,
  tolerance = 0,
): ComparisonResult {
  const foundNumbers = extractNumbers(answer)

  let closest: number | null = null
  let relativeError: number | null = null

  for (const num of foundNumbers) {
    const error =
      expected === 0 ? Math.abs(num) : Math.abs(num - expected) / expected
    if (relativeError === null || error < relativeError) {
      relativeError = error
      closest = num
    }
  }

  return {
    passed: relativeError !== null && relativeError <= tolerance,
    foundNumbers,
    closest,
    relativeError,
  }
}

/** Pulls integers out of text, treating `.`, `,` and spaces as group separators. */
function extractNumbers(text: string): number[] {
  const matches = text.match(/\d[\d.,\s]*\d|\d/g) ?? []
  const numbers: number[] = []
  for (const raw of matches) {
    const digits = raw.replace(/[^\d]/g, "")
    if (digits) numbers.push(Number(digits))
  }
  return numbers
}
