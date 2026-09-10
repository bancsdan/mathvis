import { describe, expect, it } from 'vitest'
import { OR_TOKEN } from './algebra'
import {
  BALL,
  ballHeight,
  DISC_ANSWER,
  discriminant,
  FACTOR_ANSWER,
  factorTex,
  formulaSubstitutedTex,
  FORMULA_ANSWER,
  FORMULA_PRESETS,
  fracOf,
  fromRoots,
  GARDEN,
  gardenArea,
  holdsQuad,
  LOST_ROOT,
  LOST_ROOT_ANSWER,
  parallelSteps,
  QINEQ_ANSWER,
  QINEQ_OPTIONS,
  QINEQ_PRESETS,
  QINEQ_TASK,
  quadIneqSetTex,
  quadTex,
  quadValue,
  REDUCE_ANSWER,
  REDUCE_PRESETS,
  reduceSteps,
  rootDecimal,
  rootTex,
  solveQuad,
  solveQuadIneq,
  WORD_ANSWER,
  type Quad,
} from './quadratic'

const q = (a: number, b: number, c: number): Quad => ({ a, b, c })

describe('the quadratic itself', () => {
  it('writes the expression with tidy signs and hidden ones', () => {
    expect(quadTex(q(2, -5, 2))).toBe('2x^2 - 5x + 2')
    expect(quadTex(q(1, 0, -4))).toBe('x^2 - 4')
    expect(quadTex(q(-1, 3, 0))).toBe('-x^2 + 3x')
  })

  it('writes the same quadratic in another letter', () => {
    expect(quadTex(q(1, -5, 4), 'u')).toBe('u^2 - 5u + 4')
  })

  it('evaluates and discriminates', () => {
    expect(quadValue(q(1, -1, -6), 3)).toBe(0)
    expect(quadValue(q(2, 0, 1), 2)).toBe(9)
    expect(discriminant(q(2, 3, -2))).toBe(25)
    expect(discriminant(q(1, -6, 9))).toBe(0)
    expect(discriminant(q(1, 1, 1))).toBe(-3)
  })
})

describe('solveQuad', () => {
  it('returns the two roots in order', () => {
    const r = solveQuad(q(1, -5, 6))
    expect(r.kind).toBe('two')
    expect(r.x1).toBe(2)
    expect(r.x2).toBe(3)
    expect(r.exact).toBe(true)
  })

  it('orders the roots even when the parabola opens downwards', () => {
    const r = solveQuad(q(-1, 0, 4))
    expect(r.kind).toBe('two')
    expect(r.x1).toBe(-2)
    expect(r.x2).toBe(2)
  })

  it('reports a double root once, as one', () => {
    const r = solveQuad(q(1, -6, 9))
    expect(r.kind).toBe('one')
    expect(r.x1).toBe(3)
    expect(r.x2).toBe(3)
  })

  it('reports no root and marks it inexact', () => {
    const r = solveQuad(q(1, 1, 1))
    expect(r.kind).toBe('none')
    expect(r.exact).toBe(false)
    expect(r.x1).toBeUndefined()
  })

  it('knows an irrational pair from a rational one', () => {
    expect(solveQuad(q(1, 3, -2)).exact).toBe(false)
    expect(solveQuad(q(2, 3, -2)).exact).toBe(true)
  })

  it('finds the roots of every preset it is offered', () => {
    for (const preset of FORMULA_PRESETS) {
      const roots = solveQuad(preset)
      if (roots.kind === 'none') continue
      expect(quadValue(preset, roots.x1 as number)).toBeCloseTo(0, 9)
      expect(quadValue(preset, roots.x2 as number)).toBeCloseTo(0, 9)
    }
  })
})

