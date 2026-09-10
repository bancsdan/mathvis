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
/* 1. Inverse proportion: y = k / x                                    */
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
/* 2. The shapes: what a dependence looks like on a graph              */
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
/* 3. Percent                                                          */
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
/* 4. Percentage change                                                */
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
/* 5. Compound interest                                                */
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
