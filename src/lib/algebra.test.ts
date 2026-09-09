import { describe, expect, it } from 'vitest'
import {
  applyStep,
  collectLike,
  completeSquare,
  completeStepsTex,
  COMPLETE_ANSWER,
  diffParts,
  DIFF_ANSWER,
  divMono,
  EQUATIONS,
  expandBinomials,
  expandedTex,
  EXPAND_ANSWER,
  FACTOR_EXAMPLES,
  family,
  linearTex,
  mentalProduct,
  mentalSquare,
  monoFactors,
  monoTex,
  mulMono,
  NEAR_TENS,
  oddSquareMinusOne,
  OPS_ANSWER,
  OR_TOKEN,
  PATTERN_ANSWER,
  PATTERN_IDS,
  PATTERNS,
  polyTex,
  powMono,
  quadValue,
  squareParts,
  SQUARE_ANSWER,
  TERM_PRESETS,
  TERMS_ANSWER,
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
    expect(polyTex(TERM_PRESETS[0].terms)).toBe('3x^2 + 5x - 2x^2 + 7 - x + 4')
  })
})

describe('collecting like terms', () => {
  const collectedTex = (terms: readonly Term[]) => polyTex(collectLike(terms))

  it('sums the coefficients of each letter part', () => {
    expect(collectedTex(TERM_PRESETS[0].terms)).toBe('x^2 + 4x + 11')
    expect(collectedTex(TERM_PRESETS[1].terms)).toBe('3a + 9b - 3')
  })

  it('drops the parts that cancel out', () => {
    expect(collectLike(TERM_PRESETS[2].terms)).toEqual([{ coef: 5, part: '' }])
  })

  it('keeps first-appearance order rather than sorting', () => {
    const terms: Term[] = [
      { coef: 1, part: '' },
      { coef: 2, part: 'x^2' },
      { coef: 3, part: 'x' },
    ]
    expect(collectLike(terms).map((term) => term.part)).toEqual(['', 'x^2', 'x'])
  })

  it('gives the three families of a preset three different colours', () => {
    expect(family('x^2')).toBe(0)
    expect(family('x')).toBe(1)
    expect(family('')).toBe(2)
    expect(family('a')).toBe(0)
    expect(family('b')).toBe(1)
  })

  it('pins the exercise answer to the letters preset', () => {
    const collected = collectLike(TERM_PRESETS[1].terms)
    expect(collected.map((term) => term.coef).join('|')).toBe(TERMS_ANSWER)
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

describe('monomials', () => {
  it('writes the letters without an exponent of one', () => {
    expect(monoTex({ coef: 6, x: 3, y: 4 })).toBe('6x^{3}y^{4}')
    expect(monoTex({ coef: 1, x: 1, y: 0 })).toBe('x')
    expect(monoTex({ coef: -2, x: 0, y: 1 })).toBe('-2y')
  })

  it('writes a monomial with no letters as its number', () => {
    expect(monoTex({ coef: 5, x: 0, y: 0 })).toBe('5')
    expect(monoTex({ coef: 1, x: 0, y: 0 })).toBe('1')
  })

  it('lists one chip per factor and none for a coefficient of one', () => {
    expect(monoFactors({ coef: 2, x: 2, y: 1 })).toEqual(['2', 'x', 'x', 'y'])
    expect(monoFactors({ coef: 1, x: 1, y: 2 })).toEqual(['x', 'y', 'y'])
  })

  it('multiplies numbers and adds exponents', () => {
    expect(mulMono({ coef: 2, x: 2, y: 1 }, { coef: 3, x: 1, y: 3 })).toEqual({ coef: 6, x: 3, y: 4 })
  })

  it('raises every factor to the power', () => {
    expect(powMono({ coef: 2, x: 2, y: 0 }, 3)).toEqual({ coef: 8, x: 6, y: 0 })
    expect(powMono({ coef: 3, x: 2, y: 1 }, 2)).toEqual({ coef: 9, x: 4, y: 2 })
  })

  it('divides by subtracting exponents', () => {
    expect(divMono({ coef: 6, x: 3, y: 4 }, { coef: 3, x: 1, y: 3 })).toEqual({ coef: 2, x: 2, y: 1 })
  })

  it('refuses a division that leaves the monomials', () => {
    expect(divMono({ coef: 6, x: 1, y: 0 }, { coef: 4, x: 1, y: 0 })).toBeNull()
    expect(divMono({ coef: 6, x: 1, y: 0 }, { coef: 3, x: 2, y: 0 })).toBeNull()
    expect(divMono({ coef: 6, x: 1, y: 0 }, { coef: 3, x: 0, y: 1 })).toBeNull()
  })

  it('undoes a multiplication exactly', () => {
    const a = { coef: 4, x: 3, y: 1 }
    const b = { coef: 7, x: 2, y: 3 }
    expect(divMono(mulMono(a, b), b)).toEqual(a)
  })

  it('pins the exercise answer', () => {
    const squared = powMono({ coef: 3, x: 2, y: 1 }, 2)
    expect(`${squared.coef}|${squared.x}|${squared.y}`).toBe(OPS_ANSWER)
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

  it('makes n² − 1 a multiple of eight for every odd n', () => {
    for (let n = 3; n <= 21; n += 2) {
      const parts = oddSquareMinusOne(n)
      expect(parts.product).toBe(n * n - 1)
      expect(parts.eighth).toBe(Math.round(parts.eighth))
      expect(parts.eighth * 8).toBe(parts.product)
    }
  })

  it('pins the exercise answer', () => {
    expect(mentalProduct(40, 1).value).toBe(DIFF_ANSWER)
  })
})

describe('identities in equations', () => {
  it('offers every pattern id as a choice', () => {
    expect(PATTERN_IDS).toEqual(['plus', 'minus', 'diff', 'none'])
    for (const pattern of PATTERNS) expect(PATTERN_IDS).toContain(pattern.answer)
  })

  it('leaves only the odd one out unfactored', () => {
    for (const pattern of PATTERNS) {
      expect(pattern.factoredTex === '').toBe(pattern.answer === 'none')
    }
  })

  it('pins the exercise answer', () => {
    expect(PATTERN_ANSWER).toBe('plus|diff|minus|none|diff|plus')
    expect(PATTERNS).toHaveLength(6)
  })

  it('starts every equation with itself and names every step', () => {
    for (const eq of EQUATIONS) {
      expect(eq.steps[0].noteKey).toBe('alg.stepStart')
      for (const step of eq.steps) {
        expect(step.tex).not.toBe('')
        expect(step.noteKey.startsWith('alg.')).toBe(true)
      }
    }
  })

  it('keeps every step free of Hungarian, using a token instead', () => {
    const withOr = EQUATIONS.flatMap((eq) => eq.steps).filter((step) => step.tex.includes(OR_TOKEN))
    expect(withOr).toHaveLength(2)
    for (const step of EQUATIONS.flatMap((eq) => eq.steps)) {
      expect(step.tex).not.toMatch(/vagy|és|nem/)
    }
  })

  it('ends each equation on a solved form', () => {
    const last = (id: string) => {
      const eq = EQUATIONS.find((e) => e.id === id)
      return eq?.steps[eq.steps.length - 1].tex ?? ''
    }
    expect(last('linear')).toBe('x = 5')
    expect(last('square')).toBe('x = 3')
    expect(last('diff')).toContain('x = 5')
    expect(last('perfect')).toBe('x = -3')
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
