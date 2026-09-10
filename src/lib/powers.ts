/**
 * Powers and roots, for the Hatvány, gyök lesson. No React, no DOM — everything
 * here is pure so it can be unit tested.
 *
 * Two ideas shape the file. First, normal form is handled on the *digits* of a
 * number rather than on its float: `0.00052` is not exactly 0.00052 in binary,
 * so walking the decimal point with arithmetic would turn a mantissa into
 * `5.199999999`. `shiftPoint` therefore moves a character, not a value. Second, the answer to every exercise of the lesson lives here as
 * an exported constant, so the tests pin it rather than the page.
 */

import { formatDecimal } from './numbers'

/* ------------------------------------------------------------------ */
/* 1. Powers with a positive integer exponent                          */
/* ------------------------------------------------------------------ */

/**
 * `base` multiplied by itself `exp` times, by repeated multiplication.
 *
 * `Math.pow` goes through a logarithm and can miss an integer by a hair
 * (`Math.pow(5, 3)` is fine, but the pattern is not safe in general); the
 * lesson shows the factors one by one anyway, so it multiplies them one by one.
 */
export function intPower(base: number, exp: number): number {
  if (exp < 0 || !Number.isInteger(exp)) throw new Error('intPower needs a non-negative integer exponent')
  let out = 1
  for (let i = 0; i < exp; i++) out *= base
  return out
}

/** The factors of a power, one entry per chip: `factorList('2', 3)` is `['2','2','2']`. */
export function factorList(baseTex: string, exp: number): string[] {
  return Array.from({ length: Math.max(0, exp) }, () => baseTex)
}

/**
 * A base the first section can be explored with.
 *
 * `num`/`den` carry the base as a fraction so the value of a power can be
 * written exactly (`(1/2)^5 = 1/32`, never `0.03125`), and `paren` says whether
 * the base needs brackets before an exponent can be hung on it.
 */
export interface PowerBase {
  id: string
  num: number
  den: number
  value: number
  tex: string
  paren: boolean
}

export const BASES: readonly PowerBase[] = [
  { id: 'two', num: 2, den: 1, value: 2, tex: '2', paren: false },
  { id: 'three', num: 3, den: 1, value: 3, tex: '3', paren: false },
  { id: 'five', num: 5, den: 1, value: 5, tex: '5', paren: false },
  { id: 'ten', num: 10, den: 1, value: 10, tex: '10', paren: false },
  { id: 'minusTwo', num: -2, den: 1, value: -2, tex: '-2', paren: true },
  { id: 'half', num: 1, den: 2, value: 0.5, tex: '\\frac{1}{2}', paren: true },
]

/** `2^5` with the brackets the base needs: `\left(\frac{1}{2}\right)^{5}`. */
export function basePowerTex(base: PowerBase, exp: number): string {
  const body = base.paren ? `\\left(${base.tex}\\right)` : base.tex
  return `${body}^{${exp}}`
}

/** The exact value of `base^exp`, as a fraction when the base is one. */
export function baseValueTex(base: PowerBase, exp: number): string {
  const top = intPower(base.num, exp)
  const bottom = intPower(base.den, exp)
  return bottom === 1 ? String(top) : `\\frac{${top}}{${bottom}}`
}

/** `(-2)^4 = 16` but `-2^4 = -16`: the bracket is the whole difference. */
export const DEF_ANSWER = { paren: 16, bare: -16 }

/* ------------------------------------------------------------------ */
/* Paper folding: doubling looks harmless and runs away fast           */
/* ------------------------------------------------------------------ */

/** Thickness of one sheet of paper, in millimetres. */
export const SHEET_MM = 0.1

/** Layers after `folds` folds: every fold doubles them. */
export function foldLayers(folds: number): number {
  return intPower(2, folds)
}

/** Thickness of the folded stack, in millimetres. */
export function foldThicknessMm(folds: number): number {
  return SHEET_MM * foldLayers(folds)
}

export type LengthUnit = 'mm' | 'cm' | 'm' | 'km'

const UNIT_MM: Array<{ unit: LengthUnit; mm: number }> = [
  { unit: 'mm', mm: 1 },
  { unit: 'cm', mm: 10 },
  { unit: 'm', mm: 1000 },
  { unit: 'km', mm: 1000000 },
]

/**
 * A length in the unit a person would say it in: the largest unit that still
 * leaves at least 1 of them. Rounded to one decimal, which is two significant
 * figures below 10 — enough to compare, not enough to pretend to be exact.
 */
export function humanLength(mm: number): { value: number; unit: LengthUnit } {
  let picked = UNIT_MM[0]
  for (const step of UNIT_MM) if (mm >= step.mm) picked = step
  return { value: Math.round((mm / picked.mm) * 10) / 10, unit: picked.unit }
}

