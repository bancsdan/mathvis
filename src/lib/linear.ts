/**
 * Elsőfokú egyenletek, egyenlőtlenségek, egyenletrendszerek.
 *
 * Three ideas shape the file. First, an equation is a pair of `Side`s — a
 * coefficient of x and a constant — so "solve" is arithmetic on four numbers
 * and every tex string is written by `polyTex` from `algebra.ts`, which already
 * settles the signs, the hidden coefficient 1 and the dropped zero term.
 * Second, a solution is a `Frac` rather than a float, because the lesson turns
 * on whether a root is a whole number, and 3/2 must not arrive as
 * 1.4999999999999998. Third, every exercise answer of the lesson lives here as
 * an exported constant, so the tests own it rather than the page.
 *
 * Nothing here ever emits a Hungarian word: a step carries the i18n key of its
 * note, and the card translates it.
 */

import { polyTex, termTex, type Term } from './algebra'
import { formatDecimal, gcd, isTerminating, reduce } from './numbers'

/* ------------------------------------------------------------------ */
/* 0. Fractions, sides, and solving                                    */
/* ------------------------------------------------------------------ */

/** A fraction in lowest terms, the sign carried by the numerator, `q > 0`. */
export interface Frac {
  p: number
  q: number
}

/** Build a reduced fraction. `q` must not be 0. */
export function frac(p: number, q: number): Frac {
  const r = reduce(p, q)
  return { p: r.p, q: r.q }
}

/** `5`, `-\frac{3}{2}`. A whole number never wears a fraction bar. */
export function fracTex(f: Frac): string {
  if (f.q === 1) return String(f.p)
  const body = `\\frac{${Math.abs(f.p)}}{${f.q}}`
  return f.p < 0 ? `-${body}` : body
}

/**
 * The same number for prose: `5`, `−1,5`, or `2/7` where the decimal never
 * stops and a rounded one would be a lie.
 */
export function fracPlain(f: Frac, sep: string): string {
  if (f.q === 1) return formatDecimal(String(f.p), sep, false)
  if (isTerminating(f.p, f.q)) return formatDecimal(String(f.p / f.q), sep, false)
  return `${f.p < 0 ? '−' : ''}${Math.abs(f.p)}/${f.q}`
}

/** A number for prose: at most three decimals, with the reader's separator. */
export function plainValue(x: number, sep: string): string {
  return formatDecimal(String(Math.round(x * 1000) / 1000), sep, false)
}

/** One side of a linear equation: `a·x + b`. */
export type Side = { a: number; b: number }

/** `3x + 2`, `x`, `-x + 7`, `8`. */
export function sideTex(s: Side): string {
  return polyTex([
    { coef: s.a, part: 'x' },
    { coef: s.b, part: '' },
  ])
}

/** `3x + 2 = x + 8`. */
export function equationTex(l: Side, r: Side): string {
  return `${sideTex(l)} = ${sideTex(r)}`
}

export type LinearResult = { kind: 'one'; x: Frac } | { kind: 'all' } | { kind: 'none' }

/**
 * Solve `l = r` by collecting x on the left and the numbers on the right.
 *
 * When the x terms cancel there is no x left to blame: either both sides were
 * the same expression all along (every number is a solution) or they differ by
 * a constant (no number is).
 */
export function solveLinear(l: Side, r: Side): LinearResult {
  const a = l.a - r.a
  const b = r.b - l.b
  if (a === 0) return b === 0 ? { kind: 'all' } : { kind: 'none' }
  return { kind: 'one', x: frac(b, a) }
}

/** The value of one side at a given x. */
export function evalSide(s: Side, x: number): number {
  return s.a * x + s.b
}

/** One line of a worked solution, with the key of the move that produced it. */
export interface SolveStep {
  tex: string
  noteKey: string
}

/* ------------------------------------------------------------------ */
/* 1. The balance                                                      */
/* ------------------------------------------------------------------ */

/** One pan: whole boxes of unknown weight, and whole one-kilo weights. */
export interface Pan {
  x: number
  units: number
}

export interface Balance {
  left: Pan
  right: Pan
}