describe('writing a root down', () => {
  it('keeps a rational root exact', () => {
    expect(rootTex(q(2, -5, 2))).toBe('x_1 = \\frac{1}{2},\\ x_2 = 2')
    expect(rootTex(q(1, -5, 6))).toBe('x_1 = 2,\\ x_2 = 3')
    expect(rootTex(q(3, -5, -2))).toBe('x_1 = -\\frac{1}{3},\\ x_2 = 2')
  })

  it('keeps the root sign when the roots are irrational', () => {
    expect(rootTex(q(1, 3, -2))).toBe('x_{1,2} = \\frac{-3 \\pm \\sqrt{17}}{2}')
    expect(rootTex(q(1, -2, -1))).toBe('x_{1,2} = 1 \\pm \\sqrt{2}')
  })

  it('writes one root as one, and none as nothing at all', () => {
    expect(rootTex(q(1, -6, 9))).toBe('x = 3')
    expect(rootTex(q(1, 1, 1))).toBe('')
  })

  it('puts every number of the formula in its place, negatives in brackets', () => {
    expect(formulaSubstitutedTex(q(2, -5, 2))).toBe(
      'x_{1,2} = \\frac{-(-5) \\pm \\sqrt{(-5)^2 - 4 \\cdot 2 \\cdot 2}}{2 \\cdot 2}'
    )
  })

  it('rounds a root for prose, and leaves a whole one whole', () => {
    expect(rootDecimal(2, ',')).toBe('2')
    expect(rootDecimal(0.5, ',')).toBe('0,5')
    expect(rootDecimal(-1 / 3, ',')).toBe('−0,33')
  })

  it('reconstructs the fraction behind a rational root', () => {
    expect(fracOf(0.5)).toEqual({ p: 1, q: 2 })
    expect(fracOf(-1 / 3)).toEqual({ p: -1, q: 3 })
    expect(fracOf(4)).toEqual({ p: 4, q: 1 })
    expect(fracOf(Math.SQRT2)).toBeNull()
  })
})

describe('the lost root', () => {
  it('holds the answer of the exercise', () => {
    const [r1, r2] = LOST_ROOT_ANSWER.split('|').map(Number)
    expect(solveQuad({ a: 1, b: -3, c: 0 })).toMatchObject({ x1: r1, x2: r2 })
  })

  it('loses a root when x² = 4x is divided by x', () => {
    const roots = solveQuad(LOST_ROOT.q)
    expect(roots.x1).toBe(0)
    expect(roots.x2).toBe(4)
    expect(quadValue(LOST_ROOT.q, 0)).toBe(0)
  })
})

describe('factoring', () => {
  it('expands a pair of roots back into coefficients', () => {
    expect(fromRoots(2, 3)).toEqual({ a: 1, b: -5, c: 6 })
    expect(fromRoots(-1, 3)).toEqual({ a: 1, b: -2, c: -3 })
    expect(fromRoots(0, 4)).toEqual({ a: 1, b: -4, c: 0 })
  })

  it('writes the factored form with the sign the reader expects', () => {
    expect(factorTex(2, 3)).toBe('(x - 2)(x - 3)')
    expect(factorTex(-1, 3)).toBe('(x + 1)(x - 3)')
    expect(factorTex(0, 4)).toBe('x(x - 4)')
    expect(factorTex(1, -4, 2)).toBe('2(x - 1)(x + 4)')
  })

  it('holds the answer of the exercise', () => {
    const [r1, r2] = FACTOR_ANSWER.split('|').map(Number)
    expect(fromRoots(r1, r2)).toEqual({ a: 1, b: -7, c: 12 })
  })
})

describe('the parallel derivation', () => {
  it('says so when dividing by a changes nothing', () => {
    expect(parallelSteps(q(1, -6, 9))[1].noteKey).toBe('quad.parDivideOne')
    expect(parallelSteps(q(2, 3, -2))[1].noteKey).toBe('quad.parDivide')
  })

  it('runs the concrete column alongside the letters', () => {
    const steps = parallelSteps(q(2, 3, -2))
    expect(steps.map((s) => s.concrete)).toEqual([
      '2x^2 + 3x - 2 = 0',
      'x^2 + \\frac{3}{2}x - 1 = 0',
      '\\left(x + \\frac{3}{4}\\right)^2 = \\frac{25}{16}',
      'x + \\frac{3}{4} = \\pm \\frac{5}{4}',
      'x = \\frac{-3 \\pm 5}{4}',
      'x_1 = -2,\\ x_2 = \\frac{1}{2}',
    ])
    expect(steps.map((s) => s.noteKey)).toEqual([
      'quad.parStart',
      'quad.parDivide',
      'quad.parComplete',
      'quad.parRoot',
      'quad.parFormula',
      'quad.parResult',
    ])
  })

  it('stops where a square would have to be negative', () => {
    const steps = parallelSteps(q(1, 1, 1))
    expect(steps).toHaveLength(3)
    expect(steps[2].noteKey).toBe('quad.parNoRoot')
  })

  it('drops the ± on a double root', () => {
    const steps = parallelSteps(q(1, -6, 9))
    expect(steps.map((s) => s.concrete).slice(3)).toEqual(['x - 3 = 0', 'x = 3'])
  })

  it('keeps the root sign when the discriminant is not a square', () => {
    const steps = parallelSteps(q(1, 3, -2))
    expect(steps[3].concrete).toBe('x + \\frac{3}{2} = \\pm \\frac{\\sqrt{17}}{2}')
    expect(steps[4].concrete).toBe('x = \\frac{-3 \\pm \\sqrt{17}}{2}')
  })

  it('holds the answer of the exercise', () => {
    const roots = solveQuad(q(2, -5, 2))
    expect([roots.x1, roots.x2].map(String).join('|')).toBe(FORMULA_ANSWER)
  })
})

