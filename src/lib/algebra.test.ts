import { describe, expect, it } from 'vitest'
import {
  applyStep,
  completeSquare,
  completeStepsTex,
  COMPLETE_ANSWER,
  diffParts,
  DIFF_ANSWER,
  expandBinomials,
  expandedTex,
  EXPAND_ANSWER,
  FACTOR_EXAMPLES,
  linearTex,
  mentalProduct,
  mentalSquare,
  NEAR_TENS,
  OR_TOKEN,
  polyTex,
  quadValue,
  squareParts,
  SQUARE_ANSWER,
  termTex,
  traceTrick,
  TRICK_ANSWER,
  TRICKS,
  type Linear,
  type Term,
} from './algebra'

describe('terms and polynomials', () => {
  it('hides a coefficient of one in front of letters', () => {
    expect(termTex({ coef: 1, part: 'x' }, true)).toBe('x')
    expect(termTex({ coef: -1, part: 'x' }, true)).toBe('-x')
    expect(termTex({ coef: -1, part: 'x' }, false)).toBe('- x')
  })

  it('keeps a lone one when there are no letters', () => {
    expect(termTex({ coef: 1, part: '' }, true)).toBe('1')
    expect(termTex({ coef: -1, part: '' }, false)).toBe('- 1')
  })

  it('drops a zero term', () => {
    expect(termTex({ coef: 0, part: 'x' }, true)).toBe('')
    expect(termTex({ coef: 0, part: '' }, false)).toBe('')
  })

  it('writes a leading negative term without a plus in front of it', () => {
    expect(polyTex([{ coef: -2, part: 'x' }, { coef: 3, part: '' }])).toBe('-2x + 3')
  })

  it('writes a lone constant', () => {
    expect(polyTex([{ coef: 7, part: '' }])).toBe('7')
  })

  it('calls the empty sum zero', () => {
    expect(polyTex([])).toBe('0')
    expect(polyTex([{ coef: 0, part: 'x' }])).toBe('0')
  })

  it('joins terms with their own signs', () => {
    const terms: Term[] = [
      { coef: 3, part: 'x^2' },
      { coef: 5, part: 'x' },
      { coef: -2, part: 'x^2' },
      { coef: 7, part: '' },
      { coef: -1, part: 'x' },
      { coef: 4, part: '' },
    ]
    expect(polyTex(terms)).toBe('3x^2 + 5x - 2x^2 + 7 - x + 4')
  })
})

