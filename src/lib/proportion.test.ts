import { describe, expect, it } from 'vitest'
import {
  applyChanges,
  CHANGE_ANSWER,
  compound,
  curve,
  DIRECT_ANSWER,
  DIRECT_QUIZ,
  DIRECT_SCENARIOS,
  directTable,
  directValue,
  graphXs,
  groupThousands,
  INTEREST_ANSWER,
  INVERSE_ANSWER,
  INVERSE_SCENARIOS,
  inverseValue,
  isDirect,
  isInverse,
  multiplier,
  PERCENT_ANSWER,
  percentBase,
  percentRate,
  percentValue,
  plainNumber,
  POINT_EXAMPLE,
  round,
  simpleInterest,
  SITUATIONS,
  SITUATIONS_ANSWER,
  totalChange,
} from './proportion'

describe('numbers on screen', () => {
  it('rounds to the asked number of decimals', () => {
    expect(round(1 / 3, 2)).toBe(0.33)
    expect(round(2.005, 2)).toBe(2)
    expect(round(216320.4, 0)).toBe(216320)
  })

  it('groups thousands with a no-break space', () => {
    expect(groupThousands(1234567)).toBe('1 234 567')
    expect(groupThousands(999)).toBe('999')
    expect(groupThousands(15000)).toBe('15 000')
  })

  it('writes a negative amount with a typographic minus', () => {
    expect(groupThousands(-12000)).toBe('−12 000')
  })

  it('writes prose numbers with the reader’s separator', () => {
    expect(plainNumber(2.5, ',')).toBe('2,5')
    expect(plainNumber(2500, ',')).toBe('2500')
    expect(plainNumber(0.25, ',')).toBe('0,25')
    expect(plainNumber(1 / 3, '.')).toBe('0.33')
  })
})

describe('direct proportion', () => {
  it('scales the value with the quantity', () => {
    expect(directValue(600, 2)).toBe(1200)
    expect(directValue(600, 0.5)).toBe(300)
    expect(directValue(600, 0)).toBe(0)
  })

  it('doubling the quantity doubles the value', () => {
    for (const sc of DIRECT_SCENARIOS) {
      expect(directValue(sc.k, 4)).toBe(2 * directValue(sc.k, 2))
    }
  })

  it('gives the same quotient in every row of the table', () => {
    const rows = directTable(600, [1, 2, 5, 10])
    expect(rows.map((r) => r.y)).toEqual([600, 1200, 3000, 6000])
    expect(new Set(rows.map((r) => r.ratio))).toEqual(new Set([600]))
  })

  it('recognises a direct proportion and rejects the near misses', () => {
    expect(isDirect(DIRECT_QUIZ[0].pairs)).toBe(true)
    expect(isDirect(DIRECT_QUIZ[1].pairs)).toBe(false)
    expect(isDirect(DIRECT_QUIZ[2].pairs)).toBe(false)
    expect(isDirect([{ x: 0, y: 0 }])).toBe(false)
    expect(isDirect([])).toBe(false)
  })

  it('names the quiz table that is proportional', () => {
    const answer = DIRECT_QUIZ.filter((q) => isDirect(q.pairs))
    expect(answer.map((q) => q.id)).toEqual([DIRECT_ANSWER])
  })
})

describe('inverse proportion', () => {
  it('keeps the product constant', () => {
    expect(inverseValue(24, 2)).toBe(12)
    expect(inverseValue(24, 6)).toBe(4)
    expect(inverseValue(24, 12)).toBe(2)
  })

  it('halves the value when the quantity doubles', () => {
    for (const sc of INVERSE_SCENARIOS) {
      expect(inverseValue(sc.k, 2 * sc.xMin)).toBe(inverseValue(sc.k, sc.xMin) / 2)
    }
  })

  it('recognises an inverse proportion', () => {
    expect(isInverse(DIRECT_QUIZ[2].pairs)).toBe(true)
    expect(isInverse(DIRECT_QUIZ[0].pairs)).toBe(false)
    expect(isInverse([])).toBe(false)
  })

  it('answers the painters with the constant amount of work', () => {
    expect(INVERSE_ANSWER).toBe((6 * 10) / 4)
  })
})

