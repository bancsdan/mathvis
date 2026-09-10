import { describe, expect, it } from 'vitest'
import {
  DECIMAL_PRESETS,
  digitsOf,
  formatDecimal,
  FRACTION_ANSWER,
  gcd,
  isTerminating,
  nestedIntervals,
  parseDecimal,
  reduce,
  repeatingToFraction,
  ROOT10_LOWER,
  texSeparator,
  ZOOM_TARGETS,
  type DecimalPreset,
} from './numbers'

/** What a preset really is, summed as a geometric series rather than divided. */
function presetValue(p: DecimalPreset): number {
  const head = Number(`${p.intPart}.${p.nonRepeating || '0'}`)
  if (p.repeating === '') return head
  const n = p.nonRepeating.length
  const r = p.repeating.length
  return head + Number(p.repeating) / (10 ** n * (10 ** r - 1))
}

describe('writing numbers down', () => {
  it('swaps the decimal point for the separator of the language', () => {
    expect(formatDecimal('3.14', ',', false)).toBe('3,14')
    expect(formatDecimal('3.14', ',', true)).toBe('3{,}14')
    expect(formatDecimal('3.14', '.', false)).toBe('3.14')
    expect(formatDecimal('12', ',', true)).toBe('12')
  })

  it('writes a real minus sign in prose but keeps the hyphen in tex', () => {
    expect(formatDecimal('-2.5', ',', false)).toBe('−2,5')
    expect(formatDecimal('-2.5', ',', true)).toBe('-2{,}5')
  })

  it('swaps the decimal points of a tex string and leaves the rest alone', () => {
    expect(texSeparator('0.75', ',')).toBe('0{,}75')
    expect(texSeparator('-2.5', ',')).toBe('-2{,}5')
    expect(texSeparator('0.75', '.')).toBe('0{.}75')
    expect(texSeparator('\\sqrt{2}', ',')).toBe('\\sqrt{2}')
    expect(texSeparator('0.101001000\\ldots', ',')).toBe('0{,}101001000\\ldots')
  })

  it('keeps every stored tex free of a language-specific separator', () => {
    for (const z of ZOOM_TARGETS) expect(z.tex, z.tex).not.toContain('{,}')
  })

  it('reads a decimal typed with either separator and rejects junk', () => {
    expect(parseDecimal('3,142')).toBe(3.142)
    expect(parseDecimal(' 3.142 ')).toBe(3.142)
    expect(parseDecimal('-2,5')).toBe(-2.5)
    expect(parseDecimal('−2,5')).toBe(-2.5)
    expect(parseDecimal(',5')).toBe(0.5)
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('3,1,4')).toBeNull()
    expect(parseDecimal('kilenc')).toBeNull()
    expect(parseDecimal('3/4')).toBeNull()
  })
})

