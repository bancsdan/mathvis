/**
 * Fractions and the number line, for the Számhalmazok lesson. No React, no
 * DOM — everything here is pure so it can be unit tested.
 *
 * Two ideas shape the file. First, a decimal is handled as a *string* wherever
 * a digit has to be looked at: `0.1` is not exactly 0.1 in binary, so the
 * digits of a number are cut out of a string rather than computed from a float.
 * Second, the answer to every exercise of the lesson lives here as an exported
 * constant, so the tests pin it rather than the page.
 *
 * `formatDecimal`, `texSeparator`, `parseDecimal`, `gcd`, `reduce` and
 * `isTerminating` are the shared helpers other lessons import; the rest
 * belongs to this one.
 */

/* ------------------------------------------------------------------ */
/* Writing numbers down                                                */
/* ------------------------------------------------------------------ */

/**
 * Swap the decimal point of a plain `"-2.5"` string for the separator of the
 * reader's language.
 *
 * KaTeX puts a comma's spacing after `,`, which looks wrong inside a number, so
 * in `tex` mode the separator is wrapped in braces: `2{,}5`. In prose the ASCII
 * hyphen becomes a real minus sign, the way the rest of the site writes it.
 */
export function formatDecimal(str: string, sep: string, tex: boolean): string {
  const body = str.replace('.', tex ? `{${sep}}` : sep)
  return tex ? body : body.replace(/^-/, '−')
}

/**
 * Swap the decimal points inside a LaTeX string for the reader's separator.
 *
 * Data such as `SAMPLE_NUMBERS` stores its tex with a plain point, so nothing in
 * the library is tied to one language; the page runs it through here.
 */
export const texSeparator = (tex: string, sep: string): string =>
  tex.replace(/(\d)\.(\d)/g, `$1{${sep}}$2`)

