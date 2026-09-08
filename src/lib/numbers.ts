/**
 * Number sets and the four basic operations, for the Számhalmazok, műveletek
 * lesson. No React, no DOM — everything here is pure so it can be unit tested.
 *
 * Two ideas shape the file. First, a decimal is handled as a *string* wherever
 * a digit has to be looked at: `2.675` is not exactly 2.675 in binary, so
 * `toFixed(2)` rounds it down to `2.67` while a pupil rounds it up to `2.68`.
 * Long division and rounding therefore never go through a float. Second, the
 * answer to every exercise of the lesson lives here as an exported constant, so
 * the tests pin it rather than the page.
 */

import { compile } from 'mathjs/number'

/* ------------------------------------------------------------------ */
/* Number sets                                                         */
/* ------------------------------------------------------------------ */

/** The narrowest of the four sets a number of the lesson can belong to. */
export type NumberClass = 'natural' | 'integer' | 'rational' | 'irrational'

/** Nesting order of the boxes drawn in the first section. */
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

export interface Expansion {
  /** Signed whole part, as digits: `"-2"`, `"0"`. */
  intPart: string
  /** Decimals before the period starts. */
  nonRepeating: string
  /** The repeating block, empty when the decimal stops. */
  repeating: string
  /** One long-division step each: the digit written down and what was left. */
  steps: { digit: number; remainder: number }[]
  /** Index in `steps` where the period begins, or null if there is none. */
  repeatStart: number | null
  /** True when `maxSteps` ran out before the division closed. */
  truncated: boolean
}

/**
 * Long division of p by q, remembering every remainder.
 *
 * A remainder is always one of 0, 1, …, q−1, so within q steps either it hits 0
 * or one of them comes back — and from there the digits repeat. That is the
 * whole reason every fraction has a terminating or repeating decimal form, and
 * `steps` is the evidence the lesson shows.
 */
export function decimalExpansion(p: number, q: number, maxSteps = 40): Expansion {
  const { p: rp, q: rq } = reduce(p, q)
  const negative = rp < 0
  const n = Math.abs(rp)
  const whole = Math.floor(n / rq)
  let rem = n % rq

  const seen = new Map<number, number>()
  const steps: { digit: number; remainder: number }[] = []
  let repeatStart: number | null = null
  let truncated = false

  while (rem !== 0) {
    const at = seen.get(rem)
    if (at !== undefined) {
      repeatStart = at
      break
    }
    if (steps.length >= maxSteps) {
      truncated = true
      break
    }
    seen.set(rem, steps.length)
    const carried = rem * 10
    steps.push({ digit: Math.floor(carried / rq), remainder: carried % rq })
    rem = carried % rq
  }

  const digits = steps.map((s) => String(s.digit)).join('')
  return {
    intPart: `${negative ? '-' : ''}${whole}`,
    nonRepeating: repeatStart === null ? digits : digits.slice(0, repeatStart),
    repeating: repeatStart === null ? '' : digits.slice(repeatStart),
    steps,
    repeatStart,
    truncated,
  }
}

