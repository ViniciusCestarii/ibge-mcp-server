export interface ComparisonResult {
  passed: boolean
  /** Every number parsed out of the answer text. */
  foundNumbers: number[]
  /** The found number closest to the expected value, if any. */
  closest: number | null
  /** Relative difference of `closest` vs expected (0 = exact). */
  relativeError: number | null
}

/**
 * Checks whether the model's answer contains the expected number (population,
 * GDP, a count, a percentage, etc.).
 *
 * Handles pt-BR / en formatting by extracting numeric tokens and trying both
 * an integer reading (separators stripped) and a decimal reading, then accepts
 * a match within `tolerance` (relative) to allow for rounding in the answer.
 */
export function compareNumber(
  answer: string,
  expected: number,
  tolerance = 0,
): ComparisonResult {
  const foundNumbers = extractNumbers(answer)

  let closest: number | null = null
  let relativeError: number | null = null

  for (const num of foundNumbers) {
    const error =
      expected === 0 ? Math.abs(num) : Math.abs(num - expected) / Math.abs(expected)
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

/**
 * Pulls numbers out of text. For each numeric token it emits up to two
 * candidates: an integer reading (all separators removed) and, when the token
 * looks like it has a fractional part, a decimal reading. Being permissive
 * here just gives the comparison more chances to find the intended value.
 */
function extractNumbers(text: string): number[] {
  const matches = text.match(/\d[\d.,\s]*\d|\d/g) ?? []
  const numbers = new Set<number>()

  for (const raw of matches) {
    const token = raw.replace(/\s/g, "")

    // Integer reading: drop every separator.
    const asInteger = Number(token.replace(/[^\d]/g, ""))
    if (Number.isFinite(asInteger)) numbers.add(asInteger)

    // Decimal reading: treat the last separator as the decimal point when it
    // is followed by 1-2 digits (e.g. "5,79" -> 5.79, "1.234,5" -> 1234.5).
    const decimalMatch = token.match(/^[\d.,]*[.,](\d{1,2})$/)
    if (decimalMatch) {
      const lastSep = Math.max(token.lastIndexOf(","), token.lastIndexOf("."))
      const intPart = token.slice(0, lastSep).replace(/[^\d]/g, "")
      const fracPart = token.slice(lastSep + 1)
      const asDecimal = Number(`${intPart}.${fracPart}`)
      if (Number.isFinite(asDecimal)) numbers.add(asDecimal)
    }
  }

  return [...numbers]
}
