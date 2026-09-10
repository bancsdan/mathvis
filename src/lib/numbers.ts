/**
 * Number sets, fractions, the number line, intervals and absolute value, for
 * the Számhalmazok lesson. No React, no DOM — everything here is pure so it can
 * be unit tested.
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
/* Number sets                                                         */
/* ------------------------------------------------------------------ */

/** The narrowest of the four sets a number of the lesson can belong to. */
export type NumberClass = 'natural' | 'integer' | 'rational' | 'irrational'

/** Nesting order of the boxes drawn in the first explorer. */
export const CLASS_ORDER = ['natural', 'integer', 'rational', 'irrational'] as const

/** How each set is written in maths. Symbols only, so it needs no translation. */
export const CLASS_TEX: Record<NumberClass, string> = {
  natural: '\\mathbb{N}',
  integer: '\\mathbb{Z}',
  rational: '\\mathbb{Q}',
  irrational: '\\mathbb{R} \\setminus \\mathbb{Q}',
}

/**
 * Is a number whose narrowest set is `cls` also a member of `set`?
 *
 * ℕ ⊂ ℤ ⊂ ℚ, and the irrationals are the part of ℝ outside ℚ, so they share no
 * member with any of the other three.
 */
export function belongsTo(cls: NumberClass, set: NumberClass): boolean {
  if (cls === 'irrational' || set === 'irrational') return cls === set
  return CLASS_ORDER.indexOf(cls) <= CLASS_ORDER.indexOf(set)
}

export interface SampleNumber {
  id: string
  /** LaTeX, symbols only. Decimals carry `{,}` through `formatDecimal`. */
  tex: string
  value: number
  /** The narrowest set the number belongs to. */
  cls: NumberClass
}

/**
 * The numbers dropped into the nested boxes. `7/1` is the trap: written as a
 * fraction, but it is the natural number 7.
 */
export const SAMPLE_NUMBERS: readonly SampleNumber[] = [
  { id: 'five', tex: '5', value: 5, cls: 'natural' },
  { id: 'zero', tex: '0', value: 0, cls: 'natural' },
  { id: 'twelve', tex: '12', value: 12, cls: 'natural' },
  { id: 'sevenOverOne', tex: '\\frac{7}{1}', value: 7, cls: 'natural' },
  { id: 'minusThree', tex: '-3', value: -3, cls: 'integer' },
  { id: 'minusHundred', tex: '-100', value: -100, cls: 'integer' },
  { id: 'half', tex: '\\frac{1}{2}', value: 0.5, cls: 'rational' },
  { id: 'threeQuarters', tex: '0.75', value: 0.75, cls: 'rational' },
  { id: 'minusTwoHalf', tex: '-2.5', value: -2.5, cls: 'rational' },
  { id: 'root2', tex: '\\sqrt{2}', value: Math.SQRT2, cls: 'irrational' },
  { id: 'pi', tex: '\\pi', value: Math.PI, cls: 'irrational' },
  { id: 'made', tex: '0.101001000\\ldots', value: 0.101001, cls: 'irrational' },
]

export interface QuizNumber {
  id: string
  tex: string
  /** The narrowest set, which is what the exercise asks for. */
  cls: NumberClass
}

/** √9 is the trap: it is 3, so the narrowest set is ℕ, not the irrationals. */
export const TOWER_QUIZ: readonly QuizNumber[] = [
  { id: 'q1', tex: '-4', cls: 'integer' },
  { id: 'q2', tex: '0.6', cls: 'rational' },
  { id: 'q3', tex: '\\sqrt{5}', cls: 'irrational' },
  { id: 'q4', tex: '\\sqrt{9}', cls: 'natural' },
  { id: 'q5', tex: '-\\frac{7}{2}', cls: 'rational' },
]

/** The five choices of `TOWER_QUIZ`, in order, as one comparable string. */
export const TOWER_ANSWER = TOWER_QUIZ.map((q) => q.cls).join('|')

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
  kind: NumberClass
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

/* ------------------------------------------------------------------ */
/* Intervals                                                           */
/* ------------------------------------------------------------------ */

/**
 * Interval notation, which is not the same everywhere: Hungarian textbooks
 * turn the bracket outwards at an open end, `]a; b[`, while English ones use a
 * round bracket, `(a, b)`.
 *
 * `format` decides how a bound is written, so the same function serves prose
 * (`−1,5`) and KaTeX (`-1{,}5`).
 */
export function intervalNotation(
  a: number,
  b: number,
  leftClosed: boolean,
  rightClosed: boolean,
  style: 'hu' | 'en',
  format: (v: number) => string = String,
): string {
  const left = leftClosed ? '[' : style === 'hu' ? ']' : '('
  const right = rightClosed ? ']' : style === 'hu' ? '[' : ')'
  const sep = style === 'hu' ? '; ' : ', '
  return `${left}${format(a)}${sep}${format(b)}${right}`
}

/** Is x inside? A closed end takes its bound with it, an open one does not. */
export function intervalContains(
  a: number,
  b: number,
  leftClosed: boolean,
  rightClosed: boolean,
  x: number,
): boolean {
  const okLeft = leftClosed ? x >= a : x > a
  const okRight = rightClosed ? x <= b : x < b
  return okLeft && okRight
}

/** The same interval as a condition on x: `-1 < x \le 3`. Symbols only. */
export function intervalSetBuilder(
  a: number,
  b: number,
  leftClosed: boolean,
  rightClosed: boolean,
  format: (v: number) => string = String,
): string {
  return `${format(a)} ${leftClosed ? '\\le' : '<'} x ${rightClosed ? '\\le' : '<'} ${format(b)}`
}

/** The interval the exercise describes: −1 < x ≤ 3. */
export const INTERVAL_QUIZ = { a: -1, b: 3, leftClosed: false, rightClosed: true }

/** The four ways to close the two ends, offered as answers. */
export const INTERVAL_OPTIONS: readonly { id: string; leftClosed: boolean; rightClosed: boolean }[] = [
  { id: 'oo', leftClosed: false, rightClosed: false },
  { id: 'oc', leftClosed: false, rightClosed: true },
  { id: 'co', leftClosed: true, rightClosed: false },
  { id: 'cc', leftClosed: true, rightClosed: true },
]

/** Id of the option that matches `INTERVAL_QUIZ`. */
export const INTERVAL_ANSWER = 'oc'

/* ------------------------------------------------------------------ */
/* Opposite and absolute value                                         */
/* ------------------------------------------------------------------ */

/** The number the same distance from 0 on the other side. */
export const opposite = (x: number): number => 0 - x

/** Distance of x from 0, so never negative. */
export const absValue = (x: number): number => Math.abs(x)

/** Distance of two numbers on the line, which is |a − b|. */
export const distance = (a: number, b: number): number => Math.abs(a - b)

/** The two numbers whose distance the absolute value exercise asks for. */
export const ABS_QUIZ = { a: -7, b: 3 }

/** |−7 − 3| = 10 — the answer of that exercise. */
export const ABS_ANSWER = distance(ABS_QUIZ.a, ABS_QUIZ.b)