/** `0{,}1\overline{6}` — the period wearing its overline. */
export function expansionToTex(e: Expansion, sep: string): string {
  if (e.nonRepeating === '' && e.repeating === '') return e.intPart
  const head = `${e.intPart}{${sep}}${e.nonRepeating}`
  return e.repeating === '' ? head : `${head}\\overline{${e.repeating}}`
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

/** The decimals offered as pills in the fraction section. */
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

/**
 * The simplest fraction that is exactly `x`, or null if no denominator up to
 * `maxDen` fits. Used to write a slider value as a fraction rather than 0,375.
 */
export function fractionOf(x: number, maxDen = 64): { p: number; q: number } | null {
  if (!Number.isFinite(x)) return null
  for (let q = 1; q <= maxDen; q++) {
    const p = x * q
    if (Math.abs(p - Math.round(p)) < 1e-9) return reduce(Math.round(p), q)
  }
  return null
}

/* ------------------------------------------------------------------ */
/* The number line                                                     */
/* ------------------------------------------------------------------ */

export interface LinePoint {
  id: string
  value: number
  tex: string
  /** Plain-text form for the SVG, which cannot hold KaTeX. Point, not comma. */
  plain: string
  kind: NumberClass
}

/** The chips sitting on the number line of section 4. */
export const LINE_POINTS: readonly LinePoint[] = [
  { id: 'm25', value: -2.5, tex: '-2.5', plain: '-2.5', kind: 'rational' },
  { id: 'm1', value: -1, tex: '-1', plain: '-1', kind: 'integer' },
  { id: 'zero', value: 0, tex: '0', plain: '0', kind: 'natural' },
  { id: 'third', value: 1 / 3, tex: '\\frac{1}{3}', plain: '1/3', kind: 'rational' },
  { id: 'half', value: 0.5, tex: '\\frac{1}{2}', plain: '1/2', kind: 'rational' },
  { id: 'one', value: 1, tex: '1', plain: '1', kind: 'natural' },
  { id: 'root2', value: Math.SQRT2, tex: '\\sqrt{2}', plain: '√2', kind: 'irrational' },
  { id: 'threeHalf', value: 1.5, tex: '\\frac{3}{2}', plain: '3/2', kind: 'rational' },
  { id: 'two', value: 2, tex: '2', plain: '2', kind: 'natural' },
  { id: 'three', value: 3, tex: '3', plain: '3', kind: 'natural' },
  { id: 'pi', value: Math.PI, tex: '\\pi', plain: 'π', kind: 'irrational' },
  { id: 'twentyTwoSevenths', value: 22 / 7, tex: '\\frac{22}{7}', plain: '22/7', kind: 'rational' },
]

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
  /** Plain-text form for the SVG. */
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
/* Opposite, reciprocal, absolute value                                */
/* ------------------------------------------------------------------ */

/** The number the same distance from 0 on the other side. */
export const opposite = (x: number): number => 0 - x

/** The number that multiplies x to 1. Zero has none. */
export const reciprocal = (x: number): number | null => (x === 0 ? null : 1 / x)

/** Distance of x from 0, so never negative. */
export const absValue = (x: number): number => Math.abs(x)

/** Distance of two numbers on the line, which is |a − b|. */
export const distance = (a: number, b: number): number => Math.abs(a - b)

/** The opposite of the reciprocal of −3/4 — the answer of that exercise. */
export const ABS_ANSWER = { p: 4, q: 3 }

/* ------------------------------------------------------------------ */
/* Estimating                                                          */
/* ------------------------------------------------------------------ */

/** Keep the leading `digits` digits and blank the rest: 398 → 400. */
export function roundSignificant(x: number, digits: number): number {
  if (x === 0 || !Number.isFinite(x)) return x
  const mag = Math.floor(Math.log10(Math.abs(x)))
  const f = 10 ** (digits - 1 - mag)
  return Math.round(x * f) / f
}

export interface EstimatePreset {
  id: string
  op: 'mul' | 'div'
  a: number
  b: number
}

/** The three calculations estimated before they are worked out. */
export const ESTIMATE_PRESETS: readonly EstimatePreset[] = [
  { id: 'e1', op: 'mul', a: 398, b: 51 },
  { id: 'e2', op: 'div', a: 2987, b: 6 },
  { id: 'e3', op: 'mul', a: 0.49, b: 81 },
]

/** The rounded factors, the estimate they give and the exact value. */
export function estimateOf(preset: EstimatePreset): {
  ra: number
  rb: number
  estimate: number
  exact: number
} {
  const ra = roundSignificant(preset.a, 1)
  const rb = roundSignificant(preset.b, 1)
  const apply = (x: number, y: number) => (preset.op === 'mul' ? x * y : x / y)
  return { ra, rb, estimate: apply(ra, rb), exact: apply(preset.a, preset.b) }
}

export interface Claim {
  id: string
  /** Plain decimal strings, so the page can write them with its own separator. */
  left: string
  op: 'mul' | 'div' | 'add' | 'square'
  right: string
  /** What the calculator supposedly said. */
  claimed: string
  /** Whether that result survives a rough estimate. */
  plausible: boolean
  /** What it really is. */
  exact: string
}

/** Five calculator results to judge without a calculator. */
export const CLAIMS: readonly Claim[] = [
  { id: 'c1', left: '47', op: 'mul', right: '81', claimed: '3807', plausible: true, exact: '3807' },
  { id: 'c2', left: '612', op: 'div', right: '3', claimed: '24', plausible: false, exact: '204' },
  { id: 'c3', left: '0.2', op: 'mul', right: '0.3', claimed: '0.6', plausible: false, exact: '0.06' },
  { id: 'c4', left: '1999', op: 'add', right: '2001', claimed: '4000', plausible: true, exact: '4000' },
  { id: 'c5', left: '25', op: 'square', right: '2', claimed: '425', plausible: false, exact: '625' },
]

/** What a claim really comes to, so the pinned `exact` can be checked. */
export function claimValue(c: Claim): number {
  const a = Number(c.left)
  const b = Number(c.right)
  if (c.op === 'mul') return a * b
  if (c.op === 'div') return a / b
  if (c.op === 'add') return a + b
  return a ** b
}

/** The five verdicts in order, as one comparable string. */
export const CLAIMS_ANSWER = CLAIMS.map((c) => (c.plausible ? 'ok' : 'bad')).join('|')

/* ------------------------------------------------------------------ */
/* Reaching a target number                                            */
/* ------------------------------------------------------------------ */

const OPERATOR_MAP: Record<string, string> = {
  '·': '*',
  '×': '*',
  '÷': '/',
  ':': '/',
  '−': '-',
  '–': '-',
  '[': '(',
  ']': ')',
}

/** Digits, the four operations however they are typed, brackets and spaces. */
const ALLOWED = /^[\d+\-−–*·×/÷:()[\]\s]*$/

/**
 * Work out what the student typed, in the notation a Hungarian pupil writes:
 * `·` for times and `:` for divided by. Returns null when it does not parse or
 * the result is not a finite number (division by zero, for instance).
 */
export function evaluateExpression(expr: string): number | null {
  const normalised = [...expr].map((ch) => OPERATOR_MAP[ch] ?? ch).join('')
  if (normalised.trim() === '') return null
  try {
    const value: unknown = compile(normalised).evaluate({})
    return typeof value === 'number' && Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

/** The digits appearing in an expression, sorted: `"4 · (3 − 1) + 2"` → `1234`. */
export function usedDigits(expr: string): string {
  return [...expr].filter((ch) => ch >= '0' && ch <= '9').sort().join('')
}

/** Each of these digits has to be used exactly once. */
export const TARGET_DIGITS = '1234'

/** Targets that can all be hit with 1, 2, 3, 4 and the four operations. */
export const TARGETS: readonly number[] = [24, 10, 36, 1]

/** Whether an attempt at a target number is legal, and whether it lands. */
export function checkTargetExpression(
  expr: string,
  target: number,
): { value: number | null; digitsOk: boolean; hit: boolean; charsOk: boolean } {
  const charsOk = ALLOWED.test(expr)
  const digitsOk = usedDigits(expr) === TARGET_DIGITS
  const value = charsOk ? evaluateExpression(expr) : null
  return { value, digitsOk, hit: digitsOk && value !== null && Math.abs(value - target) < 1e-9, charsOk }
}

/* ------------------------------------------------------------------ */
/* Rounding and measuring                                              */
/* ------------------------------------------------------------------ */

const stripLeadingZeros = (s: string): string => s.replace(/^0+(?=\d)/, '')

/**
 * Round a decimal *string* to a given place. Positive `decimals` counts places
 * after the point, negative ones before it: −2 rounds to hundreds.
 *
 * Digits are compared and carried by hand, never through a float, so 2,675
 * rounds to 2,68 at two decimals — which is what a pupil gets on paper, while
 * `(2.675).toFixed(2)` answers 2.67 because the stored number is a hair below.
 */
export function roundAt(s: string, decimals: number): { result: string; deciding: string; up: boolean } {
  const trimmed = s.trim()
  const negative = trimmed.startsWith('-')
  const [rawInt = '0', rawFrac = ''] = trimmed.replace(/^[-+]/, '').split('.')

  // Pad both ends so the cut always lands inside the digit string.
  const intPart = '0'.repeat(Math.max(0, 1 - decimals - rawInt.length)) + (rawInt || '0')
  const fracPart = rawFrac + '0'.repeat(Math.max(0, decimals + 1 - rawFrac.length))

  const all = intPart + fracPart
  const cut = intPart.length + decimals
  const deciding = all[cut] ?? '0'
  const up = Number(deciding) >= 5

  const digits = all.slice(0, cut).split('')
  if (up) {
    let i = digits.length - 1
    for (;;) {
      if (i < 0) {
        digits.unshift('1')
        break
      }
      if (digits[i] === '9') {
        digits[i] = '0'
        i--
      } else {
        digits[i] = String(Number(digits[i]) + 1)
        break
      }
    }
  }

  let result: string
  if (decimals > 0) {
    const padded = digits.join('').padStart(decimals + 1, '0')
    result = `${stripLeadingZeros(padded.slice(0, padded.length - decimals))}.${padded.slice(padded.length - decimals)}`
  } else {
    result = stripLeadingZeros(digits.join('') + '0'.repeat(-decimals)) || '0'
  }
  const zero = Number(result) === 0
  return { result: negative && !zero ? `-${result}` : result, deciding, up }
}

/** How much the rounded value differs from the original, sign and all. */
export function roundingError(s: string, decimals: number): number {
  const diff = Number(roundAt(s, decimals).result) - Number(s)
  return Number(diff.toPrecision(12))
}

export interface RoundPreset {
  id: string
  /** A plain decimal string; never a float, so no digit is lost on the way in. */
  value: string
  /** Optional unit key suffix, e.g. `km`. */
  unit?: string
}

/** The numbers offered for rounding practice. */
export const ROUND_PRESETS: readonly RoundPreset[] = [
  { id: 'pi', value: '3.14159' },
  { id: 'e', value: '2.71828' },
  { id: 'mixed', value: '1234.5678' },
  { id: 'small', value: '0.04567' },
  { id: 'sun', value: '149597870.7', unit: 'km' },
]

/** 3,14159 rounded to thousandths — the answer of the rounding exercise. */
export const ROUND_ANSWER = 3.142

/** Sides of the classroom floor measured in the last section, in metres. */
export const ROOM = { length: 7.43, width: 5.86 }

/** Measuring errors offered, in metres: 1 mm, 5 mm, 1 cm. */
export const ROOM_ERRORS: readonly number[] = [0.001, 0.005, 0.01]

/**
 * How small and how large the area can really be when each side was measured to
 * within ±`err`. The error does not stay put: it grows with the sides.
 */
export function areaBounds(l: number, w: number, err: number): { min: number; max: number; nominal: number } {
  return { min: (l - err) * (w - err), max: (l + err) * (w + err), nominal: l * w }
}

/**
 * The leading characters two decimal strings share — the digits of the area
 * that the measurement actually settles. A trailing decimal point is dropped,
 * since "43." says no more than "43".
 *
 * Both strings are assumed to have whole parts of the same length, which is the
 * case for the bounds of one measurement.
 */
export function agreeingPrefix(a: string, b: string): string {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return a.slice(0, i).replace(/\.$/, '')
}

/** 47 · 99 worked out with the distributive law — the answer of section 2. */
export const LAWS_ANSWER = 47 * 99
