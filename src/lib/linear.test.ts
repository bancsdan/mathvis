import { describe, expect, it } from 'vitest'
import {
  additionSteps,
  applyOp,
  BALANCE_ANSWER,
  BALANCE_START,
  balanceTex,
  balanceTilt,
  BASE_SETS,
  canApply,
  checkSystem,
  DATA_ANSWER,
  DATA_VARIANTS,
  equationTex,
  evalSide,
  flip,
  frac,
  fracPlain,
  fracTex,
  GRAPH_ANSWER,
  GRAPH_PRESET,
  holds,
  inBase,
  INEQ_ANSWER,
  INEQ_OPTIONS,
  INEQ_PRESETS,
  INEQ_TASK,
  ineqTex,
  isSolved,
  lineValues,
  meetingTime,
  MEETING,
  MIX,
  mixConcentration,
  mixSolve,
  MODEL_ANSWER,
  MONEY,
  moneySplit,
  plainValue,
  positions,
  rowTex,
  rowY,
  rowYTex,
  SET_ANSWER,
  SET_PRESETS,
  SET_TASK,
  sideTex,
  solutionSet,
  solutionSetTex,
  solveIneq,
  solveLinear,
  solveSteps,
  solveSystem,
  substitutionSteps,
  SYSGRAPH_ANSWER,
  SYSGRAPH_PRESETS,
  SYSTEM_ANSWER,
  SYSTEM_PRESETS,
  SYSTEM_TASK,
  systemTex,
  togetherTime,
  WORK,
  workDone,
} from './linear'

const side = (a: number, b: number) => ({ a, b })

describe('fractions and sides', () => {
  it('writes a whole number without a fraction bar', () => {
    expect(fracTex(frac(10, 2))).toBe('5')
    expect(fracTex(frac(3, 2))).toBe('\\frac{3}{2}')
    expect(fracTex(frac(3, -2))).toBe('-\\frac{3}{2}')
  })

  it('keeps the sign on the numerator and the denominator positive', () => {
    expect(frac(-6, -4)).toEqual({ p: 3, q: 2 })
    expect(frac(6, -4)).toEqual({ p: -3, q: 2 })
  })

  it('writes a fraction for prose as a decimal only where the decimal stops', () => {
    expect(fracPlain(frac(3, 2), ',')).toBe('1,5')
    expect(fracPlain(frac(-3, 2), ',')).toBe('−1,5')
    expect(fracPlain(frac(5, 1), ',')).toBe('5')
    expect(fracPlain(frac(2, 7), ',')).toBe('2/7')
  })

  it('writes plain numbers with the reader s separator', () => {
    expect(plainValue(1.8, ',')).toBe('1,8')
    expect(plainValue(2, '.')).toBe('2')
    expect(plainValue(-0.5, ',')).toBe('−0,5')
  })

  it('tidies coefficients of 1 and drops zero terms in a side', () => {
    expect(sideTex(side(3, 2))).toBe('3x + 2')
    expect(sideTex(side(1, 0))).toBe('x')
    expect(sideTex(side(-1, 7))).toBe('-x + 7')
    expect(sideTex(side(0, 8))).toBe('8')
    expect(equationTex(side(3, 2), side(1, 8))).toBe('3x + 2 = x + 8')
  })

  it('evaluates a side', () => {
    expect(evalSide(side(3, 2), 5)).toBe(17)
    expect(evalSide(side(0, 8), 5)).toBe(8)
  })
})

describe('solveLinear', () => {
  it('finds the single root', () => {
    expect(solveLinear(side(3, 2), side(1, 8))).toEqual({ kind: 'one', x: { p: 3, q: 1 } })
    expect(solveLinear(side(2, 5), side(0, 8))).toEqual({ kind: 'one', x: { p: 3, q: 2 } })
  })

  it('sees an identity and a contradiction', () => {
    expect(solveLinear(side(2, 6), side(2, 6)).kind).toBe('all')
    expect(solveLinear(side(1, 1), side(1, 2)).kind).toBe('none')
  })

  it('agrees with the exercise answers of the lesson', () => {
    expect(solveLinear(side(5, -7), side(2, 8))).toEqual({
      kind: 'one',
      x: { p: BALANCE_ANSWER, q: 1 },
    })
    const graph = solveLinear(GRAPH_PRESET.l, GRAPH_PRESET.r)
    expect(graph).toEqual({ kind: 'one', x: { p: GRAPH_ANSWER, q: 1 } })
    expect(evalSide(GRAPH_PRESET.l, GRAPH_ANSWER)).toBe(evalSide(GRAPH_PRESET.r, GRAPH_ANSWER))
  })
})