describe('number tricks', () => {
  const start: Linear = { a: 1, b: 0 }

  it('keeps the running value linear', () => {
    expect(applyStep(start, { op: 'add', value: 5 })).toEqual({ a: 1, b: 5 })
    expect(applyStep({ a: 1, b: 5 }, { op: 'mul', value: 2 })).toEqual({ a: 2, b: 10 })
    expect(applyStep({ a: 2, b: 10 }, { op: 'sub', value: 10 })).toEqual({ a: 2, b: 0 })
    expect(applyStep({ a: 2, b: 0 }, { op: 'div', value: 2 })).toEqual({ a: 1, b: 0 })
  })

  it('doubles and adds one for the next number', () => {
    expect(applyStep({ a: 1, b: 0 }, { op: 'addNext', value: 0 })).toEqual({ a: 2, b: 1 })
  })

  it('takes the secret number off the x count', () => {
    expect(applyStep({ a: 2, b: 7 }, { op: 'subSecret', value: 0 })).toEqual({ a: 1, b: 7 })
  })

  it('refuses a division that would leave a fraction', () => {
    expect(() => applyStep({ a: 3, b: 1 }, { op: 'div', value: 2 })).toThrow()
  })

  it('divides exactly at every step of every preset', () => {
    for (const trick of TRICKS) {
      expect(() => traceTrick(trick.steps, 7)).not.toThrow()
    }
  })

  it('ends the first trick on the number you thought of', () => {
    const trick = TRICKS.find((tr) => tr.id === 'double')
    const rows = traceTrick(trick?.steps ?? [], 7)
    expect(rows[rows.length - 1].linear).toEqual({ a: 1, b: 0 })
    expect(rows[rows.length - 1].value).toBe(7)
  })

  it('ends the other two on a constant, whatever you thought of', () => {
    for (const [id, expected] of [
      ['three', 3],
      ['five', 5],
    ] as const) {
      const trick = TRICKS.find((tr) => tr.id === id)
      for (const secret of [-20, -1, 0, 7, 20]) {
        const rows = traceTrick(trick?.steps ?? [], secret)
        const last = rows[rows.length - 1]
        expect(last.linear.a).toBe(0)
        expect(last.value).toBe(expected)
      }
    }
  })

  it('reports one row per step', () => {
    expect(traceTrick(TRICKS[0].steps, 3)).toHaveLength(TRICKS[0].steps.length)
  })

  it('writes the running expression the short way', () => {
    expect(linearTex({ a: 1, b: 0 })).toBe('x')
    expect(linearTex({ a: 2, b: 10 })).toBe('2x + 10')
    expect(linearTex({ a: 0, b: 3 })).toBe('3')
    expect(linearTex({ a: -1, b: 4 })).toBe('-x + 4')
    expect(linearTex({ a: 0, b: 0 })).toBe('0')
  })

  it('pins the exercise answer', () => {
    const steps = [
      { op: 'mul', value: 4 },
      { op: 'add', value: 8 },
      { op: 'div', value: 4 },
      { op: 'subSecret', value: 0 },
    ] as const
    const rows = traceTrick(steps, 12)
    expect(rows[rows.length - 1].value).toBe(TRICK_ANSWER)
  })
})

describe('expanding and factoring out', () => {
  it('makes the middle coefficient the sum and the last one the product', () => {
    expect(expandBinomials(3, 2)).toEqual({ x2: 1, x: 5, c: 6 })
    expect(expandedTex(expandBinomials(3, 2))).toBe('x^2 + 5x + 6')
  })

  it('handles negative numbers in the brackets', () => {
    expect(expandBinomials(-5, 5)).toEqual({ x2: 1, x: 0, c: -25 })
    expect(expandedTex(expandBinomials(-5, 5))).toBe('x^2 - 25')
    expect(expandedTex(expandBinomials(-3, -2))).toBe('x^2 - 5x + 6')
  })

  it('offers four sums with a common factor', () => {
    expect(FACTOR_EXAMPLES).toHaveLength(4)
    for (const example of FACTOR_EXAMPLES) {
      expect(example.common).not.toBe('')
      expect(example.rest).not.toBe('')
    }
  })

  it('pins the exercise answer', () => {
    const e = expandBinomials(4, 5)
    expect(`${e.x}|${e.c}`).toBe(EXPAND_ANSWER)
  })
})

describe('the square of a two-term sum', () => {
  it('splits the square into a2, two ab strips and b2', () => {
    expect(squareParts(5, 2, 1)).toEqual({ a2: 25, ab: 10, b2: 4, total: 49 })
    expect(squareParts(5, 2, -1)).toEqual({ a2: 25, ab: 10, b2: 4, total: 9 })
  })

  it('adds up to the whole square', () => {
    const plus = squareParts(7, 3, 1)
    expect(plus.a2 + 2 * plus.ab + plus.b2).toBe(plus.total)
    const minus = squareParts(7, 3, -1)
    expect(minus.a2 - 2 * minus.ab + minus.b2).toBe(minus.total)
  })

  it('rounds to the nearer ten for a mental square', () => {
    expect(mentalSquare(47)).toEqual({ ten: 50, d: -3, tenSq: 2500, cross: -300, dSq: 9, value: 2209 })
    expect(mentalSquare(45)).toEqual({ ten: 40, d: 5, tenSq: 1600, cross: 400, dSq: 25, value: 2025 })
    expect(mentalSquare(30)).toEqual({ ten: 30, d: 0, tenSq: 900, cross: 0, dSq: 0, value: 900 })
  })

  it('keeps the small part at most five', () => {
    for (let n = 11; n <= 99; n++) {
      const m = mentalSquare(n)
      expect(Math.abs(m.d)).toBeLessThanOrEqual(5)
      expect(m.tenSq + m.cross + m.dSq).toBe(m.value)
    }
  })

  it('pins the exercise answer', () => {
    expect(mentalSquare(52).value).toBe(SQUARE_ANSWER)
  })
})