describe('fractions', () => {
  it('reduces to lowest terms with the sign on the numerator', () => {
    expect(gcd(36, 99)).toBe(9)
    expect(gcd(0, 7)).toBe(7)
    expect(reduce(36, 99)).toEqual({ p: 4, q: 11 })
    expect(reduce(-6, 8)).toEqual({ p: -3, q: 4 })
    expect(reduce(6, -8)).toEqual({ p: -3, q: 4 })
    expect(reduce(0, 5)).toEqual({ p: 0, q: 1 })
  })

  it('knows which decimals stop', () => {
    expect(isTerminating(1, 2)).toBe(true)
    expect(isTerminating(1, 8)).toBe(true)
    expect(isTerminating(7, 20)).toBe(true)
    expect(isTerminating(1, 3)).toBe(false)
    expect(isTerminating(1, 6)).toBe(false)
    // 15/30 is 1/2 once reduced, so it stops after all.
    expect(isTerminating(15, 30)).toBe(true)
  })

  it('turns a repeating decimal back into a fraction', () => {
    const s = repeatingToFraction('0', '', '36')
    expect(s.mult1).toBe(1)
    expect(s.mult2).toBe(100)
    expect(s.diff).toBe(99)
    expect(s.p).toBe(36)
    expect(s.q).toBe(99)
    expect(s.reducedP).toBe(4)
    expect(s.reducedQ).toBe(11)
  })

  it('handles a non-repeating prefix and a decimal that stops', () => {
    const sixth = repeatingToFraction('0', '1', '6')
    expect([sixth.mult1, sixth.mult2, sixth.diff]).toEqual([10, 100, 90])
    expect([sixth.p, sixth.q]).toEqual([15, 90])
    expect([sixth.reducedP, sixth.reducedQ]).toEqual([1, 6])

    const stops = repeatingToFraction('0', '75', '')
    expect([stops.mult2, stops.diff]).toEqual([100, 100])
    expect([stops.reducedP, stops.reducedQ]).toEqual([3, 4])

    const mixed = repeatingToFraction('2', '4', '')
    expect([mixed.reducedP, mixed.reducedQ]).toEqual([12, 5])

    const negative = repeatingToFraction('-0', '', '3')
    expect([negative.reducedP, negative.reducedQ]).toEqual([-1, 3])
  })

  it('gives back the very number each preset writes down', () => {
    for (const p of DECIMAL_PRESETS) {
      const f = repeatingToFraction(p.intPart, p.nonRepeating, p.repeating)
      expect(f.reducedP / f.reducedQ, p.id).toBeCloseTo(presetValue(p), 12)
      expect(gcd(f.reducedP, f.reducedQ), p.id).toBe(1)
    }
    // The question in the title, 0,2727… = 3/11, is one of the pills.
    const p27 = DECIMAL_PRESETS.find((p) => p.id === 'p27')
    const f27 = repeatingToFraction('0', '', p27?.repeating ?? '')
    expect([f27.reducedP, f27.reducedQ]).toEqual([3, 11])
  })

  it('pins 0,(36) = 4/11 as the fraction exercise answer', () => {
    const f = repeatingToFraction('0', '', '36')
    expect({ p: f.reducedP, q: f.reducedQ }).toEqual(FRACTION_ANSWER)
  })
})

describe('the number line', () => {
  it('cuts decimals off rather than rounding them', () => {
    expect(digitsOf(Math.SQRT2, 5)).toBe('41421')
    expect(digitsOf(Math.PI, 5)).toBe('14159')
    expect(digitsOf(1 / 3, 4)).toBe('3333')
    expect(digitsOf(22 / 7, 6)).toBe('142857')
    expect(digitsOf(2, 3)).toBe('000')
    expect(digitsOf(1.5, 0)).toBe('')
  })

  it('traps a number in ever smaller intervals', () => {
    const levels = nestedIntervals(Math.SQRT2, 3)
    expect(levels).toHaveLength(4)
    expect(levels[0]).toEqual({ lo: 1, hi: 2, digit: 4 })
    expect(levels[1].lo).toBeCloseTo(1.4, 12)
    expect(levels[1].hi).toBeCloseTo(1.5, 12)
    expect(levels[1].digit).toBe(1)
    expect(levels[2].lo).toBeCloseTo(1.41, 12)
    expect(levels[3].lo).toBeCloseTo(1.414, 12)
    for (const level of levels) {
      expect(level.lo).toBeLessThanOrEqual(Math.SQRT2)
      expect(level.hi).toBeGreaterThanOrEqual(Math.SQRT2)
    }
  })

  it('shows the same digit again and again for a third', () => {
    expect(nestedIntervals(1 / 3, 4).map((l) => l.digit)).toEqual([3, 3, 3, 3, 3])
  })

  it('offers two numbers that settle into a pattern and two that never do', () => {
    expect(ZOOM_TARGETS.map((z) => z.id)).toEqual(['root2', 'pi', 'third', 'twentyTwoSevenths'])
    // 22/7 is the old school approximation of π, so the two sit almost on top
    // of each other — the zoom has to survive that.
    expect(Math.abs(22 / 7 - Math.PI)).toBeLessThan(0.002)
    // The SVG can only draw plain text, so every target carries some.
    expect(ZOOM_TARGETS.map((z) => z.plain)).toEqual(['√2', 'π', '1/3', '22/7'])
  })

  it('pins 3,1 as the tenth below √10', () => {
    expect(ROOT10_LOWER).toBe(3.1)
    expect(3.1 ** 2).toBeLessThan(10)
    expect(3.2 ** 2).toBeGreaterThan(10)
    expect(nestedIntervals(Math.sqrt(10), 1)[1].lo).toBeCloseTo(3.1, 12)
  })
})