describe('solveSteps', () => {
  it('moves x left, numbers right, then divides', () => {
    expect(solveSteps(side(4, -3), side(2, 1)).map((s) => s.tex)).toEqual([
      '4x - 3 = 2x + 1',
      '2x - 3 = 1',
      '2x = 4',
      'x = 2',
    ])
  })

  it('leaves out a step that would change nothing', () => {
    expect(solveSteps(side(2, 5), side(0, 8)).map((s) => s.tex)).toEqual([
      '2x + 5 = 8',
      '2x = 3',
      'x = \\frac{3}{2}',
    ])
  })

  it('ends at 0 = 0 for an identity and 0 = 1 for a contradiction', () => {
    expect(solveSteps(side(2, 6), side(2, 6)).map((s) => s.tex)).toEqual([
      '2x + 6 = 2x + 6',
      '6 = 6',
      '0 = 0',
    ])
    expect(solveSteps(side(1, 1), side(1, 2)).map((s) => s.tex)).toEqual([
      'x + 1 = x + 2',
      '1 = 2',
      '0 = 1',
    ])
  })
})

describe('the balance', () => {
  it('allows only what both pans can afford', () => {
    expect(canApply(BALANCE_START, { kind: 'removeX', n: 1 })).toBe(true)
    expect(canApply(BALANCE_START, { kind: 'removeX', n: 2 })).toBe(false)
    expect(canApply(BALANCE_START, { kind: 'removeUnits', n: 2 })).toBe(true)
    expect(canApply(BALANCE_START, { kind: 'removeUnits', n: 3 })).toBe(false)
    expect(canApply(BALANCE_START, { kind: 'divide', n: 2 })).toBe(false)
  })

  it('leaves the balance alone when the move is not allowed', () => {
    expect(applyOp(BALANCE_START, { kind: 'removeX', n: 3 })).toEqual(BALANCE_START)
  })

  it('reaches one box against a number of kilos', () => {
    let b = applyOp(BALANCE_START, { kind: 'removeX', n: 1 })
    expect(balanceTex(b)).toBe('2x + 2 = 8')
    b = applyOp(b, { kind: 'removeUnits', n: 2 })
    expect(balanceTex(b)).toBe('2x = 6')
    expect(canApply(b, { kind: 'divide', n: 2 })).toBe(true)
    b = applyOp(b, { kind: 'divide', n: 2 })
    expect(balanceTex(b)).toBe('x = 3')
    expect(isSolved(b)).toBe(true)
  })

  it('finds the same answer along the other order of moves', () => {
    let b = applyOp(BALANCE_START, { kind: 'removeX', n: 1 })
    b = applyOp(b, { kind: 'divide', n: 2 })
    expect(balanceTex(b)).toBe('x + 1 = 4')
    b = applyOp(b, { kind: 'removeUnits', n: 1 })
    expect(isSolved(b)).toBe(true)
    expect(b.right.units).toBe(3)
  })

  it('is not solved while a pan still holds more than a single box', () => {
    expect(isSolved(BALANCE_START)).toBe(false)
    expect(isSolved({ left: { x: 1, units: 1 }, right: { x: 0, units: 4 } })).toBe(false)
  })

  it('stays level all along a legal path and tips for a wrong x', () => {
    expect(balanceTilt(BALANCE_START, 3)).toBe(0)
    expect(balanceTilt(BALANCE_START, 5)).toBe(-1)
    expect(balanceTilt(BALANCE_START, 1)).toBe(1)
  })

  it('writes an empty pan as 0', () => {
    expect(balanceTex({ left: { x: 0, units: 0 }, right: { x: 1, units: 0 } })).toBe('0 = x')
  })
})