describe('the difference of two squares', () => {
  it('turns the L-shape into a rectangle of the same area', () => {
    const parts = diffParts(5, 2)
    expect(parts).toEqual({ a2: 25, b2: 4, value: 21, width: 7, height: 3 })
    expect(parts.width * parts.height).toBe(parts.value)
  })

  it('offers round numbers to build a product around', () => {
    expect(NEAR_TENS).toContain(100)
    for (const m of NEAR_TENS) expect(m % 10).toBe(0)
  })

  it('does 99 · 101 as 100² − 1²', () => {
    expect(mentalProduct(100, 1)).toEqual({ lo: 99, hi: 101, mSq: 10000, dSq: 1, value: 9999 })
    expect(mentalProduct(50, 3)).toEqual({ lo: 47, hi: 53, mSq: 2500, dSq: 9, value: 2491 })
  })

  it('pins the exercise answer', () => {
    expect(mentalProduct(40, 1).value).toBe(DIFF_ANSWER)
  })
})

describe('the translated "or"', () => {
  it('never writes a Hungarian word into a tex string', () => {
    expect(OR_TOKEN).toBe('OR')
    expect(OR_TOKEN).toMatch(/^[A-Z]+$/)
  })
})

describe('completing the square', () => {
  it('halves p and corrects with its square', () => {
    expect(completeSquare(6, 5)).toEqual({ h: 3, k: -4 })
    expect(completeSquare(-8, 3)).toEqual({ h: -4, k: -13 })
    expect(completeSquare(0, 4)).toEqual({ h: 0, k: 4 })
  })

  it('leaves the value of the expression unchanged', () => {
    for (let p = -10; p <= 10; p += 2) {
      for (let q = -10; q <= 10; q += 5) {
        const { h, k } = completeSquare(p, q)
        for (const x of [-4, 0, 1, 6]) {
          expect((x + h) * (x + h) + k).toBe(quadValue(p, q, x))
        }
      }
    }
  })

  it('takes its smallest value where the bracket is zero', () => {
    const { h, k } = completeSquare(6, 5)
    expect(quadValue(6, 5, -h)).toBe(k)
  })

  it('writes the rewrite as three readable lines', () => {
    expect(completeStepsTex(6, 5)).toEqual(['x^2 + 6x + 5', '(x^2 + 6x + 9) - 9 + 5', '(x + 3)^2 - 4'])
    expect(completeStepsTex(-8, 3)).toEqual([
      'x^2 - 8x + 3',
      '(x^2 - 8x + 16) - 16 + 3',
      '(x - 4)^2 - 13',
    ])
  })

  it('stays readable when p or q is zero', () => {
    expect(completeStepsTex(0, 5)).toEqual(['x^2 + 5', 'x^2 + 5', 'x^2 + 5'])
    expect(completeStepsTex(6, 0)).toEqual(['x^2 + 6x', '(x^2 + 6x + 9) - 9', '(x + 3)^2 - 9'])
    expect(completeStepsTex(6, 9)).toEqual(['x^2 + 6x + 9', '(x^2 + 6x + 9) - 9 + 9', '(x + 3)^2'])
  })

  it('pins the exercise answer', () => {
    const { h, k } = completeSquare(-8, 3)
    expect(`${h}|${k}`).toBe(COMPLETE_ANSWER)
  })
})
