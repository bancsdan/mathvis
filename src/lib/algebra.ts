/**
 * Algebraic expressions, for the Betűs kifejezések lesson. No React, no DOM —
 * everything here is pure so it can be unit tested.
 *
 * Two ideas shape the file. First, a polynomial is a list of `Term`s (a
 * coefficient and a tex atom for the letters), and every tex string on the page
 * is built by `polyTex` from such a list. Writing the sign, hiding a
 * coefficient of 1 and dropping a zero term are exactly the places a lesson
 * page gets ugly, so they are settled once, here, and pinned by tests. Second,
 * the answer to every exercise of the lesson lives here as an exported
 * constant, so the tests own it rather than the page.
 *
 * Nothing in this file ever emits a Hungarian word. Where a step needs one (the
 * "vagy" between two roots), it carries `OR_TOKEN` and the card substitutes the
 * translated word.
 */

/* ------------------------------------------------------------------ */
/* 1. Terms, polynomials, collecting like terms                        */
/* ------------------------------------------------------------------ */

/**
 * One term of a polynomial: a number times a letter part.
 *
 * `part` is a tex atom for the letters alone — `'x^2'`, `'x'`, `'a'`, or the
 * empty string for a constant term. The sign belongs to `coef`.
 */
export interface Term {
  coef: number
  part: string
}

/** `x`, `x^{2}`, or nothing at all when the exponent is 0. */
function letterTex(letter: string, exp: number): string {
  if (exp === 0) return ''
  if (exp === 1) return letter
  return `${letter}^{${exp}}`
}

/**
 * One term with its own sign in front of it.
 *
 * `leading` says whether the term opens the expression: the first term wears a
 * bare minus (`-2x`) or nothing at all, a later one wears a spaced operator
 * (`- 2x`, `+ 7`) so it reads as the operation it is. A coefficient of ±1
 * disappears in front of letters, and a zero term produces nothing.
 */
export function termTex(term: Term, leading: boolean): string {
  if (term.coef === 0) return ''
  const abs = Math.abs(term.coef)
  const body = term.part === '' ? String(abs) : abs === 1 ? term.part : `${abs}${term.part}`
  if (leading) return term.coef < 0 ? `-${body}` : body
  return term.coef < 0 ? `- ${body}` : `+ ${body}`
}

/** The whole expression, zero terms dropped. An empty sum is `0`, not ''. */
export function polyTex(terms: readonly Term[]): string {
  const kept = terms.filter((term) => term.coef !== 0)
  if (kept.length === 0) return '0'
  return kept.map((term, i) => termTex(term, i === 0)).join(' ')
}

/**
 * Add up the terms that share a letter part.
 *
 * Order is first appearance, not sorted: the student is watching chips move
 * together, so the result has to line up with what they started from. Terms
 * that cancel out disappear entirely.
 */
export function collectLike(terms: readonly Term[]): Term[] {
  const order: string[] = []
  const sums = new Map<string, number>()
  for (const term of terms) {
    if (!sums.has(term.part)) order.push(term.part)
    sums.set(term.part, (sums.get(term.part) ?? 0) + term.coef)
  }
  return order.map((part) => ({ coef: sums.get(part) ?? 0, part })).filter((term) => term.coef !== 0)
}

/* ------------------------------------------------------------------ */
/* 2. "Think of a number" tricks                                       */
/* ------------------------------------------------------------------ */

/**
 * One instruction of a number trick.
 *
 * `addNext` adds the number one bigger than the value you are holding
 * (v → 2v + 1) and `subSecret` subtracts the number you first thought of;
 * both are the moves that make a trick feel like mind reading, and both stay
 * linear, which is why the whole trick can be tracked as a·x + b.
 */
export type TrickOp = 'add' | 'sub' | 'mul' | 'div' | 'addNext' | 'subSecret'

export interface TrickStep {
  op: TrickOp
  /** Unused, and 0, for `addNext` and `subSecret`. */
  value: number
}