describe('the shapes of a dependence', () => {
  it('starts the inverse curve away from zero', () => {
    expect(graphXs('direct')[0]).toBe(0)
    expect(graphXs('inverse')[0]).toBe(1)
    expect(graphXs('direct')[graphXs('direct').length - 1]).toBe(8)
  })

  it('quadruples the square and doubles the root', () => {
    expect(curve('square', [1, 2])).toEqual([0.5, 2])
    expect(curve('root', [1, 4])).toEqual([3, 6])
  })

  it('lets the line miss the origin but not the direct proportion', () => {
    expect(curve('direct', [0])).toEqual([0])
    expect(curve('linear', [0])).toEqual([4])
    expect(curve('inverse', [1, 2])).toEqual([12, 6])
  })

  it('spells the classification answer in the order of the table', () => {
    expect(SITUATIONS).toHaveLength(8)
    expect(SITUATIONS_ANSWER).toBe('direct|linear|inverse|square|root|inverse|none|direct')
  })
})

describe('percent', () => {
  it('finds the value, the rate and the base of the same statement', () => {
    expect(percentValue(15000, 20)).toBe(3000)
    expect(percentRate(3000, 15000)).toBe(20)
    expect(percentBase(3000, 20)).toBe(15000)
  })

  it('survives a rate above a hundred and a zero', () => {
    expect(percentValue(15000, 120)).toBe(18000)
    expect(percentValue(15000, 0)).toBe(0)
    expect(percentRate(3000, 0)).toBe(0)
    expect(percentBase(3000, 0)).toBe(0)
  })

  it('answers the discount as a rate', () => {
    expect(percentRate(24000 - 18000, 24000)).toBe(PERCENT_ANSWER)
  })
})

describe('percentage change', () => {
  it('turns a percentage into the number one multiplies by', () => {
    expect(multiplier(20)).toBe(1.2)
    expect(multiplier(-20)).toBe(0.8)
    expect(multiplier(0)).toBe(1)
  })

  it('applies the changes one after the other', () => {
    expect(applyChanges(50000, [20, -20])).toEqual([
      { rate: 20, factor: 1.2, value: 60000 },
      { rate: -20, factor: 0.8, value: 48000 },
    ])
  })

  it('multiplies the changes instead of adding them', () => {
    expect(totalChange([20, -20])).toBe(-4)
    expect(totalChange([25, -20])).toBe(0)
    expect(totalChange([10, 10])).toBe(21)
  })

  it('separates the percentage point from the percent', () => {
    expect(POINT_EXAMPLE.to - POINT_EXAMPLE.from).toBe(1)
    expect(percentRate(POINT_EXAMPLE.to - POINT_EXAMPLE.from, POINT_EXAMPLE.from)).toBe(33.33)
  })

  it('answers the classic misconception with the whole price back', () => {
    expect(CHANGE_ANSWER).toBe(100)
    expect(totalChange([25, -20])).toBe(0)
  })
})

describe('compound interest', () => {
  it('starts both kinds of interest at the principal', () => {
    expect(compound(200000, 5, 3)[0]).toBe(200000)
    expect(simpleInterest(200000, 5, 3)[0]).toBe(200000)
  })

  it('pays interest on the interest', () => {
    expect(compound(100000, 5, 2)).toEqual([100000, 105000, 110250])
    expect(simpleInterest(100000, 5, 2)).toEqual([100000, 105000, 110000])
  })

  it('opens the gap year by year', () => {
    const withInterest = compound(200000, 5, 10)
    const without = simpleInterest(200000, 5, 10)
    for (let n = 2; n <= 10; n++) {
      expect(withInterest[n] - without[n]).toBeGreaterThan(withInterest[n - 1] - without[n - 1])
    }
  })

  it('answers the two years of compound interest', () => {
    expect(compound(200000, 4, 2)[2]).toBe(INTEREST_ANSWER)
  })
})
