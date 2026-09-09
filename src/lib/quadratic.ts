/**
 * Másodfokú egyenletek és egyenlőtlenségek.
 *
 * Three ideas shape the file. First, a quadratic is three integers — `Quad` —
 * and every tex string is written by `polyTex` from `algebra.ts`, which already
 * settles the signs, the hidden coefficient 1 and the dropped zero term.
 * Second, a root is kept as a number but written exactly whenever it can be:
 * `fracOf` reconstructs the fraction behind a rational root, so 1/2 never
 * arrives as 0.49999999999999994, and an irrational root keeps its root sign
 * instead of being rounded into a lie. Third, every exercise answer of the
 * lesson lives here as an exported constant, so the tests own it, not the page.
 *
 * Nothing here ever emits a Hungarian word: a step carries the i18n key of its
 * note, and where a line needs the word "or" it carries `OR_TOKEN` for the card
 * to swap out.
 */

import { OR_TOKEN, polyTex, termTex } from './algebra'
import { frac, fracTex, type Frac, type Rel } from './linear'
import { formatDecimal, gcd } from './numbers'
import { isPerfectSquare, simplifyRoot } from './powers'

/* ------------------------------------------------------------------ */
/* 0. The quadratic itself                                             */
/* ------------------------------------------------------------------ */

/** `ax² + bx + c` with `a ≠ 0`. All three are integers throughout the lesson. */
export interface Quad {
  a: number
  b: number
  c: number
}

/** `2x^2 - 5x + 2`, `x^2 - 4`, or the same in another letter: `u^2 - 5u + 4`. */
export function quadTex(q: Quad, letter = 'x'): string {
  return polyTex([
    { coef: q.a, part: `${letter}^2` },
    { coef: q.b, part: letter },
    { coef: q.c, part: '' },
  ])
}

/** The value of the expression at a given x. */
export function quadValue(q: Quad, x: number): number {
  return q.a * x * x + q.b * x + q.c
}

/** `D = b² − 4ac`, the number the whole lesson turns on. */
export function discriminant(q: Quad): number {
  return q.b * q.b - 4 * q.a * q.c
}

export type RootKind = 'two' | 'one' | 'none'

/** `x1 ≤ x2` when there are two; both hold the same value when there is one. */
export interface Roots {
  kind: RootKind
  x1?: number
  x2?: number
  /** D is a perfect square, so both roots can be written without a root sign. */
  exact: boolean
}

export function solveQuad(q: Quad): Roots {
  const d = discriminant(q)
  if (d < 0) return { kind: 'none', exact: false }
  const exact = isPerfectSquare(d)
  if (d === 0) {
    const x = -q.b / (2 * q.a)
    return { kind: 'one', x1: x, x2: x, exact }
  }
  const s = Math.sqrt(d)
  const p = (-q.b - s) / (2 * q.a)
  const m = (-q.b + s) / (2 * q.a)
  return { kind: 'two', x1: Math.min(p, m), x2: Math.max(p, m), exact }
}

/** A number for prose: two decimals at most, and none at all on a whole one. */
export function rootDecimal(x: number, sep: string): string {
  // Dividing a whole number by 100 gives the shortest decimal that means it,
  // so `0.5` never arrives as `0.50` and `2` never grows a `.00`.
  const rounded = Math.round(x * 100) / 100
  return formatDecimal(String(rounded), sep, false)
}

/**
 * The fraction behind a rational root, or null when there is none with a small
 * enough denominator. Coefficients are integers, so every rational root has a
 * denominator dividing 2a — a hundred is far more room than the lesson needs.
 */
export function fracOf(x: number): Frac | null {
  if (!Number.isFinite(x)) return null
  for (let q = 1; q <= 100; q++) {
    const p = Math.round(x * q)
    if (Math.abs(p / q - x) < 1e-9) return frac(p, q)
  }
  return null
}

/** `-\frac{3}{2}` for a rational root, and the plain number for a whole one. */
function exactTex(x: number): string {
  const f = fracOf(x)
  return f ? fracTex(f) : String(x)
}