/** The running value as `a · x + b`, where x is the number the reader thought of. */
export interface Linear {
  a: number
  b: number
}

/**
 * The value after one instruction.
 *
 * Division has to come out whole on both coefficients — a trick that leaves a
 * fraction behind is not a trick anyone can follow in their head — so an
 * inexact division is a programming error rather than a case to render.
 */
export function applyStep(cur: Linear, step: TrickStep): Linear {
  switch (step.op) {
    case 'add':
      return { a: cur.a, b: cur.b + step.value }
    case 'sub':
      return { a: cur.a, b: cur.b - step.value }
    case 'mul':
      return { a: cur.a * step.value, b: cur.b * step.value }
    case 'div': {
      if (step.value === 0 || cur.a % step.value !== 0 || cur.b % step.value !== 0) {
        throw new Error('a trick may only divide exactly')
      }
      return { a: cur.a / step.value, b: cur.b / step.value }
    }
    case 'addNext':
      return { a: cur.a * 2, b: cur.b * 2 + 1 }
    case 'subSecret':
      return { a: cur.a - 1, b: cur.b }
  }
}

/** One row per instruction: the expression after it, and what the reader holds. */
export function traceTrick(
  steps: readonly TrickStep[],
  secret: number,
): { linear: Linear; value: number }[] {
  let cur: Linear = { a: 1, b: 0 }
  return steps.map((step) => {
    cur = applyStep(cur, step)
    return { linear: cur, value: cur.a * secret + cur.b }
  })
}

/** `x`, `2x + 10`, `3`, `-x + 4`. */
export function linearTex(l: Linear): string {
  return polyTex([
    { coef: l.a, part: 'x' },
    { coef: l.b, part: '' },
  ])
}

/**
 * The three tricks of the first section.
 *
 * `double` ends on x, so the reader's own number comes back; the other two end
 * on a constant, so everyone in the room gets the same answer.
 */
export const TRICKS: readonly { id: string; steps: readonly TrickStep[] }[] = [
  {
    id: 'double',
    steps: [
      { op: 'add', value: 5 },
      { op: 'mul', value: 2 },
      { op: 'sub', value: 10 },
      { op: 'div', value: 2 },
    ],
  },
  {
    id: 'three',
    steps: [
      { op: 'mul', value: 3 },
      { op: 'add', value: 9 },
      { op: 'div', value: 3 },
      { op: 'subSecret', value: 0 },
    ],
  },
  {
    id: 'five',
    steps: [
      { op: 'addNext', value: 0 },
      { op: 'add', value: 9 },
      { op: 'div', value: 2 },
      { op: 'subSecret', value: 0 },
    ],
  },
]

/** `mul 4 · add 8 · div 4 · subSecret` always lands on 2. */
export const TRICK_ANSWER = 2

/* ------------------------------------------------------------------ */
/* 3. Like terms                                                       */
/* ------------------------------------------------------------------ */

export const TERM_PRESETS: readonly { id: string; terms: readonly Term[] }[] = [
  {
    id: 'mixed',
    terms: [
      { coef: 3, part: 'x^2' },
      { coef: 5, part: 'x' },
      { coef: -2, part: 'x^2' },
      { coef: 7, part: '' },
      { coef: -1, part: 'x' },
      { coef: 4, part: '' },
    ],
  },
  {
    id: 'letters',
    terms: [
      { coef: 4, part: 'a' },
      { coef: 7, part: 'b' },
      { coef: -1, part: 'a' },
      { coef: 2, part: 'b' },
      { coef: -3, part: '' },
    ],
  },
  {
    id: 'cancel',
    terms: [
      { coef: 2, part: 'x^2' },
      { coef: -3, part: 'x' },
      { coef: 5, part: '' },
      { coef: -2, part: 'x^2' },
      { coef: 3, part: 'x' },
    ],
  },
]