/**
 * Fold counts worth stopping at, each with the everyday thing the stack has
 * just grown past. The card shows the last milestone at or below the current
 * fold count, next to the exact figure.
 */
export const FOLD_MILESTONES: readonly { folds: number; compareKey: string }[] = [
  { folds: 7, compareKey: 'pow.foldCmp7' },
  { folds: 10, compareKey: 'pow.foldCmp10' },
  { folds: 14, compareKey: 'pow.foldCmp14' },
  { folds: 20, compareKey: 'pow.foldCmp20' },
  { folds: 23, compareKey: 'pow.foldCmp23' },
  { folds: 30, compareKey: 'pow.foldCmp30' },
  { folds: 42, compareKey: 'pow.foldCmp42' },
]

/** The last milestone at or below `folds`, or null before the first one. */
export function milestoneAt(folds: number): { folds: number; compareKey: string } | null {
  let out: { folds: number; compareKey: string } | null = null
  for (const m of FOLD_MILESTONES) if (m.folds <= folds) out = m
  return out
}

/** Britney Gallivan, 2002: twelve folds of a 1,2 km long strip of paper. */
export const FOLD_RECORD = { folds: 12, year: 2002, lengthKm: 1.2 }

/* ------------------------------------------------------------------ */
/* 2. Zero and negative exponents                                      */
/* ------------------------------------------------------------------ */

export const LADDER_BASES: readonly number[] = [2, 3, 5, 10]

/** A fraction in lowest terms. `q` is always positive; the sign lives in `p`. */
export interface Fraction {
  p: number
  q: number
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const r = x % y
    x = y
    y = r
  }
  return x
}

/** The exact value of `base^exp` as a fraction. `2^-3` is 1/8, `10^-2` is 1/100. */
export function powerFraction(base: number, exp: number): Fraction {
  if (!Number.isInteger(base) || !Number.isInteger(exp)) throw new Error('powerFraction needs integers')
  if (base === 0 && exp <= 0) throw new Error('0^0 and 0^-n are not defined')
  const magnitude = intPower(Math.abs(base), Math.abs(exp))
  const negative = base < 0 && Math.abs(exp) % 2 === 1
  const p = negative ? -magnitude : magnitude
  const raw: Fraction = exp >= 0 ? { p, q: 1 } : { p: negative ? -1 : 1, q: magnitude }
  const d = gcd(raw.p, raw.q) || 1
  return { p: raw.p / d, q: raw.q / d }
}

/** The exponent ladder from `top` down to `bottom`, one row per exponent. */
export function ladder(base: number, top: number, bottom: number): { exp: number; value: Fraction }[] {
  const rows: { exp: number; value: Fraction }[] = []
  for (let exp = top; exp >= bottom; exp--) rows.push({ exp, value: powerFraction(base, exp) })
  return rows
}

/** `5^{-2}` is 1/25. */
export const NEG_ANSWER: Fraction = { p: 1, q: 25 }

/* ------------------------------------------------------------------ */
/* 3. The laws of powers                                               */
/* ------------------------------------------------------------------ */

export type LawId = 'product' | 'quotient' | 'power' | 'productBase' | 'quotientBase'

export const LAW_IDS: readonly LawId[] = ['product', 'quotient', 'power', 'productBase', 'quotientBase']

/** Each law in its general form, letters only, so it needs no translation. */
export const LAW_TEX: Record<LawId, string> = {
  product: 'a^m \\cdot a^n = a^{m+n}',
  quotient: '\\frac{a^m}{a^n} = a^{m-n}',
  power: '\\left(a^m\\right)^n = a^{m \\cdot n}',
  productBase: '(a \\cdot b)^n = a^n \\cdot b^n',
  quotientBase: '\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}',
}

export interface LawInstance {
  /** The law written out with the chosen numbers, before simplifying. */
  leftTex: string
  /** The same thing as a single power. */
  rightTex: string
  /** What both sides come to. */
  value: number
  /** Factor groups for the chip picture, in reading order. */
  groups: { label: string; count: number }[]
  /** How many factors cancel between the two groups (quotient only). */
  cancel: number
  /** The exponent of the answer. */
  resultExponent: number
}

/**
 * One law, filled in with concrete numbers.
 *
 * `base2` is the second base of `productBase` / `quotientBase`; those two laws
 * use `n` as the exponent and ignore `m`. `quotient` needs `m > n`, so the
 * caller clamps the sliders before asking.
 */