/** 3x + 2 = x + 8. Every count stays a non-negative whole, so it can be drawn. */
export const BALANCE_START: Balance = { left: { x: 3, units: 2 }, right: { x: 1, units: 8 } }

export type BalanceOp =
  | { kind: 'removeUnits'; n: number }
  | { kind: 'removeX'; n: number }
  | { kind: 'divide'; n: number }

/**
 * Is this move allowed on both pans at once?
 *
 * That is the whole mérlegelv: taking away what only one pan has would tip the
 * balance, so the move simply does not exist.
 */
export function canApply(b: Balance, op: BalanceOp): boolean {
  if (op.n <= 0) return false
  if (op.kind === 'removeUnits') return b.left.units >= op.n && b.right.units >= op.n
  if (op.kind === 'removeX') return b.left.x >= op.n && b.right.x >= op.n
  return (
    op.n >= 2 &&
    [b.left.x, b.left.units, b.right.x, b.right.units].every((count) => count % op.n === 0)
  )
}

/** The balance after the move. A move that is not allowed changes nothing. */
export function applyOp(b: Balance, op: BalanceOp): Balance {
  if (!canApply(b, op)) return b
  if (op.kind === 'removeUnits') {
    return {
      left: { x: b.left.x, units: b.left.units - op.n },
      right: { x: b.right.x, units: b.right.units - op.n },
    }
  }
  if (op.kind === 'removeX') {
    return {
      left: { x: b.left.x - op.n, units: b.left.units },
      right: { x: b.right.x - op.n, units: b.right.units },
    }
  }
  return {
    left: { x: b.left.x / op.n, units: b.left.units / op.n },
    right: { x: b.right.x / op.n, units: b.right.units / op.n },
  }
}

/** One pan holds a single box and nothing else, the other only weights. */
export function isSolved(b: Balance): boolean {
  const alone = (p: Pan) => p.x === 1 && p.units === 0
  const numbers = (p: Pan) => p.x === 0
  return (alone(b.left) && numbers(b.right)) || (alone(b.right) && numbers(b.left))
}

/** `3x + 2 = x + 8`. An empty pan is `0`, not an empty string. */
export function balanceTex(b: Balance): string {
  return equationTex({ a: b.left.x, b: b.left.units }, { a: b.right.x, b: b.right.units })
}

/** Sign of (right − left) when a box is worth `x` kilos: 0 all along a legal path. */
export function balanceTilt(b: Balance, x: number): -1 | 0 | 1 {
  const diff = (b.right.x * x + b.right.units) - (b.left.x * x + b.left.units)
  return diff === 0 ? 0 : diff > 0 ? 1 : -1
}

/** 5x − 7 = 2x + 8. */
export const BALANCE_ANSWER = 5

/* ------------------------------------------------------------------ */
/* 2. Graphical solution                                               */
/* ------------------------------------------------------------------ */

/** The height of one side above each x, ready for `LineChart`. */
export function lineValues(s: Side, xs: readonly number[]): number[] {
  return xs.map((x) => evalSide(s, x))
}

/** y = x + 1 and y = −x + 7 meet at (3; 4). */
export const GRAPH_PRESET: { l: Side; r: Side } = { l: { a: 1, b: 1 }, r: { a: -1, b: 7 } }

export const GRAPH_ANSWER = 3

/* ------------------------------------------------------------------ */
/* 3. Inequalities                                                     */
/* ------------------------------------------------------------------ */

export type Rel = 'lt' | 'le' | 'gt' | 'ge'

export const REL_TEX: Record<Rel, string> = { lt: '<', le: '\\le', gt: '>', ge: '\\ge' }

/** The same signs for a diagram label or a sentence, where KaTeX cannot go. */
export const REL_PLAIN: Record<Rel, string> = { lt: '<', le: '≤', gt: '>', ge: '≥' }

/** The one exception to the mérlegelv: multiplying by a negative turns the sign. */
export function flip(rel: Rel): Rel {
  if (rel === 'lt') return 'gt'
  if (rel === 'gt') return 'lt'
  if (rel === 'le') return 'ge'
  return 'le'
}

export interface IneqStep {
  tex: string
  noteKey: string
  /** True on the step where dividing by a negative turned the sign. */
  flipped?: boolean
}

