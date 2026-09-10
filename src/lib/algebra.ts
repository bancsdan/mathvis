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
/* 1. Terms and polynomials                                            */
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
/* 3. Expanding brackets and factoring out                             */
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
/* 4. (a + b)² and (a − b)²                                            */
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
/* 5. (a + b)(a − b)                                                   */
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

/** 39 · 41. */
export const DIFF_ANSWER = 1599

/* ------------------------------------------------------------------ */
/* 6. The word "or", for quadratic.ts                                  */
/* ------------------------------------------------------------------ */

/**
 * The word "or" cannot be written into a tex string here — the lesson is
 * translated, and this file never holds Hungarian. A step that needs it carries
 * this token, and the card swaps in the translated word before rendering.
 */
export const OR_TOKEN = 'OR'

/* ------------------------------------------------------------------ */
/* 7. Completing the square                                            */
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