describe('base sets and solution sets', () => {
  it('counts 0 as a natural number', () => {
    expect(inBase(frac(0, 1), 'N')).toBe(true)
    expect(inBase(frac(-1, 1), 'N')).toBe(false)
    expect(inBase(frac(-1, 1), 'Z')).toBe(true)
    expect(inBase(frac(3, 2), 'Z')).toBe(false)
    expect(inBase(frac(3, 2), 'Q')).toBe(true)
  })

  it('empties the solution set when the base set has no room for the root', () => {
    const frac32 = solveLinear(side(2, 5), side(0, 8))
    expect(solutionSet(frac32, 'Q')).toEqual({ kind: 'single', x: { p: 3, q: 2 } })
    expect(solutionSet(frac32, 'Z')).toEqual({ kind: 'empty' })
    expect(solutionSet(frac32, 'N')).toEqual({ kind: 'empty' })
  })

  it('gives the whole base set to an identity', () => {
    for (const base of BASE_SETS) {
      const all = solutionSet(solveLinear(side(2, 6), side(2, 6)), base)
      expect(all).toEqual({ kind: 'all' })
      expect(solutionSetTex(all, base)).toBe(`\\mathbb{${base}}`)
    }
  })

  it('writes the three shapes of a solution set', () => {
    expect(solutionSetTex({ kind: 'single', x: frac(5, 1) }, 'Q')).toBe('\\{ 5 \\}')
    expect(solutionSetTex({ kind: 'empty' }, 'Z')).toBe('\\emptyset')
  })

  it('carries presets that show all four outcomes', () => {
    const kinds = SET_PRESETS.map((p) => solveLinear(p.l, p.r).kind)
    expect(kinds).toEqual(['one', 'one', 'all', 'none'])
    expect(solveLinear(SET_PRESETS[1].l, SET_PRESETS[1].r)).toEqual({
      kind: 'one',
      x: { p: 3, q: 2 },
    })
  })

  it('answers its own exercise', () => {
    const set = solutionSet(solveLinear(SET_TASK.l, SET_TASK.r), SET_TASK.base)
    expect(set.kind).toBe(SET_ANSWER)
  })
})

describe('lineValues', () => {
  it('lifts a side over a run of x values', () => {
    expect(lineValues(GRAPH_PRESET.l, [-1, 0, 3])).toEqual([0, 1, 4])
    expect(lineValues(GRAPH_PRESET.r, [-1, 0, 3])).toEqual([8, 7, 4])
  })
})

describe('inequalities', () => {
  it('turns every sign around', () => {
    expect(flip('lt')).toBe('gt')
    expect(flip('gt')).toBe('lt')
    expect(flip('le')).toBe('ge')
    expect(flip('ge')).toBe('le')
  })

  it('writes one line of an inequality', () => {
    expect(ineqTex(side(-2, 3), side(0, 9), 'lt')).toBe('-2x + 3 < 9')
  })

  it('flips the sign exactly when it divides by a negative', () => {
    const flipped = solveIneq(side(-2, 3), side(0, 9), 'lt')
    expect(flipped.rel).toBe('gt')
    expect(flipped.bound).toEqual({ p: -3, q: 1 })
    expect(flipped.steps.map((s) => s.tex)).toEqual(['-2x + 3 < 9', '-2x < 6', 'x > -3'])
    expect(flipped.steps.at(-1)?.flipped).toBe(true)
    expect(flipped.steps.at(-1)?.noteKey).toBe('lin.stepDivideFlip')

    const straight = solveIneq(side(3, -4), side(0, 5), 'le')
    expect(straight.rel).toBe('le')
    expect(straight.bound).toEqual({ p: 3, q: 1 })
    expect(straight.steps.every((s) => !s.flipped)).toBe(true)
  })

  it('collects x from both sides before it divides', () => {
    const both = solveIneq(side(-3, 5), side(2, -10), 'ge')
    expect(both.steps.map((s) => s.tex)).toEqual([
      '-3x + 5 \\ge 2x - 10',
      '-5x + 5 \\ge -10',
      '-5x \\ge -15',
      'x \\le 3',
    ])
    expect(both.rel).toBe('le')
    expect(both.bound).toEqual({ p: 3, q: 1 })
  })

  it('checks a test point against the original inequality', () => {
    const { l, r, rel } = INEQ_PRESETS[0]
    expect(holds(l, r, rel, 0)).toBe(true)
    expect(holds(l, r, rel, -3)).toBe(false)
    expect(holds(l, r, rel, -2)).toBe(true)
  })

  it('agrees with the test point on every whole number of the picture', () => {
    for (const preset of INEQ_PRESETS) {
      const solved = solveIneq(preset.l, preset.r, preset.rel)
      for (let x = -6; x <= 6; x++) {
        const inSolution =
          solved.rel === 'lt'
            ? x < solved.bound.p
            : solved.rel === 'le'
              ? x <= solved.bound.p
              : solved.rel === 'gt'
                ? x > solved.bound.p
                : x >= solved.bound.p
        expect(holds(preset.l, preset.r, preset.rel, x), `${preset.id} at ${x}`).toBe(inSolution)
      }
    }
  })

  it('answers its own exercise', () => {
    const solved = solveIneq(INEQ_TASK.l, INEQ_TASK.r, INEQ_TASK.rel)
    const option = INEQ_OPTIONS.find((o) => o.id === INEQ_ANSWER)
    expect(option?.rel).toBe(solved.rel)
    expect(option?.bound).toBe(solved.bound.p)
  })
})