describe('the discriminant exercise', () => {
  it('is the c that leaves x² + 4x + c = 0 with one root', () => {
    expect(discriminant(q(1, 4, DISC_ANSWER))).toBe(0)
    expect(solveQuad(q(1, 4, DISC_ANSWER)).kind).toBe('one')
  })
})

describe('quadratic inequalities', () => {
  it('reads the four shapes off the presets', () => {
    const byId = (id: string) => QINEQ_PRESETS.find((p) => p.id === id) as (typeof QINEQ_PRESETS)[number]
    expect(solveQuadIneq(byId('below').q, byId('below').rel)).toEqual({
      kind: 'between',
      lo: -2,
      hi: 3,
      closed: false,
    })
    expect(solveQuadIneq(byId('above').q, byId('above').rel)).toEqual({
      kind: 'outside',
      lo: -2,
      hi: 3,
      closed: false,
    })
    expect(solveQuadIneq(byId('touch').q, byId('touch').rel)).toEqual({ kind: 'allBut', x: 2 })
    expect(solveQuadIneq(byId('never').q, byId('never').rel)).toEqual({ kind: 'none' })
  })

  it('takes the ends along when the relation is not strict', () => {
    expect(solveQuadIneq(q(1, -1, -6), 'le')).toEqual({ kind: 'between', lo: -2, hi: 3, closed: true })
    expect(solveQuadIneq(q(1, -4, 4), 'le')).toEqual({ kind: 'only', x: 2 })
    expect(solveQuadIneq(q(1, -4, 4), 'ge')).toEqual({ kind: 'all' })
    expect(solveQuadIneq(q(1, -4, 4), 'lt')).toEqual({ kind: 'none' })
    expect(solveQuadIneq(q(1, 0, 1), 'gt')).toEqual({ kind: 'all' })
  })

  it('turns a downward parabola over, sign and all', () => {
    expect(solveQuadIneq(q(-1, 0, 4), 'gt')).toEqual({ kind: 'between', lo: -2, hi: 2, closed: false })
    expect(solveQuadIneq(q(-1, 0, 4), 'lt')).toEqual({ kind: 'outside', lo: -2, hi: 2, closed: false })
  })

  it('agrees with the test point everywhere the answer says it should', () => {
    for (const preset of QINEQ_PRESETS) {
      const set = solveQuadIneq(preset.q, preset.rel)
      for (let x = -6; x <= 6; x += 0.5) {
        const inside =
          set.kind === 'all'
            ? true
            : set.kind === 'none'
              ? false
              : set.kind === 'only'
                ? x === set.x
                : set.kind === 'allBut'
                  ? x !== set.x
                  : set.kind === 'between'
                    ? set.closed
                      ? x >= set.lo && x <= set.hi
                      : x > set.lo && x < set.hi
                    : set.closed
                      ? x <= set.lo || x >= set.hi
                      : x < set.lo || x > set.hi
        expect(holdsQuad(preset.q, preset.rel, x), `${preset.id} at ${x}`).toBe(inside)
      }
    }
  })

  it('writes the solution set the way the lesson does', () => {
    expect(quadIneqSetTex({ kind: 'between', lo: -2, hi: 3, closed: false })).toBe('-2 < x < 3')
    expect(quadIneqSetTex({ kind: 'between', lo: -2, hi: 3, closed: true })).toBe('-2 \\le x \\le 3')
    expect(quadIneqSetTex({ kind: 'outside', lo: -2, hi: 3, closed: false })).toBe(
      `x < -2 \\text{ ${OR_TOKEN} } x > 3`
    )
    expect(quadIneqSetTex({ kind: 'allBut', x: 2 })).toBe('x \\ne 2')
    expect(quadIneqSetTex({ kind: 'only', x: 2 })).toBe('x = 2')
    expect(quadIneqSetTex({ kind: 'all' })).toBe('x \\in \\mathbb{R}')
    expect(quadIneqSetTex({ kind: 'none' })).toBe('x \\in \\emptyset')
  })

  it('holds the answer of the exercise', () => {
    const set = solveQuadIneq(QINEQ_TASK.q, QINEQ_TASK.rel)
    const chosen = QINEQ_OPTIONS.find((o) => o.id === QINEQ_ANSWER)
    expect(chosen).toBeDefined()
    expect((chosen as { tex: string }).tex).toBe(quadIneqSetTex(set))
  })
})

