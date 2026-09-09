import { describe, expect, it } from 'vitest'
import {
  ASSIGN_ANSWER,
  ASSIGN_PRESETS,
  ASSIGN_QUIZ,
  backOptions,
  classify,
  DAY_TEMPS,
  DEFINE_ANSWER,
  ELEM,
  ELEM_ANSWER,
  ELEM_IDS,
  elemValue,
  elemValues,
  elemXs,
  extremes,
  FENCE,
  FENCE_ANSWER,
  fenceArea,
  fmt,
  HIKE,
  interpolate,
  INVERSE_ANSWER,
  INVERSE_PRESETS,
  inverseLinear,
  inverseTex,
  LINEAR_ANSWER,
  LINEAR_TASK,
  linear,
  linearTex,
  monotoneRuns,
  preimages,
  rangeOf,
  READ_ANSWER,
  READ_OPTIONS,
  RULES,
  slopeBetween,
  solutionCount,
  solutions,
  TRANSFORM_ANSWER,
  TRANSFORM_OPTIONS,
  transformed,
  transformTex,
  transformWords,
  TRIP,
  tripSpeed,
  valueTable,
  whyNot,
  zerosOf,
  type Rule,
} from './functions'

const rule = (id: string): Rule => RULES.find((r) => r.id === id) as Rule

describe('writing numbers', () => {
  it('keeps at most two decimals and the reader’s separator', () => {
    expect(fmt(2, ',')).toBe('2')
    expect(fmt(1.732, ',')).toBe('1,73')
    expect(fmt(1.732, '.')).toBe('1.73')
    expect(fmt(-4.5, ',')).toBe('−4,5')
  })

  it('never writes a minus zero', () => {
    expect(fmt(-0.001, ',')).toBe('0')
    expect(fmt(-0, ',')).toBe('0')
  })
})

describe('assignments', () => {
  const preset = (id: string) => ASSIGN_PRESETS.find((p) => p.id === id)!

  it('calls one arrow out of every node a function', () => {
    const p = preset('shoes')
    expect(classify(p.left, p.arrows)).toBe('function')
    expect(whyNot(p.left, p.arrows)).toEqual({ rightId: 's38', reason: 'shared' })
  })

  it('calls a function with no shared target one-to-one', () => {
    const p = preset('capitals')
    expect(classify(p.left, p.arrows)).toBe('oneToOne')
    expect(whyNot(p.left, p.arrows)).toBeNull()
  })

  it('rejects a node with no arrow and a node with two', () => {
    const p = preset('siblings')
    expect(classify(p.left, p.arrows)).toBe('notFunction')
    expect(whyNot(p.left, p.arrows)).toEqual({ leftId: 'eva', reason: 'none' })
    expect(whyNot(['feri', 'gabi'], p.arrows)).toEqual({ leftId: 'feri', reason: 'many' })
  })

  it('treats a missing entry as no arrow at all', () => {
    expect(classify(['x'], {})).toBe('notFunction')
    expect(whyNot(['x'], {})).toEqual({ leftId: 'x', reason: 'none' })
  })

  it('gives every preset node a unique id', () => {
    for (const p of ASSIGN_PRESETS) {
      const ids = [...p.left, ...p.right]
      expect(new Set(ids).size).toBe(ids.length)
      for (const outs of Object.values(p.arrows)) {
        for (const target of outs) expect(p.right).toContain(target)
      }
    }
  })

  it('spells the quiz answer out of the quiz itself', () => {
    expect(ASSIGN_ANSWER).toBe('function|notFunction|oneToOne|function')
    expect(ASSIGN_QUIZ).toHaveLength(4)
  })
})

describe('giving a function', () => {
  it('tabulates the rule on its domain', () => {
    expect(valueTable(rule('line')).slice(0, 3)).toEqual([
      { x: -2, y: -7 },
      { x: -1, y: -5 },
      { x: 0, y: -3 },
    ])
    expect(valueTable(rule('taxi'))[3]).toEqual({ x: 3, y: 1600 })
  })

  it('collects the values it actually takes, each one once', () => {
    expect(rangeOf(rule('square'))).toEqual([-4, -3, 0, 5])
    expect(rangeOf(rule('half'))).toEqual([1, 2, 3, 4, 6, 12])
  })

  it('finds every x that leads to a value', () => {
    expect(preimages(rule('square'), 5)).toEqual([-3, 3])
    expect(preimages(rule('square'), 0)).toEqual([-2, 2])
    expect(preimages(rule('square'), 4)).toEqual([])
  })

  it('offers values the function misses as well as ones it takes', () => {
    const options = backOptions(rule('square'))
    expect(options).toContain(5)
    expect(options).toContain(4)
    expect(preimages(rule('square'), 4)).toEqual([])
    const fares = backOptions(rule('taxi'))
    expect(fares).toContain(700)
    expect(fares).toContain(850)
    expect(fares.length).toBeLessThan(30)
  })

  it('writes one substitution the way it is done on paper', () => {
    expect(rule('taxi').sub(3)).toBe('f(3) = 300 \\cdot 3 + 700 = 1600')
    expect(rule('square').sub(-3)).toBe('f(-3) = (-3)^2 - 4 = 5')
    expect(rule('half').sub(4)).toBe('f(4) = \\frac{12}{4} = 3')
  })

  it('answers f(x) = 3x − 5 = 7', () => {
    expect(3 * DEFINE_ANSWER - 5).toBe(7)
  })
})

