import { describe, expect, it } from 'vitest'
import {
  ABS_ANSWER,
  absValue,
  agreeingPrefix,
  areaBounds,
  belongsTo,
  checkTargetExpression,
  claimValue,
  CLAIMS,
  CLAIMS_ANSWER,
  decimalExpansion,
  DECIMAL_PRESETS,
  digitsOf,
  distance,
  ESTIMATE_PRESETS,
  estimateOf,
  expansionToTex,
  formatDecimal,
  texSeparator,
  FRACTION_ANSWER,
  fractionOf,
  gcd,
  INTERVAL_ANSWER,
  INTERVAL_OPTIONS,
  INTERVAL_QUIZ,
  intervalContains,
  intervalNotation,
  intervalSetBuilder,
  isTerminating,
  LAWS_ANSWER,
  LINE_POINTS,
  nestedIntervals,
  opposite,
  parseDecimal,
  reciprocal,
  reduce,
  repeatingToFraction,
  ROOM,
  ROOM_ERRORS,
  ROOT10_LOWER,
  ROUND_ANSWER,
  ROUND_PRESETS,
  roundAt,
  roundingError,
  roundSignificant,
  SAMPLE_NUMBERS,
  TARGET_DIGITS,
  TARGETS,
  TOWER_ANSWER,
  TOWER_QUIZ,
  usedDigits,
  ZOOM_TARGETS,
  evaluateExpression,
} from './numbers'