/**
 * `\frac{-3 \pm \sqrt{17}}{2}`: the two irrational roots in one expression.
 *
 * Everything that can be pulled out from under the root sign is pulled out
 * first, then the whole fraction is reduced, so `x² − 2x − 1 = 0` reads
 * `1 \pm \sqrt{2}` rather than `\frac{2 \pm 2\sqrt{2}}{2}`.
 */
function pmTex(q: Quad): string {
  const { outside, inside } = simplifyRoot(discriminant(q))
  const sign = q.a < 0 ? -1 : 1
  let num = -q.b * sign
  let root = outside
  let den = Math.abs(2 * q.a)
  const g = gcd(gcd(Math.abs(num), root), den) || 1
  num /= g
  root /= g
  den /= g
  const rootTerm = root === 1 ? `\\sqrt{${inside}}` : `${root}\\sqrt{${inside}}`
  const top = `${num} \\pm ${rootTerm}`
  return den === 1 ? top : `\\frac{${top}}{${den}}`
}

/**
 * The roots as the lesson writes them: exactly when they are rational, with the
 * root sign kept when they are not. An equation with no root gets nothing at
 * all — the card says that in words, where a translated sentence belongs.
 */
export function rootTex(q: Quad): string {
  const roots = solveQuad(q)
  if (roots.kind === 'none') return ''
  if (roots.kind === 'one') return `x = ${exactTex(roots.x1 as number)}`
  if (!roots.exact) return `x_{1,2} = ${pmTex(q)}`
  return `x_1 = ${exactTex(roots.x1 as number)},\\ x_2 = ${exactTex(roots.x2 as number)}`
}

/** A number in the place a formula puts it: a negative one wears brackets. */
function br(n: number): string {
  return n < 0 ? `(${n})` : String(n)
}

/**
 * The formula with this equation's three numbers written into it, before any
 * arithmetic — the step where most mistakes are actually made.
 */
export function formulaSubstitutedTex(q: Quad): string {
  const top = `-${br(q.b)} \\pm \\sqrt{${br(q.b)}^2 - 4 \\cdot ${br(q.a)} \\cdot ${br(q.c)}}`
  return `x_{1,2} = \\frac{${top}}{2 \\cdot ${br(q.a)}}`
}

/* ------------------------------------------------------------------ */
/* 1. Standard form and equivalent transformations                     */
/* ------------------------------------------------------------------ */

export interface StandardPreset {
  id: string
  givenTex: string
  /** The rearranging, one line each; the last one is the standard form. */
  steps: string[]
  std: Quad
}

export const STANDARD_PRESETS: readonly StandardPreset[] = [
  {
    id: 'move',
    givenTex: '3x^2 = 5 - 2x',
    steps: ['3x^2 + 2x - 5 = 0'],
    std: { a: 3, b: 2, c: -5 },
  },
  {
    id: 'expand',
    givenTex: '(x + 1)(x - 3) = 5',
    steps: ['x^2 - 2x - 3 = 5', 'x^2 - 2x - 8 = 0'],
    std: { a: 1, b: -2, c: -8 },
  },
  {
    id: 'product',
    givenTex: 'x(x + 2) = 3x + 6',
    steps: ['x^2 + 2x = 3x + 6', 'x^2 - x - 6 = 0'],
    std: { a: 1, b: -1, c: -6 },
  },
  {
    id: 'square',
    givenTex: '(x - 2)^2 = 2x - 1',
    steps: ['x^2 - 4x + 4 = 2x - 1', 'x^2 - 6x + 5 = 0'],
    std: { a: 1, b: -6, c: 5 },
  },
]

/**
 * `x² = 4x`: dividing by x looks harmless and loses the root 0, while
 * factoring keeps both. The one worked counter-example of the section.
 */
export const LOST_ROOT = {
  q: { a: 1, b: -4, c: 0 } as Quad,
  wrongTex: 'x = 4',
  rightTex: 'x(x - 4) = 0',
}

/** `3x² = 5 − 2x` rearranged: a, b, c. */
export const STANDARD_ANSWER = '3|2|-5'

/* ------------------------------------------------------------------ */
/* 2. Factoring and the root-factor form                               */
/* ------------------------------------------------------------------ */