describe('reducing to a quadratic', () => {
  it('carries the right u and x roots for every preset', () => {
    const byId = (id: string) => REDUCE_PRESETS.find((p) => p.id === id) as (typeof REDUCE_PRESETS)[number]
    expect(byId('biquad').uRoots).toEqual([1, 4])
    expect(byId('biquad').xRoots).toEqual([-2, -1, 1, 2])
    expect(byId('biquad').rejectedU).toEqual([])
    expect(byId('reject').uRoots).toEqual([-2, 1])
    expect(byId('reject').xRoots).toEqual([-1, 1])
    expect(byId('reject').rejectedU).toEqual([-2])
    expect(byId('shift').uRoots).toEqual([2, 3])
    expect(byId('shift').xRoots).toEqual([3, 4])
  })

  it('gives the rejected u a line of its own', () => {
    const steps = reduceSteps(REDUCE_PRESETS[1])
    expect(steps.map((s) => s.noteKey)).toEqual([
      'quad.stepStart',
      'quad.stepSubstitute',
      'quad.stepReduced',
      'quad.stepURoots',
      'quad.stepReject',
      'quad.stepBack',
      'quad.stepXRoots',
    ])
    expect(steps[2].tex).toBe('u^2 + u - 2 = 0')
    expect(steps[4].tex).toBe('x^2 = -2')
    expect(steps[5].tex).toBe('x^2 = 1 \\Rightarrow x = \\pm 1')
    expect(steps[6].tex).toBe('x_{1} = -1,\\ x_{2} = 1')
  })

  it('comes back through a shift with one x per u', () => {
    const steps = reduceSteps(REDUCE_PRESETS[2])
    expect(steps[1].tex).toBe('u = x - 1')
    expect(steps[4].tex).toBe('x - 1 = 2 \\Rightarrow x = 3')
  })

  it('holds the answer of the exercise', () => {
    const roots = solveQuad(q(1, -10, 9))
    const xs = [roots.x1, roots.x2].flatMap((u) => [-Math.sqrt(u as number), Math.sqrt(u as number)])
    expect(xs).toHaveLength(REDUCE_ANSWER)
  })
})

describe('word problems', () => {
  it('measures the garden, and only one root is a garden', () => {
    expect(gardenArea(5)).toBe(GARDEN.area)
    const roots = solveQuad(q(1, GARDEN.diff, -GARDEN.area))
    expect(roots.x1).toBe(-8)
    expect(roots.x2).toBe(5)
  })

  it('throws the ball up and brings it back down', () => {
    expect(ballHeight(0)).toBe(0)
    expect(ballHeight(2)).toBe(20)
    expect(ballHeight(4)).toBe(0)
    expect(ballHeight(5)).toBeLessThan(0)
    expect(BALL.v0).toBe(20)
  })

  it('holds the answer of the exercise', () => {
    const roots = solveQuad(q(1, 1, -56))
    const x = roots.x2 as number
    expect(`${x}|${x + 1}`).toBe(WORD_ANSWER)
  })
})