/** `-2x + 3 < 9` as one line of tex. */
export function ineqTex(l: Side, r: Side, rel: Rel): string {
  return `${sideTex(l)} ${REL_TEX[rel]} ${sideTex(r)}`
}

/**
 * Solve an inequality the way the equation was solved, and say where the sign
 * turned. `bound` and `rel` describe the answer: `x rel bound`.
 */
export function solveIneq(l: Side, r: Side, rel: Rel): { steps: IneqStep[]; bound: Frac; rel: Rel } {
  const steps: IneqStep[] = [{ tex: ineqTex(l, r, rel), noteKey: 'lin.stepStart' }]
  const a = l.a - r.a
  const b = r.b - l.b
  if (r.a !== 0) {
    steps.push({ tex: ineqTex({ a, b: l.b }, { a: 0, b: r.b }, rel), noteKey: 'lin.stepMoveX' })
  }
  if (l.b !== 0) {
    steps.push({ tex: ineqTex({ a, b: 0 }, { a: 0, b }, rel), noteKey: 'lin.stepMoveNum' })
  }
  if (a === 0) return { steps, bound: { p: 0, q: 1 }, rel }
  const finalRel = a < 0 ? flip(rel) : rel
  const bound = frac(b, a)
  if (a !== 1) {
    steps.push({
      tex: `x ${REL_TEX[finalRel]} ${fracTex(bound)}`,
      noteKey: a < 0 ? 'lin.stepDivideFlip' : 'lin.stepDivide',
      flipped: a < 0,
    })
  }
  return { steps, bound, rel: finalRel }
}

/** Does the inequality hold at this test point? */
export function holds(l: Side, r: Side, rel: Rel, x: number): boolean {
  const diff = evalSide(l, x) - evalSide(r, x)
  if (rel === 'lt') return diff < 0
  if (rel === 'le') return diff <= 0
  if (rel === 'gt') return diff > 0
  return diff >= 0
}

export const INEQ_PRESETS: readonly { id: string; l: Side; r: Side; rel: Rel }[] = [
  { id: 'flip', l: { a: -2, b: 3 }, r: { a: 0, b: 9 }, rel: 'lt' },
  { id: 'noflip', l: { a: 3, b: -4 }, r: { a: 0, b: 5 }, rel: 'le' },
  { id: 'both', l: { a: -3, b: 5 }, r: { a: 2, b: -10 }, rel: 'ge' },
]

/** 5 − 3x ≥ −4. */
export const INEQ_TASK: { l: Side; r: Side; rel: Rel } = {
  l: { a: -3, b: 5 },
  r: { a: 0, b: -4 },
  rel: 'ge',
}

export const INEQ_OPTIONS: readonly { id: string; rel: Rel; bound: number }[] = [
  { id: 'le3', rel: 'le', bound: 3 },
  { id: 'ge3', rel: 'ge', bound: 3 },
  { id: 'leNeg3', rel: 'le', bound: -3 },
  { id: 'geNeg3', rel: 'ge', bound: -3 },
]

export const INEQ_ANSWER = 'le3'

/* ------------------------------------------------------------------ */
/* 4. Systems of two equations                                         */
/* ------------------------------------------------------------------ */

/** a₁x + b₁y = c₁ and a₂x + b₂y = c₂. */
export interface System {
  a1: number
  b1: number
  c1: number
  a2: number
  b2: number
  c2: number
}

/** One row as tex, coefficients of ±1 tidy and zero terms dropped. */
export function rowTex(a: number, b: number, c: number): string {
  return `${polyTex([
    { coef: a, part: 'x' },
    { coef: b, part: 'y' },
  ])} = ${c}`
}

/** Both rows, in order. */
export function systemTex(s: System): string[] {
  return [rowTex(s.a1, s.b1, s.c1), rowTex(s.a2, s.b2, s.c2)]
}

/** The height of the row's line above x. */
export function rowY(a: number, b: number, c: number, x: number): number {
  return (c - a * x) / b
}

export type SystemResult =
  | { kind: 'one'; x: Frac; y: Frac }
  | { kind: 'none' }
  | { kind: 'infinite' }