/** The monic quadratic with these two roots: `(x − r1)(x − r2)` expanded. */
export function fromRoots(r1: number, r2: number): Quad {
  // `+ 0` rather than the negative zero a sum or product of roots can produce:
  // it prints as `-0` and compares badly, while meaning nothing different.
  return { a: 1, b: -(r1 + r2) + 0, c: r1 * r2 + 0 }
}

/** `(x - 2)(x - 3)`, `(x + 1)(x - 3)`, `2(x - 1)(x + 4)`. */
export function factorTex(r1: number, r2: number, a = 1): string {
  const bracket = (r: number) => (r < 0 ? `(x + ${Math.abs(r)})` : r === 0 ? 'x' : `(x - ${r})`)
  const head = a === 1 ? '' : a === -1 ? '-' : String(a)
  // Two roots at zero would give `xx`, which is not how anyone writes it.
  const body = r1 === 0 && r2 === 0 ? 'x^2' : `${bracket(r1)}${bracket(r2)}`
  return `${head}${body}`
}

/**
 * The two whole numbers behind `x² + bx + c`: sum −b, product c. Null when
 * there is no such pair, which is exactly when the roots are not whole.
 */
export function vietaPair(b: number, c: number): [number, number] | null {
  const roots = solveQuad({ a: 1, b, c })
  if (roots.kind === 'none') return null
  const r1 = Math.round(roots.x1 as number)
  const r2 = Math.round(roots.x2 as number)
  if (r1 + r2 !== -b || r1 * r2 !== c) return null
  return [r1, r2]
}

/** Two ordinary ones, then the two shapes worth recognising on sight. */
export const FACTOR_PRESETS: readonly Quad[] = [
  { a: 1, b: -5, c: 6 },
  { a: 1, b: 2, c: -3 },
  { a: 1, b: -4, c: 0 },
  { a: 1, b: 0, c: -9 },
]

/** `x² − 7x + 12 = 0`, roots sorted. */
export const FACTOR_ANSWER = '3|4'

/* ------------------------------------------------------------------ */
/* 3. Completing the square                                            */
/* ------------------------------------------------------------------ */

/** One line of a worked solution, with the key of the move that produced it. */
export interface QuadStep {
  tex: string
  noteKey: string
}

/** `(x + 3)`, `(x - 3)`, or plain `x` when there is nothing to add. */
function baseTex(h: number): string {
  if (h === 0) return 'x'
  return `(x ${h < 0 ? '-' : '+'} ${Math.abs(h)})`
}

/** `x + 3`, `x - 3`, `x`: the same base without the brackets. */
function bareBaseTex(h: number): string {
  if (h === 0) return 'x'
  return `x ${h < 0 ? '-' : '+'} ${Math.abs(h)}`
}

/** `2\sqrt{3}`, `5`, `\sqrt{5}`. */
function rootValueTex(k: number): string {
  if (isPerfectSquare(k)) return String(Math.sqrt(k))
  if (!Number.isInteger(k)) return `\\sqrt{${k}}`
  const { outside, inside } = simplifyRoot(k)
  return outside === 1 ? `\\sqrt{${inside}}` : `${outside}\\sqrt{${inside}}`
}

/** `-3 + \sqrt{5}`, `2`, `-\sqrt{5}`: the root once the base is undone. */
function shiftedRootTex(h: number, k: number, plus: boolean): string {
  if (isPerfectSquare(k)) {
    const s = Math.sqrt(k)
    return String(plus ? -h + s : -h - s)
  }
  const value = rootValueTex(k)
  if (h === 0) return plus ? value : `-${value}`
  return `${-h} ${plus ? '+' : '-'} ${value}`
}

/**
 * `x² + px + q = 0` solved by completing the square, one line per move.
 *
 * The right side after isolating the square is the whole story: positive gives
 * two roots, zero gives one, negative gives none — and in that last case the
 * steps stop there rather than pretending a root exists.
 */