describe('number sets', () => {
  it('nests ℕ in ℤ in ℚ and keeps the irrationals apart', () => {
    expect(belongsTo('natural', 'integer')).toBe(true)
    expect(belongsTo('natural', 'rational')).toBe(true)
    expect(belongsTo('integer', 'natural')).toBe(false)
    expect(belongsTo('rational', 'integer')).toBe(false)
    expect(belongsTo('irrational', 'rational')).toBe(false)
    expect(belongsTo('rational', 'irrational')).toBe(false)
    expect(belongsTo('irrational', 'irrational')).toBe(true)
  })

  it('places every sample number in the narrowest set that holds it', () => {
    const byId = new Map(SAMPLE_NUMBERS.map((s) => [s.id, s]))
    // 7/1 is written as a fraction but it is the natural number 7.
    expect(byId.get('sevenOverOne')?.cls).toBe('natural')
    expect(byId.get('minusThree')?.cls).toBe('integer')
    expect(byId.get('threeQuarters')?.value).toBe(0.75)
    expect(byId.get('pi')?.cls).toBe('irrational')
    expect(SAMPLE_NUMBERS).toHaveLength(12)
    expect(new Set(SAMPLE_NUMBERS.map((s) => s.id)).size).toBe(12)
  })

  it('pins the answers of the tower exercise', () => {
    expect(TOWER_QUIZ.map((q) => q.cls)).toEqual([
      'integer',
      'rational',
      'irrational',
      // √9 = 3, so the trap answer is ℕ.
      'natural',
      'rational',
    ])
    expect(TOWER_ANSWER).toBe('integer|rational|irrational|natural|rational')
  })
})

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
    const texts = [
      ...SAMPLE_NUMBERS.map((s) => s.tex),
      ...TOWER_QUIZ.map((q) => q.tex),
      ...LINE_POINTS.map((p) => p.tex),
      ...ZOOM_TARGETS.map((z) => z.tex),
    ]
    for (const tex of texts) expect(tex, tex).not.toContain('{,}')
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

  it('divides long, and stops when a remainder comes back', () => {
    const third = decimalExpansion(1, 3)
    expect(third.intPart).toBe('0')
    expect(third.nonRepeating).toBe('')
    expect(third.repeating).toBe('3')
    expect(third.truncated).toBe(false)

    const sixth = decimalExpansion(1, 6)
    expect(sixth.nonRepeating).toBe('1')
    expect(sixth.repeating).toBe('6')

    const eighth = decimalExpansion(1, 8)
    expect(eighth.nonRepeating).toBe('125')
    expect(eighth.repeating).toBe('')
    expect(eighth.repeatStart).toBeNull()
    expect(eighth.steps.at(-1)?.remainder).toBe(0)

    expect(decimalExpansion(22, 7).repeating).toBe('142857')
    expect(decimalExpansion(-1, 3).intPart).toBe('-0')
    expect(decimalExpansion(7, 1).nonRepeating).toBe('')
  })

  it('never needs more steps than the denominator, because remainders run out', () => {
    for (let q = 2; q <= 30; q++) {
      const e = decimalExpansion(1, q)
      expect(e.truncated, `1/${q}`).toBe(false)
      expect(e.steps.length).toBeLessThanOrEqual(q)
    }
  })

  it('draws the period with an overline', () => {
    expect(expansionToTex(decimalExpansion(1, 6), ',')).toBe('0{,}1\\overline{6}')
    expect(expansionToTex(decimalExpansion(3, 4), ',')).toBe('0{,}75')
    expect(expansionToTex(decimalExpansion(3, 4), '.')).toBe('0{.}75')
    expect(expansionToTex(decimalExpansion(6, 3), ',')).toBe('2')
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

  it('round-trips every preset through the long division', () => {
    for (const p of DECIMAL_PRESETS) {
      const f = repeatingToFraction(p.intPart, p.nonRepeating, p.repeating)
      const back = decimalExpansion(f.reducedP, f.reducedQ)
      expect(back.nonRepeating, p.id).toBe(p.nonRepeating)
      expect(back.repeating, p.id).toBe(p.repeating)
    }
  })

  it('pins 0,(36) = 4/11 as the fraction exercise answer', () => {
    const f = repeatingToFraction('0', '', '36')
    expect({ p: f.reducedP, q: f.reducedQ }).toEqual(FRACTION_ANSWER)
  })

  it('writes a nice decimal as a fraction and gives up on the rest', () => {
    expect(fractionOf(0.75)).toEqual({ p: 3, q: 4 })
    expect(fractionOf(-2.5)).toEqual({ p: -5, q: 2 })
    expect(fractionOf(3)).toEqual({ p: 3, q: 1 })
    expect(fractionOf(0.25 * 3)).toEqual({ p: 3, q: 4 })
    expect(fractionOf(Math.SQRT2)).toBeNull()
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

  it('keeps the line points sorted and classified', () => {
    const values = LINE_POINTS.map((p) => p.value)
    expect([...values].sort((a, b) => a - b)).toEqual(values)
    expect(LINE_POINTS.filter((p) => p.kind === 'irrational').map((p) => p.id)).toEqual(['root2', 'pi'])
    // 22/7 is the old school approximation of π, so the two sit almost on top
    // of each other — the line has to survive that.
    expect(distance(22 / 7, Math.PI)).toBeLessThan(0.002)
    expect(ZOOM_TARGETS.map((z) => z.id)).toEqual(['root2', 'pi', 'third', 'twentyTwoSevenths'])
    // The SVG can only draw plain text, so every point carries one.
    expect(LINE_POINTS.every((p) => p.plain !== '')).toBe(true)
    expect(ZOOM_TARGETS.map((z) => z.plain)).toEqual(['√2', 'π', '1/3', '22/7'])
    expect(formatDecimal(LINE_POINTS[0].plain, ',', false)).toBe('−2,5')
  })

  it('pins 3,1 as the tenth below √10', () => {
    expect(ROOT10_LOWER).toBe(3.1)
    expect(3.1 ** 2).toBeLessThan(10)
    expect(3.2 ** 2).toBeGreaterThan(10)
    expect(nestedIntervals(Math.sqrt(10), 1)[1].lo).toBeCloseTo(3.1, 12)
  })
})

describe('intervals', () => {
  it('writes the brackets the way each language does', () => {
    expect(intervalNotation(-1, 3, false, true, 'hu')).toBe(']-1; 3]')
    expect(intervalNotation(-1, 3, false, true, 'en')).toBe('(-1, 3]')
    expect(intervalNotation(2, 5, true, true, 'hu')).toBe('[2; 5]')
    expect(intervalNotation(2, 5, false, false, 'en')).toBe('(2, 5)')
    expect(intervalNotation(-1.5, 3, true, false, 'hu', (v) => formatDecimal(String(v), ',', false))).toBe(
      '[−1,5; 3[',
    )
  })

  it('lets a closed end in and keeps an open one out', () => {
    expect(intervalContains(-1, 3, false, true, -1)).toBe(false)
    expect(intervalContains(-1, 3, false, true, 3)).toBe(true)
    expect(intervalContains(-1, 3, false, true, 0)).toBe(true)
    expect(intervalContains(-1, 3, true, false, -1)).toBe(true)
    expect(intervalContains(-1, 3, true, false, 3)).toBe(false)
    expect(intervalContains(-1, 3, true, true, 3.5)).toBe(false)
  })

  it('states the same interval as a condition on x', () => {
    expect(intervalSetBuilder(-1, 3, false, true)).toBe('-1 < x \\le 3')
    expect(intervalSetBuilder(0, 1, true, true)).toBe('0 \\le x \\le 1')
  })

  it('pins the open-left, closed-right option as the interval answer', () => {
    const pick = INTERVAL_OPTIONS.find((o) => o.id === INTERVAL_ANSWER)
    expect(pick).toEqual({ id: 'oc', leftClosed: false, rightClosed: true })
    expect(pick?.leftClosed).toBe(INTERVAL_QUIZ.leftClosed)
    expect(pick?.rightClosed).toBe(INTERVAL_QUIZ.rightClosed)
    expect(INTERVAL_OPTIONS).toHaveLength(4)
  })
})

describe('opposite, reciprocal, absolute value', () => {
  it('sends a number to the other side of zero and back', () => {
    expect(opposite(3)).toBe(-3)
    expect(opposite(-2.5)).toBe(2.5)
    expect(opposite(0)).toBe(0)
    expect(opposite(opposite(7))).toBe(7)
  })

  it('has no reciprocal for zero and swaps a fraction otherwise', () => {
    expect(reciprocal(0)).toBeNull()
    expect(reciprocal(4)).toBe(0.25)
    expect(reciprocal(-0.5)).toBe(-2)
    expect(fractionOf(reciprocal(-0.75) as number)).toEqual({ p: -4, q: 3 })
  })

  it('measures distance from zero and between two numbers', () => {
    expect(absValue(-4)).toBe(4)
    expect(absValue(4)).toBe(4)
    expect(absValue(-3)).toBe(absValue(3))
    expect(distance(-2, 5)).toBe(7)
    expect(distance(5, -2)).toBe(7)
  })

  it('pins 4/3 as the opposite of the reciprocal of −3/4', () => {
    const r = reciprocal(-3 / 4) as number
    expect(fractionOf(opposite(r))).toEqual(ABS_ANSWER)
  })
})

describe('estimating', () => {
  it('keeps one leading digit', () => {
    expect(roundSignificant(398, 1)).toBe(400)
    expect(roundSignificant(51, 1)).toBe(50)
    expect(roundSignificant(2987, 1)).toBe(3000)
    expect(roundSignificant(0.49, 1)).toBe(0.5)
    expect(roundSignificant(81, 1)).toBe(80)
    expect(roundSignificant(-1234, 2)).toBe(-1200)
    expect(roundSignificant(0, 1)).toBe(0)
  })

  it('estimates each preset within a fifth of the truth', () => {
    for (const p of ESTIMATE_PRESETS) {
      const e = estimateOf(p)
      expect(Math.abs(e.estimate - e.exact) / Math.abs(e.exact), p.id).toBeLessThan(0.2)
    }
    const first = estimateOf(ESTIMATE_PRESETS[0])
    expect([first.ra, first.rb, first.estimate, first.exact]).toEqual([400, 50, 20000, 20298])
  })

  it('pins the five calculator claims', () => {
    expect(CLAIMS.map((c) => c.plausible)).toEqual([true, false, false, true, false])
    expect(CLAIMS_ANSWER).toBe('ok|bad|bad|ok|bad')
    for (const c of CLAIMS) {
      expect(claimValue(c), c.id).toBeCloseTo(Number(c.exact), 10)
      expect(Number(c.claimed) === Number(c.exact), c.id).toBe(c.plausible)
    }
    const byId = new Map(CLAIMS.map((c) => [c.id, c]))
    expect(byId.get('c2')?.exact).toBe('204')
    expect(byId.get('c3')?.exact).toBe('0.06')
    expect(byId.get('c5')?.exact).toBe('625')
  })
})

describe('reaching a target number', () => {
  it('understands the operators a Hungarian pupil writes', () => {
    expect(evaluateExpression('2 + 3 · 4')).toBe(14)
    expect(evaluateExpression('(2 + 3) · 4')).toBe(20)
    expect(evaluateExpression('12 : 4')).toBe(3)
    expect(evaluateExpression('12 ÷ 4')).toBe(3)
    expect(evaluateExpression('5 − 3')).toBe(2)
    expect(evaluateExpression('1 : 0')).toBeNull()
    expect(evaluateExpression('2 +')).toBeNull()
    expect(evaluateExpression('  ')).toBeNull()
  })

  it('lists the digits used, sorted', () => {
    expect(usedDigits('4 · (3 − 1) + 2')).toBe('1234')
    expect(usedDigits('11 + 2')).toBe('112')
    expect(usedDigits('')).toBe('')
  })

  it('hits every target with 1, 2, 3 and 4 used once each', () => {
    const solutions: Record<number, string> = {
      24: '1 · 2 · 3 · 4',
      10: '1 + 2 + 3 + 4',
      36: '(1 + 2) · 3 · 4',
      1: '(4 − 3) · (2 − 1)',
    }
    expect(TARGETS.map(String).sort()).toEqual(Object.keys(solutions).sort())
    for (const target of TARGETS) {
      const check = checkTargetExpression(solutions[target], target)
      expect(check.hit, String(target)).toBe(true)
      expect(check.digitsOk).toBe(true)
      expect(check.charsOk).toBe(true)
    }
    expect(TARGET_DIGITS).toBe('1234')
  })

  it('says which rule an attempt breaks', () => {
    const missing = checkTargetExpression('1 + 2 + 3', 24)
    expect(missing.digitsOk).toBe(false)
    expect(missing.hit).toBe(false)

    const wrongValue = checkTargetExpression('1 + 2 + 3 + 4', 24)
    expect(wrongValue.digitsOk).toBe(true)
    expect(wrongValue.value).toBe(10)
    expect(wrongValue.hit).toBe(false)

    const cheating = checkTargetExpression('sqrt(1234)', 24)
    expect(cheating.charsOk).toBe(false)
    expect(cheating.value).toBeNull()
  })
})

describe('rounding', () => {
  it('rounds a decimal string the way a pupil does on paper', () => {
    expect(roundAt('3.14159', 3).result).toBe('3.142')
    expect(roundAt('3.14159', 3).deciding).toBe('5')
    expect(roundAt('3.14159', 3).up).toBe(true)
    expect(roundAt('3.14159', 2).result).toBe('3.14')
    expect(roundAt('3.14159', 0).result).toBe('3')
    expect(roundAt('2.71828', 4).result).toBe('2.7183')
  })

  it('does not lose the digit a float would swallow', () => {
    // (2.675).toFixed(2) answers "2.67": the stored double is a hair below 2.675.
    expect((2.675).toFixed(2)).toBe('2.67')
    expect(roundAt('2.675', 2).result).toBe('2.68')
    expect(roundAt('1.005', 2).result).toBe('1.01')
    expect(roundAt('8.475', 2).result).toBe('8.48')
  })

  it('carries a nine all the way up', () => {
    expect(roundAt('9.99', 1).result).toBe('10.0')
    expect(roundAt('0.96', 1).result).toBe('1.0')
    expect(roundAt('9999.5', 0).result).toBe('10000')
  })

  it('rounds to tens, hundreds and thousands too', () => {
    expect(roundAt('1234.5678', -1).result).toBe('1230')
    expect(roundAt('1234.5678', -2).result).toBe('1200')
    expect(roundAt('1234.5678', -3).result).toBe('1000')
    expect(roundAt('45', -2).result).toBe('0')
    expect(roundAt('55', -2).result).toBe('100')
    expect(roundAt('149597870.7', -3).result).toBe('149598000')
  })

  it('keeps the sign, except on a rounded-away zero', () => {
    expect(roundAt('-2.675', 2).result).toBe('-2.68')
    expect(roundAt('-0.04', 1).result).toBe('0.0')
    expect(roundAt('0.04567', 3).result).toBe('0.046')
  })

  it('reports how far the rounding moved the number', () => {
    expect(roundingError('3.14159', 3)).toBeCloseTo(0.00041, 12)
    expect(roundingError('1234.5678', -2)).toBeCloseTo(-34.5678, 9)
    expect(roundingError('2.5', 0)).toBeCloseTo(0.5, 12)
  })

  it('pins 3,142 as the rounding exercise answer', () => {
    expect(Number(roundAt('3.14159', 3).result)).toBe(ROUND_ANSWER)
    expect(parseDecimal('3,142')).toBe(ROUND_ANSWER)
    expect(ROUND_PRESETS.map((p) => p.id)).toContain('pi')
    expect(ROUND_PRESETS.every((p) => /^\d+(\.\d+)?$/.test(p.value))).toBe(true)
  })
})

describe('measuring', () => {
  it('lets the error grow with the sides', () => {
    const b = areaBounds(ROOM.length, ROOM.width, 0.01)
    expect(b.nominal).toBeCloseTo(43.5398, 9)
    expect(b.min).toBeLessThan(b.nominal)
    expect(b.max).toBeGreaterThan(b.nominal)
    // ±1 cm on each side is worth over a tenth of a square metre.
    expect(b.max - b.min).toBeGreaterThan(0.2)
  })

  it('keeps only the digits both bounds agree on', () => {
    expect(agreeingPrefix('43.473375', '43.606275')).toBe('43')
    expect(agreeingPrefix('43.526511', '43.552491')).toBe('43.5')
    expect(agreeingPrefix('12', '12')).toBe('12')
    expect(agreeingPrefix('1.0', '2.0')).toBe('')
  })

  it('shows a finer measurement settling one more digit', () => {
    const prefixes = ROOM_ERRORS.map((err) => {
      const b = areaBounds(ROOM.length, ROOM.width, err)
      return agreeingPrefix(b.min.toFixed(6), b.max.toFixed(6))
    })
    expect(prefixes[0]).toBe('43.5')
    expect(prefixes[1]).toBe('43')
    expect(prefixes[2]).toBe('43')
    // However fine the ruler, the printed 43,5398 m² is never all true.
    for (const p of prefixes) expect('43.5398'.startsWith(p)).toBe(true)
  })
})

describe('operation laws', () => {
  it('pins 47 · 99 = 4653', () => {
    expect(LAWS_ANSWER).toBe(4653)
    // 99 = 100 − 1, which is how the section asks for it to be worked out.
    expect(47 * 100 - 47).toBe(LAWS_ANSWER)
  })
})