/** Which of the three series colours a term wears. Constants are always the third. */
const FAMILIES: Record<string, number> = { 'x^2': 0, x: 1, a: 0, b: 1, '': 2 }

export function family(part: string): number {
  return FAMILIES[part] ?? 2
}

/** Coefficients of a, b and the constant in 4a + 7b − a + 2b − 3. */
export const TERMS_ANSWER = '3|9|-3'

/* ------------------------------------------------------------------ */
/* 4. Monomials in x and y                                             */
/* ------------------------------------------------------------------ */

/** `coef · x^x · y^y`. An exponent of 0 simply means the letter is absent. */
export interface Monomial {
  coef: number
  x: number
  y: number
}

/** `6x^{3}y^{4}`, `x`, `-2y`, `5`. */
export function monoTex(m: Monomial): string {
  const letters = `${letterTex('x', m.x)}${letterTex('y', m.y)}`
  if (letters === '' || m.coef === 0) return String(m.coef)
  if (m.coef === 1) return letters
  if (m.coef === -1) return `-${letters}`
  return `${m.coef}${letters}`
}

/**
 * The monomial written out one factor per chip: `2x^2y` is `['2','x','x','y']`.
 *
 * A coefficient of 1 contributes no chip, because writing it would suggest a
 * factor the student then has to be told to ignore.
 */
export function monoFactors(m: Monomial): string[] {
  const out: string[] = []
  if (m.coef !== 1) out.push(String(m.coef))
  for (let i = 0; i < m.x; i++) out.push('x')
  for (let i = 0; i < m.y; i++) out.push('y')
  return out
}

export function mulMono(a: Monomial, b: Monomial): Monomial {
  return { coef: a.coef * b.coef, x: a.x + b.x, y: a.y + b.y }
}

export function powMono(a: Monomial, n: number): Monomial {
  let coef = 1
  for (let i = 0; i < n; i++) coef *= a.coef
  return { coef, x: a.x * n, y: a.y * n }
}

/** Null when the quotient is not itself a monomial with whole exponents. */
export function divMono(a: Monomial, b: Monomial): Monomial | null {
  if (b.coef === 0 || a.coef % b.coef !== 0) return null
  if (a.x < b.x || a.y < b.y) return null
  return { coef: a.coef / b.coef, x: a.x - b.x, y: a.y - b.y }
}

/** (3a²b)² = 9a⁴b². */
export const OPS_ANSWER = '9|4|2'

/* ------------------------------------------------------------------ */
/* 5. Expanding brackets and factoring out                             */
/* ------------------------------------------------------------------ */

export interface Expanded {
  x2: number
  x: number
  c: number
}

/** (x + a)(x + b): the middle coefficient is the sum, the last one the product. */
export function expandBinomials(a: number, b: number): Expanded {
  return { x2: 1, x: a + b, c: a * b }
}

export function expandedTex(e: Expanded): string {
  return polyTex([
    { coef: e.x2, part: 'x^2' },
    { coef: e.x, part: 'x' },
    { coef: e.c, part: '' },
  ])
}

/** Sums whose terms share a factor, with that factor and what stays behind. */
export const FACTOR_EXAMPLES: readonly { tex: string; common: string; rest: string }[] = [
  { tex: '6x + 9', common: '3', rest: '2x + 3' },
  { tex: '4x^2 + 6x', common: '2x', rest: '2x + 3' },
  { tex: '5ab - 10a', common: '5a', rest: 'b - 2' },
  { tex: 'x^2 + x', common: 'x', rest: 'x + 1' },
]

/** (x + 4)(x + 5) = x² + 9x + 20. */
export const EXPAND_ANSWER = '9|20'

/* ------------------------------------------------------------------ */
/* 6. (a + b)² and (a − b)²                                            */
/* ------------------------------------------------------------------ */

/**
 * The pieces the square of a two-term sum falls into.
 *
 * `ab` is *one* of the two equal strips, since the whole point of the picture
 * is that the student sees two of them and reads off the 2ab themselves.
 */