export function completeSolveSteps(p: number, q: number): QuadStep[] {
  const h = p / 2
  const k = h * h - q
  const start = polyTex([
    { coef: 1, part: 'x^2' },
    { coef: p, part: 'x' },
    { coef: q, part: '' },
  ])
  const shift = termTex({ coef: -k, part: '' }, false)
  const completed = shift === '' ? `${baseTex(h)}^2` : `${baseTex(h)}^2 ${shift}`

  const steps: QuadStep[] = [{ tex: `${start} = 0`, noteKey: 'quad.stepStart' }]
  // With b = 0 there is nothing to complete: the square is already there, and
  // a "completed" line would only repeat the one above it.
  if (h !== 0) steps.push({ tex: `${completed} = 0`, noteKey: 'quad.stepComplete' })

  if (k < 0) {
    steps.push({ tex: `${baseTex(h)}^2 = ${k}`, noteKey: 'quad.stepNoRoot' })
    return steps
  }

  // With k = 0 the completed line already reads `(x + h)² = 0`: repeating it
  // as an "isolate" step would show the same line twice.
  if (k === 0) {
    if (h === 0) return [...steps, { tex: 'x = 0', noteKey: 'quad.stepRootZero' }]
    steps.push({ tex: `${bareBaseTex(h)} = 0`, noteKey: 'quad.stepRootZero' })
    steps.push({ tex: `x = ${-h}`, noteKey: 'quad.stepSolve' })
    return steps
  }

  steps.push({ tex: `${baseTex(h)}^2 = ${k}`, noteKey: 'quad.stepIsolate' })

  const value = rootValueTex(k)
  steps.push({
    tex: `${bareBaseTex(h)} = ${value} \\text{ ${OR_TOKEN} } ${bareBaseTex(h)} = -${value}`,
    noteKey: 'quad.stepRoot',
  })
  // With h = 0 the line above already reads `x = …`: there is nothing to
  // subtract, so the last move would produce the same line again.
  if (h !== 0) {
    steps.push({
      tex: `x = ${shiftedRootTex(h, k, true)} \\text{ ${OR_TOKEN} } x = ${shiftedRootTex(h, k, false)}`,
      noteKey: 'quad.stepSolve',
    })
  }
  return steps
}

/** Two roots, one root, none — and a right side that is not a square. */
export const COMPLETE_PRESETS: readonly { p: number; q: number }[] = [
  { p: 6, q: 5 },
  { p: -4, q: -12 },
  { p: 2, q: 1 },
  { p: 4, q: 7 },
]

/** `x² − 4x − 12 = 0`, roots sorted. */
export const COMPLETE_ANSWER = '-2|6'

/* ------------------------------------------------------------------ */
/* 4. The formula, derived twice at once                               */
/* ------------------------------------------------------------------ */

/** One row of the derivation: the same move in letters and in numbers. */
export interface ParallelStep {
  general: string
  concrete: string
  noteKey: string
}

/** `+ \frac{3}{2}x`, `- 1`, `` — one term of the divided-through equation. */
function fracTermTex(f: Frac, part: string, leading: boolean): string {
  if (f.p === 0) return ''
  const abs = frac(Math.abs(f.p), f.q)
  const body = part !== '' && abs.p === 1 && abs.q === 1 ? part : `${fracTex(abs)}${part}`
  if (leading) return f.p < 0 ? `-${body}` : body
  return f.p < 0 ? `- ${body}` : `+ ${body}`
}

/** `x^2 + \frac{3}{2}x - 1 = 0`. */
function dividedTex(q: Quad): string {
  const pieces = [
    'x^2',
    fracTermTex(frac(q.b, q.a), 'x', false),
    fracTermTex(frac(q.c, q.a), '', false),
  ].filter((piece) => piece !== '')
  return `${pieces.join(' ')} = 0`
}

/** `\left(x + \frac{3}{4}\right)^2 = \frac{25}{16}`. */
function completedTex(q: Quad): string {
  const half = frac(q.b, 2 * q.a)
  const inner =
    half.p === 0 ? 'x^2' : `\\left(x ${half.p < 0 ? '-' : '+'} ${fracTex(frac(Math.abs(half.p), half.q))}\\right)^2`
  return `${inner} = ${fracTex(frac(discriminant(q), 4 * q.a * q.a))}`
}