describe('systems', () => {
  it('writes the rows tidily', () => {
    expect(systemTex(SYSTEM_PRESETS[0].s)).toEqual(['x + y = 10', 'x - y = 4'])
    expect(rowTex(2, 0, 6)).toBe('2x = 6')
    expect(rowTex(-2, -2, -1600)).toBe('-2x - 2y = -1600')
  })

  it('rewrites a row as a function of x', () => {
    expect(rowYTex(1, 1, 5)).toBe('y = -x + 5')
    expect(rowYTex(1, -1, -1)).toBe('y = x + 1')
    expect(rowY(1, 1, 5, 2)).toBe(3)
    expect(rowY(1, -1, -1, 2)).toBe(3)
  })

  it('solves the three presets', () => {
    const answers = SYSTEM_PRESETS.map((p) => solveSystem(p.s))
    expect(answers).toEqual([
      { kind: 'one', x: { p: 7, q: 1 }, y: { p: 3, q: 1 } },
      { kind: 'one', x: { p: 3, q: 1 }, y: { p: 2, q: 1 } },
      { kind: 'one', x: { p: 300, q: 1 }, y: { p: 500, q: 1 } },
    ])
  })

  it('tells the three graphical cases apart', () => {
    const kinds = SYSGRAPH_PRESETS.map((p) => solveSystem(p.s).kind)
    expect(kinds).toEqual(['one', 'none', 'infinite'])
    expect(solveSystem(SYSGRAPH_PRESETS[0].s)).toEqual({
      kind: 'one',
      x: { p: 2, q: 1 },
      y: { p: 3, q: 1 },
    })
    expect(SYSGRAPH_ANSWER).toBe('2|3')
  })

  it('checks a pair row by row', () => {
    expect(checkSystem(SYSTEM_PRESETS[0].s, 7, 3)).toEqual([true, true])
    expect(checkSystem(SYSTEM_PRESETS[0].s, 6, 4)).toEqual([true, false])
  })

  it('walks the substitution of the sum-and-difference system', () => {
    expect(substitutionSteps(SYSTEM_PRESETS[0].s).map((s) => s.tex)).toEqual([
      'y = 10 - x',
      'x - \\left(10 - x\\right) = 4',
      '\\begin{aligned} 2x - 10 &= 4 \\\\ 2x &= 14 \\\\ x &= 7 \\end{aligned}',
      'y = 10 - 7 = 3',
      '7 + 3 = 10 \\;\\checkmark \\qquad 7 - 3 = 4 \\;\\checkmark',
    ])
  })

  it('expresses from the row whose coefficient is 1, whichever it is', () => {
    expect(substitutionSteps(SYSTEM_PRESETS[1].s).map((s) => s.tex)).toEqual([
      'y = x - 1',
      '2x + 3\\left(x - 1\\right) = 12',
      '\\begin{aligned} 5x - 3 &= 12 \\\\ 5x &= 15 \\\\ x &= 3 \\end{aligned}',
      'y = 3 - 1 = 2',
      '2 \\cdot 3 + 3 \\cdot 2 = 12 \\;\\checkmark \\qquad 3 - 2 = 1 \\;\\checkmark',
    ])
  })

  it('scales a row only when the coefficients are not opposites yet', () => {
    expect(additionSteps(SYSTEM_PRESETS[0].s).map((s) => s.noteKey)).toEqual([
      'lin.stepAddRows',
      'lin.stepSolveOne',
      'lin.stepBack',
      'lin.stepCheck',
    ])
    expect(additionSteps(SYSTEM_PRESETS[1].s).map((s) => s.tex)).toEqual([
      '3x - 3y = 3',
      '5x = 15',
      'x = 3',
      'y = 3 - 1 = 2',
      '2 \\cdot 3 + 3 \\cdot 2 = 12 \\;\\checkmark \\qquad 3 - 2 = 1 \\;\\checkmark',
    ])
    expect(additionSteps(SYSTEM_PRESETS[2].s).map((s) => s.tex)).toEqual([
      '-2x - 2y = -1600',
      'x = 300',
      'y = 800 - 300 = 500',
      '3 \\cdot 300 + 2 \\cdot 500 = 1900 \\;\\checkmark \\qquad 300 + 500 = 800 \\;\\checkmark',
    ])
  })

  it('has nothing to eliminate when a row is already free of y', () => {
    expect(additionSteps({ a1: 2, b1: 0, c1: 6, a2: 1, b2: 1, c2: 5 }).map((s) => s.tex)).toEqual([
      '\\begin{aligned} 2x &= 6 \\\\ x &= 3 \\end{aligned}',
      'y = 5 - 3 = 2',
      '2 \\cdot 3 = 6 \\;\\checkmark \\qquad 3 + 2 = 5 \\;\\checkmark',
    ])
  })

  it('walks no steps for a system without exactly one whole solution', () => {
    expect(substitutionSteps(SYSGRAPH_PRESETS[1].s)).toEqual([])
    expect(additionSteps(SYSGRAPH_PRESETS[2].s)).toEqual([])
  })

  it('answers its own exercise', () => {
    const solved = solveSystem(SYSTEM_TASK)
    expect(solved.kind).toBe('one')
    if (solved.kind === 'one') {
      expect(`${solved.x.p}|${solved.y.p}`).toBe(SYSTEM_ANSWER)
    }
  })
})

