/**
 * Proportion and percent, for the Arányosság, százalékszámítás lesson.
 * No React, no DOM — everything here is pure, so it can be unit tested.
 *
 * Two habits keep the numbers honest. First, everything rounds through
 * `round` rather than trusting a float, so a price is a price and not
 * 6999.999999999999. Second, every exercise answer of the lesson lives here as
 * an exported constant, so the tests hold the page to it.
 */

import { formatDecimal } from './numbers'

/* ------------------------------------------------------------------ */
/* Numbers on screen                                                   */
/* ------------------------------------------------------------------ */

/** `x` with `digits` decimals kept, as a number. */
export function round(x: number, digits: number): number {
  return Number(x.toFixed(digits))
}

/** `1234567` → `1 234 567`, grouped with a narrow no-break space so a number never wraps mid-way, minus sign typographic. */
export function groupThousands(n: number): string {
  const body = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return n < 0 ? `−${body}` : body
}

/** A number for prose: at most two decimals, written with the reader's separator. */
export function plainNumber(x: number, sep: string): string {
  return formatDecimal(String(round(x, 2)), sep, false)
}

/* ------------------------------------------------------------------ */
/* 1. Direct proportion: y = k · x                                     */
/* ------------------------------------------------------------------ */

export interface DirectScenario {
  id: string
  /** The unit price, i.e. the constant of proportionality. */
  k: number
  xMax: number
  xStep: number
}

export const DIRECT_SCENARIOS: readonly DirectScenario[] = [
  { id: 'apples', k: 600, xMax: 10, xStep: 0.5 },
  { id: 'petrol', k: 620, xMax: 50, xStep: 1 },
  { id: 'wage', k: 2500, xMax: 40, xStep: 1 },
  { id: 'download', k: 25, xMax: 60, xStep: 1 },
]

export function directValue(k: number, x: number): number {
  return round(k * x, 2)
}

/** One row per x: the value, and the quotient that is the same in every row. */
export function directTable(
  k: number,
  xs: readonly number[]
): { x: number; y: number; ratio: number }[] {
  return xs.map((x) => {
    const y = directValue(k, x)
    return { x, y, ratio: x === 0 ? 0 : round(y / x, 4) }
  })
}

export interface Pair {
  x: number
  y: number
}

const EPS = 1e-9

/** True when every y : x is the same number, so the table is a direct proportion. */
export function isDirect(pairs: readonly Pair[]): boolean {
  if (pairs.length === 0 || pairs.some((p) => p.x === 0)) return false
  const first = pairs[0].y / pairs[0].x
  return pairs.every((p) => Math.abs(p.y / p.x - first) < EPS)
}

/** True when every x · y is the same number, so the table is an inverse proportion. */
export function isInverse(pairs: readonly Pair[]): boolean {
  if (pairs.length === 0) return false
  const first = pairs[0].x * pairs[0].y
  return pairs.every((p) => Math.abs(p.x * p.y - first) < EPS)
}

/**
 * Three tables, one of each kind a student meets: proportional, growing
 * together but not through zero, and inversely proportional.
 */
export const DIRECT_QUIZ: readonly { id: string; pairs: readonly Pair[] }[] = [
  {
    id: 'a',
    pairs: [
      { x: 2, y: 500 },
      { x: 4, y: 1000 },
      { x: 6, y: 1500 },
    ],
  },
  {
    id: 'b',
    pairs: [
      { x: 1, y: 10 },
      { x: 2, y: 15 },
      { x: 3, y: 20 },
    ],
  },
  {
    id: 'c',
    pairs: [
      { x: 2, y: 12 },
      { x: 3, y: 8 },
      { x: 4, y: 6 },
    ],
  },
]

export const DIRECT_ANSWER = 'a'

/* ------------------------------------------------------------------ */
/* 2. Inverse proportion: y = k / x                                    */
/* ------------------------------------------------------------------ */

export interface InverseScenario {
  id: string
  /** The constant product. */
  k: number
  xMin: number
  xMax: number
  xStep: number
}

export const INVERSE_SCENARIOS: readonly InverseScenario[] = [
  { id: 'pizza', k: 24, xMin: 1, xMax: 12, xStep: 1 },
  { id: 'trip', k: 240, xMin: 20, xMax: 120, xStep: 10 },
  { id: 'workers', k: 60, xMin: 1, xMax: 12, xStep: 1 },
]

export function inverseValue(k: number, x: number): number {
  return x === 0 ? 0 : round(k / x, 4)
}

/** 6 workers · 10 days = 60 worker-days, so 4 workers need 15 days. */
export const INVERSE_ANSWER = 15