export function squareParts(
  a: number,
  b: number,
  sign: 1 | -1,
): { a2: number; ab: number; b2: number; total: number } {
  const side = a + sign * b
  return { a2: a * a, ab: a * b, b2: b * b, total: side * side }
}

/**
 * A two-digit square done as a square of a round ten plus or minus a little.
 *
 * The last digit decides the direction: up to 5 the ten below is nearer, above
 * it the ten above, so the small part never grows past 5 and its square stays
 * something you can hold in your head.
 */
export function mentalSquare(n: number): {
  ten: number
  d: number
  tenSq: number
  cross: number
  dSq: number
  value: number
} {
  const r = n % 10
  const ten = r <= 5 ? n - r : n + (10 - r)
  const d = n - ten
  return { ten, d, tenSq: ten * ten, cross: 2 * ten * d, dSq: d * d, value: n * n }
}

/** 52². */
export const SQUARE_ANSWER = 2704

/* ------------------------------------------------------------------ */
/* 7. (a + b)(a − b)                                                   */
/* ------------------------------------------------------------------ */

/**
 * The L-shape left when a b×b corner is cut from an a×a square, and the
 * rectangle it turns into once the strip is moved: (a + b) wide, (a − b) high.
 */
export function diffParts(
  a: number,
  b: number,
): { a2: number; b2: number; value: number; width: number; height: number } {
  return { a2: a * a, b2: b * b, value: a * a - b * b, width: a + b, height: a - b }
}

/** Round numbers worth building a mental product around. */
export const NEAR_TENS: readonly number[] = [20, 30, 50, 100]

/** 99 · 101 = 100² − 1² = 9999. */
export function mentalProduct(
  m: number,
  d: number,
): { lo: number; hi: number; mSq: number; dSq: number; value: number } {
  return { lo: m - d, hi: m + d, mSq: m * m, dSq: d * d, value: m * m - d * d }
}

/**
 * n² − 1 for an odd n, as the product of its two even neighbours.
 *
 * Both neighbours are even and one of them is a multiple of 4, so the product
 * is always a multiple of 8 — `eighth` is what is left after dividing it out.
 */
export function oddSquareMinusOne(n: number): {
  lo: number
  hi: number
  product: number
  eighth: number
} {
  const product = (n - 1) * (n + 1)
  return { lo: n - 1, hi: n + 1, product, eighth: product / 8 }
}

/** 39 · 41. */
export const DIFF_ANSWER = 1599

/* ------------------------------------------------------------------ */
/* 8. Identities in equations                                          */
/* ------------------------------------------------------------------ */

export type PatternId = 'plus' | 'minus' | 'diff' | 'none'

export const PATTERN_IDS: readonly PatternId[] = ['plus', 'minus', 'diff', 'none']

export const PATTERNS: readonly { id: string; tex: string; answer: PatternId; factoredTex: string }[] = [
  { id: 'p1', tex: 'x^2 + 6x + 9', answer: 'plus', factoredTex: '(x + 3)^2' },
  { id: 'p2', tex: 'x^2 - 25', answer: 'diff', factoredTex: '(x - 5)(x + 5)' },
  { id: 'p3', tex: 'x^2 - 10x + 25', answer: 'minus', factoredTex: '(x - 5)^2' },
  { id: 'p4', tex: 'x^2 + 4', answer: 'none', factoredTex: '' },
  { id: 'p5', tex: '4x^2 - 9', answer: 'diff', factoredTex: '(2x - 3)(2x + 3)' },
  { id: 'p6', tex: '9x^2 + 12x + 4', answer: 'plus', factoredTex: '(3x + 2)^2' },
]

export const PATTERN_ANSWER = PATTERNS.map((p) => p.answer).join('|')

/**
 * The word "or" cannot be written into a tex string here — the lesson is
 * translated, and this file never holds Hungarian. A step that needs it carries
 * this token, and the card swaps in the translated word before rendering.
 */