/**
 * Two lines either cross once, never, or everywhere — and the determinant
 * `a₁b₂ − a₂b₁` is exactly the test for which.
 */
export function solveSystem(s: System): SystemResult {
  const det = s.a1 * s.b2 - s.a2 * s.b1
  if (det !== 0) {
    return {
      kind: 'one',
      x: frac(s.c1 * s.b2 - s.c2 * s.b1, det),
      y: frac(s.a1 * s.c2 - s.a2 * s.c1, det),
    }
  }
  const sameLine = s.a1 * s.c2 - s.a2 * s.c1 === 0 && s.b1 * s.c2 - s.b2 * s.c1 === 0
  return sameLine ? { kind: 'infinite' } : { kind: 'none' }
}

/** Does the pair make each row true? One answer per row. */
export function checkSystem(s: System, x: number, y: number): [boolean, boolean] {
  return [s.a1 * x + s.b1 * y === s.c1, s.a2 * x + s.b2 * y === s.c2]
}

/** `3 \cdot 300`, `- 500`, nothing at all when the coefficient is 0. */
function numTermTex(coef: number, value: number, leading: boolean): string {
  if (coef === 0) return ''
  const abs = Math.abs(coef)
  const shown = value < 0 ? `(${value})` : String(value)
  const body = abs === 1 ? shown : `${abs} \\cdot ${shown}`
  if (leading) return coef < 0 ? `-${body}` : body
  return coef < 0 ? `- ${body}` : `+ ${body}`
}

/** A sum of numbers written the way the row was written. */
function numSumTex(pairs: readonly { coef: number; value: number }[]): string {
  const kept = pairs.filter((pair) => pair.coef !== 0)
  if (kept.length === 0) return '0'
  return kept.map((pair, i) => numTermTex(pair.coef, pair.value, i === 0)).join(' ')
}

/** The check of one row with the pair substituted: `7 + 3 = 10 \checkmark`. */
function rowCheckTex(a: number, b: number, c: number, x: number, y: number): string {
  return `${numSumTex([
    { coef: a, value: x },
    { coef: b, value: y },
  ])} = ${c} \\;\\checkmark`
}

/** Both rows checked, side by side. */
function checkStep(s: System, x: number, y: number): SolveStep {
  return {
    tex: `${rowCheckTex(s.a1, s.b1, s.c1, x, y)} \\qquad ${rowCheckTex(s.a2, s.b2, s.c2, x, y)}`,
    noteKey: 'lin.stepCheck',
  }
}

/** Several tex lines stacked and aligned on their equals signs. */
function alignedTex(lines: readonly string[]): string {
  return `\\begin{aligned} ${lines.join(' \\\\ ')} \\end{aligned}`
}

/** The one-unknown equation `A·x + K = c`, solved in as few lines as it needs. */
function solveOneStep(A: number, K: number, c: number): SolveStep {
  const lines = [`${polyTex([{ coef: A, part: 'x' }, { coef: K, part: '' }])} &= ${c}`]
  if (K !== 0) lines.push(`${polyTex([{ coef: A, part: 'x' }])} &= ${c - K}`)
  if (A !== 1) lines.push(`x &= ${fracTex(frac(c - K, A))}`)
  return { tex: alignedTex(lines), noteKey: 'lin.stepSolveOne' }
}

/** The expressed unknown as terms: constant first unless that starts with a minus. */
function expressedTerms(constant: number, coef: number): Term[] {
  const xTerm: Term = { coef, part: 'x' }
  const cTerm: Term = { coef: constant, part: '' }
  return constant < 0 ? [xTerm, cTerm] : [cTerm, xTerm]
}

/** `x - (10 - x) = 4`: the other row with the expression written into it. */
function substitutedTex(a: number, b: number, c: number, exprTex: string): string {
  const head = a === 0 ? '' : termTex({ coef: a, part: 'x' }, true)
  const magnitude = Math.abs(b) === 1 ? '' : `${Math.abs(b)}`
  const bracket = `${magnitude}\\left(${exprTex}\\right)`
  if (head === '') return `${b < 0 ? '-' : ''}${bracket} = ${c}`
  return `${head} ${b < 0 ? '-' : '+'} ${bracket} = ${c}`
}