export function lawInstance(id: LawId, base: number, m: number, n: number, base2 = 3): LawInstance {
  const a = String(base)
  const b = String(base2)
  switch (id) {
    case 'product':
      return {
        leftTex: `${a}^{${m}} \\cdot ${a}^{${n}}`,
        rightTex: `${a}^{${m + n}}`,
        value: intPower(base, m + n),
        groups: [
          { label: a, count: m },
          { label: a, count: n },
        ],
        cancel: 0,
        resultExponent: m + n,
      }
    case 'quotient':
      return {
        leftTex: `\\frac{${a}^{${m}}}{${a}^{${n}}}`,
        rightTex: `${a}^{${m - n}}`,
        value: intPower(base, m - n),
        groups: [
          { label: a, count: m },
          { label: a, count: n },
        ],
        cancel: Math.min(m, n),
        resultExponent: m - n,
      }
    case 'power':
      return {
        leftTex: `\\left(${a}^{${m}}\\right)^{${n}}`,
        rightTex: `${a}^{${m * n}}`,
        value: intPower(base, m * n),
        groups: Array.from({ length: n }, () => ({ label: a, count: m })),
        cancel: 0,
        resultExponent: m * n,
      }
    case 'productBase':
      return {
        leftTex: `(${a} \\cdot ${b})^{${n}}`,
        rightTex: `${a}^{${n}} \\cdot ${b}^{${n}}`,
        value: intPower(base * base2, n),
        groups: [
          { label: a, count: n },
          { label: b, count: n },
        ],
        cancel: 0,
        resultExponent: n,
      }
    case 'quotientBase':
      return {
        leftTex: `\\left(\\frac{${a}}{${b}}\\right)^{${n}}`,
        rightTex: `\\frac{${a}^{${n}}}{${b}^{${n}}}`,
        value: intPower(base, n) / intPower(base2, n),
        groups: [
          { label: a, count: n },
          { label: b, count: n },
        ],
        cancel: 0,
        resultExponent: n,
      }
  }
}

/** `(3^2)^3 \cdot 3^4 : 3^5 = 3^5`, so the exponent asked for is 5. */
export const LAWS_ANSWER = 5

/** `(3 + 4)^2 = 49`, but `3^2 + 4^2 = 25`. There is no law for a sum. */
export const SUM_TRAP = { a: 3, b: 4 }

/* ------------------------------------------------------------------ */
/* 4. Normal form                                                      */
/* ------------------------------------------------------------------ */

/** A number as `mantissa · 10^exponent`. The mantissa keeps a plain point. */
export interface Sci {
  mantissa: string
  exponent: number
}

/** Trim a laid-out number back to how a person writes it: `007.100` → `7.1`. */
function tidy(intPart: string, fracPart: string, negative: boolean): string {
  const i = intPart.replace(/^0+(?=\d)/, '') || '0'
  const f = fracPart.replace(/0+$/, '')
  const body = f ? `${i}.${f}` : i
  return negative && /[1-9]/.test(body) ? `-${body}` : body
}

/**
 * Move the decimal point of a plain number by `places`, positive to the right.
 *
 * `shiftPoint('149600000', -8)` is `'1.496'`. Nothing is converted to a float,
 * so a long string of digits survives the trip intact.
 */
export function shiftPoint(digits: string, places: number): string {
  const negative = digits.trim().startsWith('-')
  const body = digits.trim().replace(/^[-+]/, '')
  const [rawInt = '0', rawFrac = ''] = body.split('.')
  let all = rawInt + rawFrac
  let point = rawInt.length + places
  if (point < 1) {
    all = '0'.repeat(1 - point) + all
    point = 1
  }
  if (point > all.length) all += '0'.repeat(point - all.length)
  return tidy(all.slice(0, point), all.slice(point), negative)
}

/** True when the mantissa is where normal form wants it: 1 ≤ |m| < 10. */
export function isNormalMantissa(m: string): boolean {
  const v = Math.abs(Number(m))
  return Number.isFinite(v) && v >= 1 && v < 10
}

/** `5{,}2 \cdot 10^{-4}` — the reader's decimal separator, KaTeX flavour. */
export function sciTex(s: Sci, sep: string): string {
  return `${formatDecimal(s.mantissa, sep, true)} \\cdot 10^{${s.exponent}}`
}

/** Numbers nobody writes out in full. `unit` is a symbol, so it is not translated. */
export const SCI_PRESETS: readonly { id: string; digits: string; unit: string }[] = [
  { id: 'earthSun', digits: '149600000', unit: 'km' },
  { id: 'lightSpeed', digits: '299792458', unit: 'm/s' },
  { id: 'earthMass', digits: '5972000000000000000000000', unit: 'kg' },
  { id: 'hungary', digits: '9600000', unit: '' },
  { id: 'everest', digits: '8849', unit: 'm' },
  { id: 'redCell', digits: '0.000007', unit: 'm' },
  { id: 'bacteria', digits: '0.000002', unit: 'm' },
  { id: 'hydrogen', digits: '0.0000000001', unit: 'm' },
]