/* ------------------------------------------------------------------ */
/* 3. The shapes: what a dependence looks like on a graph              */
/* ------------------------------------------------------------------ */

export type GraphKind = 'direct' | 'inverse' | 'linear' | 'square' | 'root'

export const GRAPH_KINDS: readonly GraphKind[] = ['direct', 'inverse', 'linear', 'square', 'root']

/** The x values a kind is drawn over. The inverse curve has no value at 0. */
export function graphXs(kind: GraphKind): number[] {
  const from = kind === 'inverse' ? 1 : 0
  const n = Math.round((8 - from) / 0.25) + 1
  return Array.from({ length: n }, (_, i) => round(from + i * 0.25, 2))
}

export function curve(kind: GraphKind, xs: readonly number[]): number[] {
  return xs.map((x) => {
    switch (kind) {
      case 'direct':
        return round(2 * x, 4)
      case 'inverse':
        return x === 0 ? 0 : round(12 / x, 4)
      case 'linear':
        return round(2 * x + 4, 4)
      case 'square':
        return round((x * x) / 2, 4)
      case 'root':
        return round(3 * Math.sqrt(x), 4)
    }
  })
}

/**
 * Everyday pairs to classify. `none` is the trap: two quantities may grow
 * together without any formula tying them.
 */
export const SITUATIONS: readonly { id: string; kind: GraphKind | 'none' }[] = [
  { id: 'apples', kind: 'direct' },
  { id: 'taxi', kind: 'linear' },
  { id: 'speedTime', kind: 'inverse' },
  { id: 'squareArea', kind: 'square' },
  { id: 'areaSide', kind: 'root' },
  { id: 'workersDays', kind: 'inverse' },
  { id: 'ageHeight', kind: 'none' },
  { id: 'phoneMonths', kind: 'direct' },
]

export const SITUATIONS_ANSWER = SITUATIONS.map((s) => s.kind).join('|')

/* ------------------------------------------------------------------ */
/* 4. Percent                                                          */
/* ------------------------------------------------------------------ */

/** The százalékérték: how much `rate` percent of `base` is. */
export function percentValue(base: number, rate: number): number {
  return round((base * rate) / 100, 2)
}

/** The százalékláb: what percent `value` is of `base`. */
export function percentRate(value: number, base: number): number {
  return base === 0 ? 0 : round((value / base) * 100, 2)
}

/** The százalékalap: the whole whose `rate` percent is `value`. */
export function percentBase(value: number, rate: number): number {
  return rate === 0 ? 0 : round(value / (rate / 100), 2)
}

/** 24 000 → 18 000 is 6000 off a 24 000 base, a 25% discount. */
export const PERCENT_ANSWER = 25

/* ------------------------------------------------------------------ */
/* 5. Percentage change                                                */
/* ------------------------------------------------------------------ */

/** The number one multiplies by: +20 → 1,2 and −20 → 0,8. */
export function multiplier(rate: number): number {
  return round(1 + rate / 100, 6)
}

/** One row per change: the multiplier it means and the value it leads to. */
export function applyChanges(
  start: number,
  rates: readonly number[]
): { rate: number; factor: number; value: number }[] {
  let value = start
  return rates.map((rate) => {
    const factor = multiplier(rate)
    value = round(value * factor, 2)
    return { rate, factor, value }
  })
}

/** What the whole chain of changes comes to, in percent: +20 then −20 is −4. */
export function totalChange(rates: readonly number[]): number {
  const factor = rates.reduce((acc, rate) => acc * multiplier(rate), 1)
  return round((factor - 1) * 100, 2)
}

/** 3% → 4% interest: one percentage point, but a third more interest. */
export const POINT_EXAMPLE = { from: 3, to: 4 }

/** 1,25 · 0,8 = 1, so the price is back at 100% of the original. */
export const CHANGE_ANSWER = 100

/* ------------------------------------------------------------------ */
/* 6. Compound interest                                                */
/* ------------------------------------------------------------------ */

/** The balance after 0, 1, … `years` years, each year's interest earning interest. */
export function compound(principal: number, rate: number, years: number): number[] {
  return Array.from({ length: years + 1 }, (_, n) => Math.round(principal * Math.pow(multiplier(rate), n)))
}

/** The balance if only the original amount ever earned interest. */
export function simpleInterest(principal: number, rate: number, years: number): number[] {
  return Array.from({ length: years + 1 }, (_, n) => Math.round(principal * (1 + (n * rate) / 100)))
}

/** 200 000 Ft at 4% for two years: 200 000 · 1,04² = 216 320 Ft. */
export const INTEREST_ANSWER = 216320