/** `10 - 7 = 3`: the expression with x replaced by the number just found. */
function backSubTex(constant: number, coef: number, x: number): string {
  const value = constant + coef * x
  // A row whose y coefficient is not ±1 would put a decimal in the tex; the
  // value itself is still whole, so the line simply states it.
  if (!Number.isInteger(constant) || !Number.isInteger(coef) || coef === 0) return `y = ${value}`
  const xPiece = { coef, value: x }
  const cPiece = { coef: constant < 0 ? -1 : 1, value: Math.abs(constant) }
  const pieces = constant === 0 ? [xPiece] : constant < 0 ? [xPiece, cPiece] : [cPiece, xPiece]
  return `y = ${numSumTex(pieces)} = ${value}`
}

/** The row that gives up an unknown most cheaply: one whose coefficient is ±1. */
function pickExpressRow(s: System): 1 | 2 {
  if (Math.abs(s.b1) === 1) return 1
  if (Math.abs(s.b2) === 1) return 2
  return Math.abs(s.b1) <= Math.abs(s.b2) ? 1 : 2
}

/**
 * Express y from one row, write it into the other, solve, come back.
 *
 * Returns nothing for a system without exactly one solution: those are the
 * parallel and coincident lines of the graphical explorer.
 */
export function substitutionSteps(s: System): SolveStep[] {
  const result = solveSystem(s)
  if (result.kind !== 'one' || result.x.q !== 1 || result.y.q !== 1) return []
  const first = pickExpressRow(s) === 1
  const [aE, bE, cE] = first ? [s.a1, s.b1, s.c1] : [s.a2, s.b2, s.c2]
  const [aO, bO, cO] = first ? [s.a2, s.b2, s.c2] : [s.a1, s.b1, s.c1]
  if (bE === 0) return []

  const constant = cE / bE
  const coef = -aE / bE
  const exprTex = polyTex(expressedTerms(constant, coef))
  const A = aO - (bO * aE) / bE
  const K = (bO * cE) / bE
  if (!Number.isInteger(A) || !Number.isInteger(K)) return []

  return [
    { tex: `y = ${exprTex}`, noteKey: 'lin.stepExpress' },
    { tex: substitutedTex(aO, bO, cO, exprTex), noteKey: 'lin.stepSubstitute' },
    solveOneStep(A, K, cO),
    { tex: backSubTex(constant, coef, result.x.p), noteKey: 'lin.stepBack' },
    checkStep(s, result.x.p, result.y.p),
  ]
}

/** Smallest common multiple, so the rows are scaled no further than needed. */
function lcm(a: number, b: number): number {
  return Math.abs(a * b) / (gcd(a, b) || 1)
}

/**
 * Scale the rows until the y coefficients are opposites, add them, and y is
 * gone. Only the row that actually has to change gets a step of its own.
 */
export function additionSteps(s: System): SolveStep[] {
  const result = solveSystem(s)
  if (result.kind !== 'one' || result.x.q !== 1 || result.y.q !== 1) return []
  if (s.b1 === 0 || s.b2 === 0) {
    // One row is already free of y; there is nothing to eliminate.
    const free = s.b1 === 0 ? { a: s.a1, c: s.c1 } : { a: s.a2, c: s.c2 }
    const other = s.b1 === 0 ? { a: s.a2, b: s.b2, c: s.c2 } : { a: s.a1, b: s.b1, c: s.c1 }
    return [
      solveOneStep(free.a, 0, free.c),
      { tex: backSubTex(other.c / other.b, -other.a / other.b, result.x.p), noteKey: 'lin.stepBack' },
      checkStep(s, result.x.p, result.y.p),
    ]
  }

  const common = lcm(s.b1, s.b2)
  const m1 = common / s.b1
  const m2 = -common / s.b2
  const steps: SolveStep[] = []
  if (m1 !== 1) {
    steps.push({ tex: rowTex(s.a1 * m1, s.b1 * m1, s.c1 * m1), noteKey: 'lin.stepMultiply' })
  }
  if (m2 !== 1) {
    steps.push({ tex: rowTex(s.a2 * m2, s.b2 * m2, s.c2 * m2), noteKey: 'lin.stepMultiply' })
  }
  const A = s.a1 * m1 + s.a2 * m2
  const C = s.c1 * m1 + s.c2 * m2
  steps.push({ tex: rowTex(A, 0, C), noteKey: 'lin.stepAddRows' })
  // `A·x = C` is already on screen, so solving it only needs the answer.
  if (A !== 1) steps.push({ tex: `x = ${fracTex(frac(C, A))}`, noteKey: 'lin.stepSolveOne' })
  const back = pickExpressRow(s) === 1 ? { a: s.a1, b: s.b1, c: s.c1 } : { a: s.a2, b: s.b2, c: s.c2 }
  steps.push({
    tex: backSubTex(back.c / back.b, -back.a / back.b, result.x.p),
    noteKey: 'lin.stepBack',
  })
  steps.push(checkStep(s, result.x.p, result.y.p))
  return steps
}