describe('the meeting model', () => {
  it('moves the cars towards each other and closes the gap', () => {
    expect(positions(0)).toEqual({ car1: 0, car2: 180, gap: 180 })
    expect(positions(1)).toEqual({ car1: 60, car2: 150, gap: 90 })
    expect(positions(2)).toEqual({ car1: 120, car2: 120, gap: 0 })
  })

  it('meets where the two covered distances add up to the road', () => {
    const t = meetingTime(MEETING.distance, MEETING.v1, MEETING.v2)
    expect(t).toBe(2)
    expect(positions(t).gap).toBe(0)
    expect(MEETING.v1 * t + MEETING.v2 * t).toBe(MEETING.distance)
  })

  it('answers its own exercise', () => {
    expect(meetingTime(180, 60, 40)).toBe(MODEL_ANSWER)
  })
})

describe('work, mixture and money', () => {
  it('adds up the parts of the job rather than the times', () => {
    expect(workDone(1)).toEqual({ part1: 1 / 6, part2: 1 / 3, total: 1 / 2 })
    expect(workDone(2).total).toBeCloseTo(1, 12)
    expect(togetherTime(WORK.t1, WORK.t2)).toBe(2)
  })

  it('mixes the solute, not the percentages', () => {
    expect(mixConcentration(0)).toBe(MIX.c2)
    expect(mixConcentration(MIX.total)).toBe(MIX.c1)
    expect(mixConcentration(2)).toBe(MIX.target)
    expect(mixSolve()).toBe(2)
  })

  it('splits a sum with a known difference', () => {
    expect(moneySplit(MONEY.total, MONEY.diff)).toEqual({ small: 13000, big: 17000 })
    const { small, big } = moneySplit(MONEY.total, MONEY.diff)
    expect(small + big).toBe(MONEY.total)
    expect(big - small).toBe(MONEY.diff)
  })

  it('names one faulty-data variant of each kind', () => {
    expect(DATA_VARIANTS.map((v) => v.kind).join('|')).toBe(DATA_ANSWER)
    expect(new Set(DATA_VARIANTS.map((v) => v.id)).size).toBe(DATA_VARIANTS.length)
  })
})