/** `x + \frac{3}{4} = \pm\frac{5}{4}`, or `x - 3 = 0` when D is zero. */
function parRootTex(q: Quad): string {
  const half = frac(q.b, 2 * q.a)
  const left = half.p === 0 ? 'x' : `x ${half.p < 0 ? '-' : '+'} ${fracTex(frac(Math.abs(half.p), half.q))}`
  const d = discriminant(q)
  if (d === 0) return `${left} = 0`
  if (isPerfectSquare(d)) return `${left} = \\pm ${fracTex(frac(Math.sqrt(d), 2 * q.a))}`
  const { outside, inside } = simplifyRoot(d)
  const top = outside === 1 ? `\\sqrt{${inside}}` : `${outside}\\sqrt{${inside}}`
  return `${left} = \\pm \\frac{${top}}{${2 * q.a}}`
}

/** `x = \frac{-3 \pm 5}{4}`: the formula with this equation's numbers in it. */
function parFormulaTex(q: Quad): string {
  const d = discriminant(q)
  if (d === 0) return `x = ${exactTex(-q.b / (2 * q.a))}`
  if (isPerfectSquare(d)) return `x = \\frac{${-q.b} \\pm ${Math.sqrt(d)}}{${2 * q.a}}`
  return `x = ${pmTex(q)}`
}

/**
 * Completing the square done in letters and on one concrete equation side by
 * side, so the formula arrives as a shorthand for a familiar move rather than
 * as something to memorise.
 *
 * A negative discriminant stops the derivation at the line that shows why: a
 * square would have to equal a negative number.
 */
export function parallelSteps(q: Quad): ParallelStep[] {
  const d = discriminant(q)
  const steps: ParallelStep[] = [
    { general: 'ax^2 + bx + c = 0', concrete: `${quadTex(q)} = 0`, noteKey: 'quad.parStart' },
    {
      general: 'x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0',
      concrete: dividedTex(q),
      // With a = 1 the line does not change, and saying so is better than
      // leaving the reader to wonder what the step did.
      noteKey: q.a === 1 ? 'quad.parDivideOne' : 'quad.parDivide',
    },
    {
      general: '\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}',
      concrete: completedTex(q),
      noteKey: d < 0 ? 'quad.parNoRoot' : 'quad.parComplete',
    },
  ]
  if (d < 0) return steps

  steps.push({
    general: 'x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{b^2 - 4ac}}{2a}',
    concrete: parRootTex(q),
    noteKey: 'quad.parRoot',
  })
  steps.push({
    general: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    concrete: parFormulaTex(q),
    noteKey: 'quad.parFormula',
  })
  if (d > 0) steps.push({ general: '', concrete: rootTex(q), noteKey: 'quad.parResult' })
  return steps
}

/** Two roots with a ≠ 1, a double root, no root, and roots of both signs. */
export const FORMULA_PRESETS: readonly Quad[] = [
  { a: 2, b: 3, c: -2 },
  { a: 1, b: -6, c: 9 },
  { a: 1, b: 1, c: 1 },
  { a: 3, b: -5, c: -2 },
]

/** `2x² − 5x + 2 = 0`, roots sorted and written as decimals. */
export const FORMULA_ANSWER = '0.5|2'

/* ------------------------------------------------------------------ */
/* 5. The discriminant and the parabola                                */
/* ------------------------------------------------------------------ */

/** `x² + 4x + c = 0` has one root exactly when 16 − 4c = 0. */
export const DISC_ANSWER = 4

/* ------------------------------------------------------------------ */
/* 6. Quadratic inequalities                                           */
/* ------------------------------------------------------------------ */

export type QuadIneqSet =
  | { kind: 'between'; lo: number; hi: number; closed: boolean }
  | { kind: 'outside'; lo: number; hi: number; closed: boolean }
  | { kind: 'all' }
  | { kind: 'none' }
  | { kind: 'allBut'; x: number }
  | { kind: 'only'; x: number }

/** The other way round: `<` becomes `>`, `≤` becomes `≥`. */
function mirror(rel: Rel): Rel {
  return rel === 'lt' ? 'gt' : rel === 'gt' ? 'lt' : rel === 'le' ? 'ge' : 'le'
}