export const SYSTEM_PRESETS: readonly { id: string; s: System }[] = [
  { id: 'sum', s: { a1: 1, b1: 1, c1: 10, a2: 1, b2: -1, c2: 4 } },
  { id: 'mixed', s: { a1: 2, b1: 3, c1: 12, a2: 1, b2: -1, c2: 1 } },
  { id: 'shop', s: { a1: 3, b1: 2, c1: 1900, a2: 1, b2: 1, c2: 800 } },
]

/** x + y = 12, x − y = 2. */
export const SYSTEM_TASK: System = { a1: 1, b1: 1, c1: 12, a2: 1, b2: -1, c2: 2 }

export const SYSTEM_ANSWER = '7|5'

/* ------------------------------------------------------------------ */
/* 5. The model: two cars driving towards each other                   */
/* ------------------------------------------------------------------ */

export const MEETING = { distance: 180, v1: 60, v2: 30 }

/** Where the two cars are after t hours, and how much road is left between them. */
export function positions(t: number, m = MEETING): { car1: number; car2: number; gap: number } {
  return {
    car1: m.v1 * t,
    car2: m.distance - m.v2 * t,
    gap: m.distance - (m.v1 + m.v2) * t,
  }
}

/** They meet when the two covered distances add up to the whole road. */
export function meetingTime(distance: number, v1: number, v2: number): number {
  return distance / (v1 + v2)
}

/** 180 km at 60 and 40 km/h. */
export const MODEL_ANSWER = 1.8

/* ------------------------------------------------------------------ */
/* 6. Work, mixture, and faulty data                                  */
/* ------------------------------------------------------------------ */

/** Alone in 6 and in 3 hours, so together in 2. */
export const WORK = { t1: 6, t2: 3 }

/** The fractions of the job each of them has done after t hours. */
export function workDone(t: number, w = WORK): { part1: number; part2: number; total: number } {
  const part1 = t / w.t1
  const part2 = t / w.t2
  return { part1, part2, total: part1 + part2 }
}

/** The t where the two parts add up to one whole job. */
export function togetherTime(t1: number, t2: number): number {
  return (t1 * t2) / (t1 + t2)
}

/** 6 litres of 40% from a 20% and a 50% solution: 2 litres of the weaker one. */
export const MIX = { total: 6, c1: 20, c2: 50, target: 40 }

/** The strength of the mixture when x litres come from the weaker solution. */
export function mixConcentration(x: number, m = MIX): number {
  return (m.c1 * x + m.c2 * (m.total - x)) / m.total
}

/** How many litres of the weaker solution hit the target strength. */
export function mixSolve(m = MIX): number {
  return (m.total * (m.c2 - m.target)) / (m.c2 - m.c1)
}

export type DataKind = 'missing' | 'redundant' | 'contradictory'

/** Three retellings of the mixing problem, one of them fine and two not. */
export const DATA_VARIANTS: readonly { id: string; kind: DataKind }[] = [
  { id: 'v1', kind: 'missing' },
  { id: 'v2', kind: 'redundant' },
  { id: 'v3', kind: 'contradictory' },
]

export const DATA_ANSWER = 'missing|redundant|contradictory'