/** Read a decimal a student typed. Accepts a comma or a point, nothing else. */
export function parseDecimal(s: string): number | null {
  const trimmed = s.trim().replace(/−/g, '-')
  if (!/^[-+]?(\d+([.,]\d*)?|[.,]\d+)$/.test(trimmed)) return null
  const value = Number(trimmed.replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

/* ------------------------------------------------------------------ */
/* Fractions                                                           */
/* ------------------------------------------------------------------ */

/** Greatest common divisor, Euclid's way. `gcd(0, 0)` is 0. */
export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

/** The fraction in lowest terms, with the sign carried by the numerator. */
export function reduce(p: number, q: number): { p: number; q: number } {
  if (q === 0) return { p, q: 0 }
  const sign = q < 0 ? -1 : 1
  const d = gcd(p, q) || 1
  return { p: (sign * p) / d, q: (sign * q) / d }
}

/**
 * Does the decimal form stop? It does exactly when the reduced denominator is
 * built from 2s and 5s only — the primes 10 is built from.
 */
export function isTerminating(p: number, q: number): boolean {
  const { q: den } = reduce(p, q)
  if (den === 0) return false
  let rest = den
  while (rest % 2 === 0) rest /= 2
  while (rest % 5 === 0) rest /= 5
  return rest === 1
}

export interface FractionSteps {
  /** Multiplier that shifts the point to the start of the period. */
  mult1: number
  /** Multiplier that shifts it to the end of the period. */
  mult2: number
  /**
   * What x is multiplied by once the right-hand side is a whole number:
   * `mult2 − mult1` for a repeating decimal, plain `mult2` for one that stops.
   */
  diff: number
  p: number
  q: number
  reducedP: number
  reducedQ: number
}

/**
 * Turn a decimal back into a fraction the way it is done on paper.
 *
 * For 0,(36): 100x = 36,(36) and x = 0,(36), so 99x = 36 and x = 36/99 = 4/11.
 * A decimal that stops needs no subtraction at all: 0,75 is simply 75/100.
 */
export function repeatingToFraction(intPart: string, nonRepeating: string, repeating: string): FractionSteps {
  const negative = intPart.trim().startsWith('-')
  const whole = intPart.replace('-', '')
  const n = nonRepeating.length
  const r = repeating.length
  const mult1 = 10 ** n
  const mult2 = 10 ** (n + r)

  const shifted = Number(whole + nonRepeating)
  const raw = r === 0 ? { p: shifted, q: mult2, diff: mult2 } : {
    p: Number(whole + nonRepeating + repeating) - shifted,
    q: mult2 - mult1,
    diff: mult2 - mult1,
  }

  const p = negative ? -raw.p : raw.p
  const reduced = reduce(p, raw.q)
  return { mult1, mult2, diff: raw.diff, p, q: raw.q, reducedP: reduced.p, reducedQ: reduced.q }
}

export interface DecimalPreset {
  id: string
  intPart: string
  nonRepeating: string
  repeating: string
}

/** The decimals offered as pills in the fraction explorer. */
export const DECIMAL_PRESETS: readonly DecimalPreset[] = [
  { id: 'p075', intPart: '0', nonRepeating: '75', repeating: '' },
  { id: 'p0125', intPart: '0', nonRepeating: '125', repeating: '' },
  { id: 'p24', intPart: '2', nonRepeating: '4', repeating: '' },
  { id: 'p3', intPart: '0', nonRepeating: '', repeating: '3' },
  { id: 'p16', intPart: '0', nonRepeating: '1', repeating: '6' },
  { id: 'p27', intPart: '0', nonRepeating: '', repeating: '27' },
  { id: 'p36', intPart: '0', nonRepeating: '', repeating: '36' },
]

/** 0,(36) = 4/11 — the answer of the fraction exercise. */
export const FRACTION_ANSWER = { p: 4, q: 11 }

/* ------------------------------------------------------------------ */
/* The number line                                                     */
/* ------------------------------------------------------------------ */

/**
 * The decimals of a non-negative number, cut rather than rounded.
 *
 * `toFixed` is asked for a few digits more than needed and the extra ones are
 * thrown away, so the last digit returned is the digit that is really there.
 */
export function digitsOf(x: number, count: number): string {
  if (count <= 0) return ''
  const slack = Math.min(count + 4, 15)
  const frac = Math.abs(x).toFixed(slack).split('.')[1] ?? ''
  return frac.slice(0, count).padEnd(count, '0')
}

/**
 * The nested intervals that trap `x`: [1; 2], then [1,4; 1,5], then …
 *
 * Level k is the interval of width 10^−k containing x, and `digit` is which of
 * its ten equal parts x falls into — that digit is the next decimal of x.
 */
export function nestedIntervals(x: number, levels: number): { lo: number; hi: number; digit: number }[] {
  const whole = Math.floor(x)
  const digits = digitsOf(x, levels + 1)
  const out: { lo: number; hi: number; digit: number }[] = []
  for (let k = 0; k <= levels; k++) {
    const scale = 10 ** k
    const lo = (whole * scale + Number(digits.slice(0, k) || '0')) / scale
    out.push({ lo, hi: lo + 1 / scale, digit: Number(digits[k]) })
  }
  return out
}

export interface ZoomTarget {
  id: string
  tex: string
  /** Plain-text form for the SVG, which cannot hold KaTeX. */
  plain: string
  value: number
  /** Whether its decimals settle into a repeating pattern or never do. */
  kind: 'rational' | 'irrational'
}

/** Two numbers whose decimals settle into a pattern and two that never do. */
export const ZOOM_TARGETS: readonly ZoomTarget[] = [
  { id: 'root2', tex: '\\sqrt{2}', plain: '√2', value: Math.SQRT2, kind: 'irrational' },
  { id: 'pi', tex: '\\pi', plain: 'π', value: Math.PI, kind: 'irrational' },
  { id: 'third', tex: '\\frac{1}{3}', plain: '1/3', value: 1 / 3, kind: 'rational' },
  { id: 'twentyTwoSevenths', tex: '\\frac{22}{7}', plain: '22/7', value: 22 / 7, kind: 'rational' },
]

/** √10 is between 3,1 and 3,2 — the answer of the number-line exercise. */
export const ROOT10_LOWER = 3.1