/**
 * Where `ax² + bx + c rel 0` holds.
 *
 * A downward parabola is turned upward first — multiplying by −1 flips the
 * relation sign — so the rest of the reasoning only ever has to picture a
 * parabola opening upwards.
 */
export function solveQuadIneq(q: Quad, rel: Rel): QuadIneqSet {
  if (q.a < 0) return solveQuadIneq({ a: -q.a, b: -q.b, c: -q.c }, mirror(rel))

  const roots = solveQuad(q)
  const closed = rel === 'le' || rel === 'ge'
  const below = rel === 'lt' || rel === 'le'

  if (roots.kind === 'none') return below ? { kind: 'none' } : { kind: 'all' }
  if (roots.kind === 'one') {
    const x = roots.x1 as number
    if (rel === 'lt') return { kind: 'none' }
    if (rel === 'le') return { kind: 'only', x }
    if (rel === 'gt') return { kind: 'allBut', x }
    return { kind: 'all' }
  }
  const lo = roots.x1 as number
  const hi = roots.x2 as number
  return below ? { kind: 'between', lo, hi, closed } : { kind: 'outside', lo, hi, closed }
}

/** Does the inequality hold at this x? The test point of the section. */
export function holdsQuad(q: Quad, rel: Rel, x: number): boolean {
  const v = quadValue(q, x)
  if (rel === 'lt') return v < 0
  if (rel === 'le') return v <= 0
  if (rel === 'gt') return v > 0
  return v >= 0
}

/** `-2 < x < 3`, `x < -2 OR x > 3`, `x \ne 2`, `x \in \mathbb{R}`. */
export function quadIneqSetTex(s: QuadIneqSet): string {
  if (s.kind === 'all') return 'x \\in \\mathbb{R}'
  if (s.kind === 'none') return 'x \\in \\emptyset'
  if (s.kind === 'only') return `x = ${s.x}`
  if (s.kind === 'allBut') return `x \\ne ${s.x}`
  const sign = s.closed ? '\\le' : '<'
  if (s.kind === 'between') return `${s.lo} ${sign} x ${sign} ${s.hi}`
  const flipped = s.closed ? '\\ge' : '>'
  return `x ${sign} ${s.lo} \\text{ ${OR_TOKEN} } x ${flipped} ${s.hi}`
}

/** The four shapes a quadratic inequality's answer can take. */
export const QINEQ_PRESETS: readonly { id: string; q: Quad; rel: Rel }[] = [
  { id: 'below', q: { a: 1, b: -1, c: -6 }, rel: 'lt' },
  { id: 'above', q: { a: 1, b: -1, c: -6 }, rel: 'gt' },
  { id: 'touch', q: { a: 1, b: -4, c: 4 }, rel: 'gt' },
  { id: 'never', q: { a: 1, b: 0, c: 1 }, rel: 'lt' },
]

/** The four answers offered for `x² − 4 ≥ 0`. */
export const QINEQ_OPTIONS: readonly { id: string; tex: string }[] = [
  { id: 'between2', tex: '-2 \\le x \\le 2' },
  { id: 'outside2', tex: `x \\le -2 \\text{ ${OR_TOKEN} } x \\ge 2` },
  { id: 'ge2', tex: 'x \\ge 2' },
  { id: 'all', tex: 'x \\in \\mathbb{R}' },
]

export const QINEQ_TASK: { q: Quad; rel: Rel } = { q: { a: 1, b: 0, c: -4 }, rel: 'ge' }

export const QINEQ_ANSWER = 'outside2'

/* ------------------------------------------------------------------ */
/* 7. Equations that reduce to a quadratic                             */
/* ------------------------------------------------------------------ */

export interface ReducePreset {
  id: string
  givenTex: string
  /** The expression that gets a name of its own: `x^2`, `x - 1`. */
  exprTex: string
  /** That naming written out: `u = x^2`. */
  subTex: string
  reduced: Quad
  uRoots: number[]
  xRoots: number[]
  /** The u values no x can produce, dropped on the way back. */
  rejectedU: number[]
  back: (u: number) => number[]
}