describe('reading a graph', () => {
  it('interpolates between the hours and stays flat outside them', () => {
    expect(interpolate(DAY_TEMPS, 0)).toBe(-2)
    expect(interpolate(DAY_TEMPS, 14)).toBe(8)
    expect(interpolate(DAY_TEMPS, 2)).toBe(-3)
    expect(interpolate(DAY_TEMPS, -5)).toBe(-2)
    expect(interpolate(DAY_TEMPS, 30)).toBe(-1)
  })

  it('finds the zeros of the day', () => {
    expect(zerosOf(DAY_TEMPS)).toEqual([7, 23])
  })

  it('crosses zero between two vertices too', () => {
    expect(zerosOf([[0, -1], [2, 1]])).toEqual([1])
  })

  it('takes the extremes at the corners', () => {
    expect(extremes(DAY_TEMPS)).toEqual({ min: [4, -4], max: [14, 8] })
  })

  it('merges neighbouring segments that go the same way', () => {
    expect(monotoneRuns(DAY_TEMPS)).toEqual([
      { from: 0, to: 4, dir: 'down' },
      { from: 4, to: 14, dir: 'up' },
      { from: 14, to: 24, dir: 'down' },
    ])
  })

  it('names a level stretch flat', () => {
    expect(monotoneRuns(TRIP).map((r) => r.dir)).toEqual(['up', 'flat', 'up', 'flat', 'up'])
  })

  it('increases on exactly one of the offered intervals', () => {
    const rising = monotoneRuns(HIKE).filter((r) => r.dir === 'up')
    expect(rising).toEqual([{ from: -1, to: 2, dir: 'up' }])
    const answer = READ_OPTIONS.find((o) => o.id === READ_ANSWER)!
    expect([answer.from, answer.to]).toEqual([-1, 2])
  })
})

describe('the linear function', () => {
  it('evaluates and writes itself with tidy signs', () => {
    expect(linear(2, -1)(3)).toBe(5)
    expect(linearTex(2, -1)).toBe('f(x) = 2x - 1')
    expect(linearTex(-1, 0)).toBe('f(x) = -x')
    expect(linearTex(0, 3)).toBe('f(x) = 3')
    expect(linearTex(0.5, 0)).toBe('f(x) = 0.5x')
  })

  it('reads the slope off two points', () => {
    expect(slopeBetween(LINEAR_TASK.p, LINEAR_TASK.q)).toBe(2)
    expect(slopeBetween([0, 4], [2, 0])).toBe(-2)
  })

  it('matches the answer of its own exercise', () => {
    const [m, b] = LINEAR_ANSWER.split('|').map(Number)
    expect(m).toBe(slopeBetween(LINEAR_TASK.p, LINEAR_TASK.q))
    expect(linear(m, b)(LINEAR_TASK.q[0])).toBe(LINEAR_TASK.q[1])
  })
})

describe('the elementary functions', () => {
  it('samples each one on a grid that fits its domain', () => {
    expect(elemXs('square')[0]).toBe(-4)
    expect(elemXs('root')[0]).toBe(0)
    expect(elemXs('recip').at(-1)).toBe(4)
    for (const id of ELEM_IDS) expect(elemXs(id).length).toBeGreaterThan(40)
  })

  it('leaves a hole where there is nothing to draw', () => {
    expect(elemValue('root', -1)).toBeNaN()
    expect(elemValue('recip', 0)).toBeNaN()
    expect(elemValue('recip', 0.1)).toBeNaN()
    expect(elemValue('recip', 0.5)).toBe(2)
    expect(elemValues('square', [-2, 3])).toEqual([4, 9])
  })

  it('counts the solutions of f(x) = c', () => {
    expect(solutionCount('square', 4)).toBe(2)
    expect(solutionCount('square', 0)).toBe(1)
    expect(solutionCount('square', -1)).toBe(0)
    expect(solutionCount('root', 0)).toBe(1)
    expect(solutionCount('root', -0.5)).toBe(0)
    expect(solutionCount('recip', 0)).toBe(0)
    expect(solutionCount('recip', -2)).toBe(1)
  })

  it('lists those solutions in increasing order', () => {
    expect(solutions('square', 9)).toEqual([-3, 3])
    expect(solutions('square', 0)).toEqual([0])
    expect(solutions('root', 3)).toEqual([9])
    expect(solutions('recip', 4)).toEqual([0.25])
    for (const id of ELEM_IDS) {
      for (const c of [-2, -0.5, 0, 0.5, 4]) {
        expect(solutions(id, c)).toHaveLength(solutionCount(id, c))
        for (const x of solutions(id, c)) expect(ELEM[id].f(x)).toBeCloseTo(c, 10)
      }
    }
  })

  it('knows which graph never reaches the x axis', () => {
    expect(ELEM[ELEM_ANSWER].zeroTex).toBe('')
    expect(solutionCount(ELEM_ANSWER, 0)).toBe(0)
  })
})