/** `0,00052` in normal form. */
export const SCI_ANSWER: Sci = { mantissa: '5.2', exponent: -4 }

/* ------------------------------------------------------------------ */
/* 5. The square root                                                  */
/* ------------------------------------------------------------------ */

export function isPerfectSquare(n: number): boolean {
  if (!Number.isInteger(n) || n < 0) return false
  const r = Math.round(Math.sqrt(n))
  return r * r === n
}

/** 1², 2², …, 15² — the ones worth knowing by heart. */
export const PERFECT_SQUARES: readonly number[] = Array.from({ length: 15 }, (_, i) => (i + 1) * (i + 1))

/** The two whole numbers a square root is caught between: `lo² ≤ a < hi²`. */
export function neighbourSquares(a: number): { lo: number; hi: number } {
  if (a < 0) throw new Error('neighbourSquares needs a non-negative number')
  let lo = Math.floor(Math.sqrt(a))
  while ((lo + 1) * (lo + 1) <= a) lo++
  while (lo > 0 && lo * lo > a) lo--
  return { lo, hi: lo + 1 }
}

/** `√a` to `decimals` places, with a plain point; the card swaps the separator. */
export function sqrtText(a: number, decimals: number): string {
  return Math.sqrt(a).toFixed(decimals)
}

/** `√(9 + 16) = 5`, but `√9 + √16 = 7`. There is no law for a sum. */
export const ROOT_SUM_TRAP = { a: 9, b: 16 }

/** The two numbers the square-root exercise asks for, on either side of the trap. */
export const SQRT_ANSWER = {
  whole: Math.sqrt(ROOT_SUM_TRAP.a + ROOT_SUM_TRAP.b),
  parts: Math.sqrt(ROOT_SUM_TRAP.a) + Math.sqrt(ROOT_SUM_TRAP.b),
}

/* ------------------------------------------------------------------ */
/* 6. Simplifying a root, for quadratic.ts                             */
/* ------------------------------------------------------------------ */

/** `√48 = 4√3`: the largest square factor steps outside the root sign. */
export function simplifyRoot(n: number): { outside: number; inside: number } {
  if (!Number.isInteger(n) || n < 1) throw new Error('simplifyRoot needs a positive integer')
  for (let d = Math.floor(Math.sqrt(n)); d >= 2; d--) {
    if (n % (d * d) === 0) return { outside: d, inside: n / (d * d) }
  }
  return { outside: 1, inside: n }
}

/* ------------------------------------------------------------------ */
/* 7. The n-th root and fractional exponents                           */
/* ------------------------------------------------------------------ */

/**
 * The n-th root of `a`, or null where it does not exist.
 *
 * An even root of a negative number is undefined; an odd one is fine and keeps
 * the sign (`∛(−8) = −2`). A result within a hair of a whole number is snapped
 * to it, because `Math.pow(1000, 1/3)` comes out as 9.999999999999998.
 */
export function nthRoot(a: number, n: number): number | null {
  if (!Number.isInteger(n) || n < 2) throw new Error('nthRoot needs an integer n ≥ 2')
  if (a < 0 && n % 2 === 0) return null
  const sign = a < 0 ? -1 : 1
  const raw = sign * Math.pow(Math.abs(a), 1 / n)
  const near = Math.round(raw)
  return Math.abs(Math.pow(near, n) - a) < 1e-9 ? near : raw
}

/** `a^(m/n)`, read as "the n-th root of a, raised to the m-th". */
export function rationalPower(a: number, m: number, n: number): number | null {
  const root = nthRoot(a, n)
  if (root === null) return null
  if (root === 0 && m < 0) return null
  const raw = Math.pow(root, m)
  const near = Math.round(raw * 1e9) / 1e9
  return Number.isFinite(near) ? near : null
}

/** Volumes to take a cube root of. */
export const CUBE_PRESETS: readonly number[] = [8, 27, 64, 125, 1000, 2]

/** Fractional exponents worth working through, each one exact. */
export const RATIONAL_TABLE: readonly { a: number; m: number; n: number }[] = [
  { a: 8, m: 1, n: 3 },
  { a: 16, m: 3, n: 4 },
  { a: 27, m: 2, n: 3 },
  { a: 4, m: -1, n: 2 },
  { a: 32, m: 1, n: 5 },
]

/** `16^{3/4} = 8`. */
export const NTH_ANSWER = 8