/** `u = x²` is never negative, so a negative u has no x behind it. */
const backFromSquare = (u: number): number[] => (u < 0 ? [] : u === 0 ? [0] : [-Math.sqrt(u), Math.sqrt(u)])

/** `u = x − 1` can be anything, so every u gives exactly one x. */
const backFromShift = (u: number): number[] => [u + 1]

function preset(
  id: string,
  givenTex: string,
  exprTex: string,
  reduced: Quad,
  back: (u: number) => number[]
): ReducePreset {
  const roots = solveQuad(reduced)
  const uRoots = roots.kind === 'none' ? [] : roots.kind === 'one' ? [roots.x1 as number] : [roots.x1 as number, roots.x2 as number]
  const xRoots = uRoots.flatMap(back).sort((a, b) => a - b)
  return {
    id,
    givenTex,
    exprTex,
    subTex: `u = ${exprTex}`,
    reduced,
    uRoots,
    xRoots,
    rejectedU: uRoots.filter((u) => back(u).length === 0),
    back,
  }
}

export const REDUCE_PRESETS: readonly ReducePreset[] = [
  preset('biquad', 'x^4 - 5x^2 + 4 = 0', 'x^2', { a: 1, b: -5, c: 4 }, backFromSquare),
  preset('reject', 'x^4 + x^2 - 2 = 0', 'x^2', { a: 1, b: 1, c: -2 }, backFromSquare),
  preset('shift', '(x - 1)^2 - 5(x - 1) + 6 = 0', 'x - 1', { a: 1, b: -5, c: 6 }, backFromShift),
]

/** `x_1 = -2,\ x_2 = -1,\ x_3 = 1,\ x_4 = 2` — however many there are. */
function listTex(letter: string, values: readonly number[]): string {
  if (values.length === 1) return `${letter} = ${values[0]}`
  return values.map((v, i) => `${letter}_{${i + 1}} = ${v}`).join(',\\ ')
}

/**
 * Substitute, solve, come back. The way back is one line per u, and a u that no
 * x can produce gets its own line saying so rather than quietly disappearing.
 */
export function reduceSteps(p: ReducePreset): QuadStep[] {
  const steps: QuadStep[] = [
    { tex: p.givenTex, noteKey: 'quad.stepStart' },
    { tex: p.subTex, noteKey: 'quad.stepSubstitute' },
    { tex: `${quadTex(p.reduced, 'u')} = 0`, noteKey: 'quad.stepReduced' },
    { tex: listTex('u', p.uRoots), noteKey: 'quad.stepURoots' },
  ]
  for (const u of p.uRoots) {
    const xs = p.back(u)
    if (xs.length === 0) {
      steps.push({ tex: `${p.exprTex} = ${u}`, noteKey: 'quad.stepReject' })
    } else if (xs.length === 1) {
      steps.push({ tex: `${p.exprTex} = ${u} \\Rightarrow x = ${xs[0]}`, noteKey: 'quad.stepBack' })
    } else {
      steps.push({
        tex: `${p.exprTex} = ${u} \\Rightarrow x = \\pm ${Math.abs(xs[0])}`,
        noteKey: 'quad.stepBack',
      })
    }
  }
  steps.push({ tex: listTex('x', p.xRoots), noteKey: 'quad.stepXRoots' })
  return steps
}

/** `x⁴ − 10x² + 9 = 0`: u = 1 and u = 9, and each of them gives two x. */
export const REDUCE_ANSWER = 4

/* ------------------------------------------------------------------ */
/* 8. Word problems                                                    */
/* ------------------------------------------------------------------ */

/** One side 3 m longer than the other, 40 m² of garden: x = 5, and −8 is not. */
export const GARDEN = { diff: 3, area: 40 }

export function gardenArea(x: number, g = GARDEN): number {
  return x * (x + g.diff)
}

/** A ball thrown up at 20 m/s: `h = 20t − 5t²`, back on the ground at t = 4. */
export const BALL = { v0: 20, g: 10 }

export function ballHeight(t: number, b = BALL): number {
  return b.v0 * t - (b.g / 2) * t * t
}

/** Two consecutive positive integers with product 56. */
export const WORD_ANSWER = '7|8'