export const OR_TOKEN = 'OR'

export interface SolveStep {
  tex: string
  /** An `alg.` key naming the transformation that produced this line. */
  noteKey: string
}

export const EQUATIONS: readonly { id: string; steps: readonly SolveStep[] }[] = [
  {
    id: 'linear',
    steps: [
      { tex: '3(x + 2) = 2x + 11', noteKey: 'alg.stepStart' },
      { tex: '3x + 6 = 2x + 11', noteKey: 'alg.stepExpand' },
      { tex: 'x + 6 = 11', noteKey: 'alg.stepSubBoth' },
      { tex: 'x = 5', noteKey: 'alg.stepSubBoth' },
    ],
  },
  {
    id: 'square',
    steps: [
      { tex: '(x + 1)^2 = x^2 + 7', noteKey: 'alg.stepStart' },
      { tex: 'x^2 + 2x + 1 = x^2 + 7', noteKey: 'alg.stepIdentity' },
      { tex: '2x + 1 = 7', noteKey: 'alg.stepCancelSq' },
      { tex: '2x = 6', noteKey: 'alg.stepSubBoth' },
      { tex: 'x = 3', noteKey: 'alg.stepDivBoth' },
    ],
  },
  {
    id: 'diff',
    steps: [
      { tex: 'x^2 - 25 = 0', noteKey: 'alg.stepStart' },
      { tex: '(x - 5)(x + 5) = 0', noteKey: 'alg.stepFactorDiff' },
      { tex: `x - 5 = 0 \\text{ ${OR_TOKEN} } x + 5 = 0`, noteKey: 'alg.stepZeroProduct' },
      { tex: `x = 5 \\text{ ${OR_TOKEN} } x = -5`, noteKey: 'alg.stepSubBoth' },
    ],
  },
  {
    id: 'perfect',
    steps: [
      { tex: 'x^2 + 6x + 9 = 0', noteKey: 'alg.stepStart' },
      { tex: '(x + 3)^2 = 0', noteKey: 'alg.stepFactorSquare' },
      { tex: 'x + 3 = 0', noteKey: 'alg.stepZeroSquare' },
      { tex: 'x = -3', noteKey: 'alg.stepSubBoth' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* 9. Completing the square                                            */
/* ------------------------------------------------------------------ */

/** x² + px + q = (x + h)² + k. */
export function completeSquare(p: number, q: number): { h: number; k: number } {
  const h = p / 2
  return { h, k: q - h * h }
}

export function quadValue(p: number, q: number, x: number): number {
  return x * x + p * x + q
}

/**
 * The three lines of the rewrite, so the added-and-taken-away h² stays visible.
 *
 * With h = 0 there is nothing to add, so the middle line drops the bracket
 * rather than showing an empty one, and the last line drops the `(x + 0)`.
 */
export function completeStepsTex(p: number, q: number): string[] {
  const { h, k } = completeSquare(p, q)
  const start = polyTex([
    { coef: 1, part: 'x^2' },
    { coef: p, part: 'x' },
    { coef: q, part: '' },
  ])

  const middle =
    h === 0
      ? polyTex([
          { coef: 1, part: 'x^2' },
          { coef: q, part: '' },
        ])
      : [
          `(${polyTex([
            { coef: 1, part: 'x^2' },
            { coef: p, part: 'x' },
            { coef: h * h, part: '' },
          ])})`,
          termTex({ coef: -h * h, part: '' }, false),
          termTex({ coef: q, part: '' }, false),
        ]
          .filter((piece) => piece !== '')
          .join(' ')

  const square = h === 0 ? 'x^2' : `(x ${h < 0 ? '-' : '+'} ${Math.abs(h)})^2`
  const tail = termTex({ coef: k, part: '' }, false)
  const end = tail === '' ? square : `${square} ${tail}`

  return [start, middle, end]
}

/** x² − 8x + 3 = (x − 4)² − 13. */
export const COMPLETE_ANSWER = '-4|-13'
