/**
 * Proportion, units and percent, for the Arányosság, százalékszámítás lesson.
 * No React, no DOM — everything here is pure, so it can be unit tested.
 *
 * Two habits keep the numbers honest. First, anything that scales by a power of
 * ten walks the decimal point of a *string* with `shiftPoint` instead of
 * multiplying a float, so 0,7 m² is exactly 7000 cm² and not 6999.999999999999.
 * Everything else rounds through `round`, and the tests pin the exact strings.
 * Second, every exercise answer of the lesson lives here as an exported
 * constant, so the tests hold the page to it.
 */

import { formatDecimal } from './numbers'
import { shiftPoint } from './powers'

/* ------------------------------------------------------------------ */
/* Numbers on screen                                                   */
/* ------------------------------------------------------------------ */

/** `x` with `digits` decimals kept, as a number. */
export function round(x: number, digits: number): number {
  return Number(x.toFixed(digits))
}

/** `1234567` → `1 234 567`, grouped with a thin space, minus sign typographic. */
export function groupThousands(n: number): string {
  const body = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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
/* 4. Units                                                            */
/* ------------------------------------------------------------------ */

export type UnitKind = 'length' | 'area' | 'volume' | 'time' | 'speed'

export interface UnitLadder {
  kind: UnitKind
  /** Smallest first. */
  units: readonly string[]
  /** `factors[i]` is how many `units[i]` make one `units[i + 1]`. */
  factors: readonly number[]
}

export const LADDERS: readonly UnitLadder[] = [
  { kind: 'length', units: ['mm', 'cm', 'dm', 'm', 'km'], factors: [10, 10, 10, 1000] },
  { kind: 'area', units: ['mm²', 'cm²', 'dm²', 'm²', 'ha', 'km²'], factors: [100, 100, 100, 10000, 100] },
  { kind: 'volume', units: ['ml', 'cl', 'dl', 'l', 'hl', 'm³'], factors: [10, 10, 10, 100, 10] },
  { kind: 'time', units: ['s', 'min', 'h', 'd'], factors: [60, 60, 24] },
  // Ordered by size like every other ladder: one m/s is 3,6 km/h, so m/s is
  // the larger unit and the 3,6 sits on the rung below it.
  { kind: 'speed', units: ['km/h', 'm/s'], factors: [3.6] },
]

export function ladder(kind: UnitKind): UnitLadder {
  return LADDERS.find((l) => l.kind === kind) ?? LADDERS[0]
}

/**
 * The rungs between two units, in walking order. Going down the ladder — to a
 * smaller unit — multiplies the number, going up divides it.
 */
export function conversionHops(
  kind: UnitKind,
  from: string,
  to: string
): { factor: number; multiply: boolean }[] {
  const { units, factors } = ladder(kind)
  const i = units.indexOf(from)
  const j = units.indexOf(to)
  if (i < 0 || j < 0) return []
  const hops: { factor: number; multiply: boolean }[] = []
  if (j < i) for (let k = i - 1; k >= j; k--) hops.push({ factor: factors[k], multiply: true })
  else for (let k = i; k < j; k++) hops.push({ factor: factors[k], multiply: false })
  return hops
}

/**
 * Convert a decimal string from one unit to another, and give a decimal string
 * back. Powers of ten move the decimal point instead of touching a float; the
 * 60s, the 24 and the 3,6 go through arithmetic and are rounded.
 */
export function convert(kind: UnitKind, value: string, from: string, to: string): string {
  const normal = value.trim().replace(/−/g, '-').replace(',', '.')
  const hops = conversionHops(kind, from, to)

  let places = 0
  let decimal = true
  for (const hop of hops) {
    const exponent = Math.log10(hop.factor)
    if (!Number.isInteger(exponent)) {
      decimal = false
      break
    }
    places += hop.multiply ? exponent : -exponent
  }
  if (decimal) return shiftPoint(normal, places)

  let out = Number(normal)
  if (!Number.isFinite(out)) return '0'
  for (const hop of hops) out = hop.multiply ? out * hop.factor : out / hop.factor
  return String(round(out, 4))
}

/** 72 km/h is 20 m/s. */
export const UNITS_ANSWER = '20'

/* ------------------------------------------------------------------ */
/* 5. Percent                                                          */
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
/* 6. Percentage change                                                */
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
/* 7. The household bill                                               */
/* ------------------------------------------------------------------ */

export interface Bill {
  kwh: number
  unitPrice: number
  fixedFee: number
  /** VAT in percent. */
  vat: number
}

/** The lines of the bill, each a whole number of forints. */
export function billLines(b: Bill): { energy: number; net: number; vatAmount: number; gross: number } {
  const energy = Math.round(b.kwh * b.unitPrice)
  const net = energy + b.fixedFee
  const vatAmount = Math.round((net * b.vat) / 100)
  return { energy, net, vatAmount, gross: net + vatAmount }
}

export const BILL_DEFAULT: Bill = { kwh: 210, unitPrice: 36, fixedFee: 1200, vat: 27 }

/** 150 kWh: (150 · 36 + 1200) · 1,27 = 8382 Ft. */
export const BILL_ANSWER = 8382

/* ------------------------------------------------------------------ */
/* 8. Interest and inflation                                           */
/* ------------------------------------------------------------------ */

/** The balance after 0, 1, … `years` years, each year's interest earning interest. */
export function compound(principal: number, rate: number, years: number): number[] {
  return Array.from({ length: years + 1 }, (_, n) => Math.round(principal * Math.pow(multiplier(rate), n)))
}

/** The balance if only the original amount ever earned interest. */
export function simpleInterest(principal: number, rate: number, years: number): number[] {
  return Array.from({ length: years + 1 }, (_, n) => Math.round(principal * (1 + (n * rate) / 100)))
}

/** What today's `amount` is still worth after 0, 1, … `years` years of inflation. */
export function purchasingPower(amount: number, inflation: number, years: number): number[] {
  return Array.from({ length: years + 1 }, (_, n) => Math.round(amount / Math.pow(multiplier(inflation), n)))
}

/** 200 000 Ft at 4% for two years: 200 000 · 1,04² = 216 320 Ft. */
export const INTEREST_ANSWER = 216320
