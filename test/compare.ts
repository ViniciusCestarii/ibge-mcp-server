export interface ComparisonResult {
  passed: boolean
  foundNumbers: number[]
  closest: number | null
  relativeError: number | null
}

export function compareNumber(
  answer: string,
  expected: number,
): ComparisonResult {
  const foundNumbers = extractNumbers(answer)

  let closest: number | null = null
  let relativeError: number | null = null

  for (const num of foundNumbers) {
    const error =
      expected === 0
        ? Math.abs(num)
        : Math.abs(num - expected) / Math.abs(expected)
    if (relativeError === null || error < relativeError) {
      relativeError = error
      closest = num
    }
  }

  return {
    passed: relativeError === 0,
    foundNumbers,
    closest,
    relativeError,
  }
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/\d[\d.,\s]*\d|\d/g) ?? []
  const numbers = new Set<number>()

  for (const raw of matches) {
    const token = raw.replace(/\s/g, "")

    const asInteger = Number(token.replace(/[^\d]/g, ""))
    if (Number.isFinite(asInteger)) numbers.add(asInteger)

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