describe('transformations', () => {
  const t = (dx: number, dy: number, k: number, abs = false) => ({ dx, dy, k, abs })

  it('applies the steps in the right order', () => {
    const g = transformed(ELEM.square.f, t(1, -3, 2))
    expect(g(0)).toBe(-1)
    expect(g(-1)).toBe(-3)
    expect(transformed(ELEM.square.f, t(0, -4, 1, true))(0)).toBe(4)
  })

  it('shifts the graph left when the number inside is positive', () => {
    const g = transformed(ELEM.square.f, t(3, 0, 1))
    expect(g(-3)).toBe(ELEM.square.f(0))
  })

  it('writes the transformed rule tidily', () => {
    expect(transformTex('square', t(1, -3, 2))).toBe('2(x + 1)^2 - 3')
    expect(transformTex('square', t(0, 0, 1))).toBe('x^2')
    expect(transformTex('root', t(-2, 0, 1, true))).toBe('\\left|\\sqrt{x - 2}\\right|')
    expect(transformTex('recip', t(0, 1, -1))).toBe('-\\frac{1}{x} + 1')
  })

  it('names the moves in the order they happen', () => {
    expect(transformWords(t(0, 0, 1))).toEqual([])
    expect(transformWords(t(3, 0, 1))).toEqual(['left'])
    expect(transformWords(t(-3, 0, 1))).toEqual(['right'])
    expect(transformWords(t(1, -2, -0.5, true))).toEqual(['left', 'shrink', 'flip', 'down', 'abs'])
    expect(transformWords(t(0, 2, 2))).toEqual(['stretch', 'up'])
  })

  it('offers the shift to the right among four look-alikes', () => {
    const answer = TRANSFORM_OPTIONS.find((o) => o.id === TRANSFORM_ANSWER)!
    expect(answer.tex).toBe('(x - 3)^2')
    expect(TRANSFORM_OPTIONS).toHaveLength(4)
    expect(transformed(ELEM.square.f, t(-3, 0, 1))(3)).toBe(0)
  })
})

describe('turning an assignment around', () => {
  it('undoes the steps of mx + b', () => {
    expect(inverseLinear(2, 6)).toEqual({ m: 0.5, b: -3 })
    const { m, b } = inverseLinear(1.8, 32)
    expect(m * 212 + b).toBeCloseTo(100, 10)
  })

  it('takes every preset back where it came from', () => {
    for (const p of INVERSE_PRESETS) {
      const inv = inverseLinear(p.m, p.b)
      for (const x of [0, 5, 37]) {
        expect(inv.m * linear(p.m, p.b)(x) + inv.b).toBeCloseTo(x, 10)
      }
    }
  })

  it('writes the undoing as one fraction', () => {
    expect(inverseTex(2, 6)).toBe('f^{-1}(x) = \\frac{x - 6}{2}')
    expect(inverseTex(1.27, 0)).toBe('f^{-1}(x) = \\frac{x}{1.27}')
    expect(inverseTex(2, -6)).toBe('f^{-1}(x) = \\frac{x + 6}{2}')
    expect(inverseTex(1, 3)).toBe('f^{-1}(x) = x - 3')
  })

  it('matches the answer of its own exercise', () => {
    const preset = INVERSE_PRESETS.find((p) => p.id === 'double')!
    const inv = inverseLinear(preset.m, preset.b)
    expect(inv.m * 10 + inv.b).toBe(INVERSE_ANSWER)
  })
})

describe('functions in practice', () => {
  it('reads the speed off the slope of the segment', () => {
    expect(tripSpeed(TRIP, 3)).toBeCloseTo(400 / 6, 10)
    expect(tripSpeed(TRIP, 8)).toBe(0)
    expect(tripSpeed(TRIP, 12)).toBe(250)
    expect(tripSpeed(TRIP, 20)).toBe(0)
    expect(tripSpeed(TRIP, 25)).toBe(100)
  })

  it('never goes backwards on the way to school', () => {
    for (let i = 1; i < TRIP.length; i++) expect(TRIP[i][1]).toBeGreaterThanOrEqual(TRIP[i - 1][1])
    expect(interpolate(TRIP, 25)).toBe(2700)
  })

  it('is largest when the rectangle is a square', () => {
    expect(fenceArea(5)).toBe(FENCE_ANSWER)
    expect(fenceArea(0)).toBe(0)
    expect(fenceArea(FENCE.perimeter / 2)).toBe(0)
    for (let x = 0; x <= 10; x += 0.5) expect(fenceArea(x)).toBeLessThanOrEqual(FENCE_ANSWER)
  })
})
