import { describe, expect, it } from 'vitest'
import {
  BASES,
  baseValueTex,
  basePowerTex,
  CUBE_PRESETS,
  DEF_ANSWER,
  divideSci,
  factorList,
  FOLD_MILESTONES,
  FOLD_RECORD,
  foldLayers,
  foldThicknessMm,
  fromNormalForm,
  humanLength,
  intPower,
  isNormalMantissa,
  isPerfectSquare,
  LADDER_BASES,
  ladder,
  LAW_IDS,
  LAW_TEX,
  lawInstance,
  LAWS_ANSWER,
  LIFE_SECONDS,
  milestoneAt,
  multiplySci,
  NEG_ANSWER,
  neighbourSquares,
  NTH_ANSWER,
  nthRoot,
  PERFECT_SQUARES,
  powerFraction,
  RATIONAL_TABLE,
  rationalPower,
  ROOT_LAW_CHOICES,
  ROOT_SUM_TRAP,
  SCI_ANSWER,
  SCI_CLAIMS,
  SCI_CLAIMS_ANSWER,
  SCI_PRESETS,
  sciTex,
  SHEET_MM,
  shiftPoint,
  SIMPLIFY_ANSWER,
  SIMPLIFY_CHOICES,
  simplifyRoot,
  SQRT_ANSWER,
  sqrtText,
  SUM_TRAP,
  toNormalForm,
} from './powers'

describe('powers with a positive integer exponent', () => {
  it('multiplies the base by itself', () => {
    expect(intPower(2, 5)).toBe(32)
    expect(intPower(10, 6)).toBe(1000000)
    expect(intPower(7, 1)).toBe(7)
  })

  it('gives 1 for the exponent 0', () => {
    expect(intPower(2, 0)).toBe(1)
    expect(intPower(-3, 0)).toBe(1)
  })

  it('alternates the sign of a negative base', () => {
    expect(intPower(-2, 4)).toBe(16)
    expect(intPower(-2, 5)).toBe(-32)
  })

  it('stays exact for halves, whose denominators are powers of two', () => {
    expect(intPower(0.5, 5)).toBe(0.03125)
  })

  it('refuses a negative exponent', () => {
    expect(() => intPower(2, -1)).toThrow()
  })

  it('lists one factor per exponent', () => {
    expect(factorList('2', 3)).toEqual(['2', '2', '2'])
    expect(factorList('2', 0)).toEqual([])
  })
})

describe('the bases of the first section', () => {
  it('brackets exactly the bases that need it', () => {
    for (const b of BASES) expect(b.paren).toBe(b.num < 0 || b.den !== 1)
  })

  it('agrees with its own fraction', () => {
    for (const b of BASES) expect(b.value).toBeCloseTo(b.num / b.den, 12)
  })

  it('writes the power and its exact value', () => {
    const two = BASES.find((b) => b.id === 'two')!
    const half = BASES.find((b) => b.id === 'half')!
    const minus = BASES.find((b) => b.id === 'minusTwo')!
    expect(basePowerTex(two, 5)).toBe('2^{5}')
    expect(baseValueTex(two, 5)).toBe('32')
    expect(basePowerTex(half, 5)).toBe('\\left(\\frac{1}{2}\\right)^{5}')
    expect(baseValueTex(half, 5)).toBe('\\frac{1}{32}')
    expect(basePowerTex(minus, 4)).toBe('\\left(-2\\right)^{4}')
    expect(baseValueTex(minus, 4)).toBe('16')
    expect(baseValueTex(minus, 3)).toBe('-8')
  })

  it('pins the bracket trap', () => {
    expect(DEF_ANSWER.paren).toBe(intPower(-2, 4))
    expect(DEF_ANSWER.bare).toBe(-intPower(2, 4))
  })
})

describe('paper folding', () => {
  it('doubles the layers with every fold', () => {
    expect(foldLayers(0)).toBe(1)
    expect(foldLayers(7)).toBe(128)
    expect(foldLayers(42)).toBe(4398046511104)
  })

  it('measures the stack in sheets', () => {
    expect(foldThicknessMm(0)).toBeCloseTo(SHEET_MM, 12)
    expect(foldThicknessMm(10)).toBeCloseTo(102.4, 9)
  })

  it('says a length in the unit a person would use', () => {
    expect(humanLength(7)).toEqual({ value: 7, unit: 'mm' })
    expect(humanLength(12.8)).toEqual({ value: 1.3, unit: 'cm' })
    expect(humanLength(1638.4)).toEqual({ value: 1.6, unit: 'm' })
    expect(humanLength(107374182.4)).toEqual({ value: 107.4, unit: 'km' })
  })

  it('has milestones that really are milestones', () => {
    for (const m of FOLD_MILESTONES) expect(m.compareKey).toBe(`pow.foldCmp${m.folds}`)
    expect(milestoneAt(0)).toBeNull()
    expect(milestoneAt(9)?.folds).toBe(7)
    expect(milestoneAt(42)?.folds).toBe(42)
  })

  it('passes the Moon at 42 folds', () => {
    const far = humanLength(foldThicknessMm(42))
    expect(far.unit).toBe('km')
    expect(far.value).toBeGreaterThan(384400)
  })

  it('remembers the record', () => {
    expect(FOLD_RECORD).toEqual({ folds: 12, year: 2002, lengthKm: 1.2 })
  })
})

describe('zero and negative exponents', () => {
  it('turns a negative exponent into a reciprocal', () => {
    expect(powerFraction(2, -3)).toEqual({ p: 1, q: 8 })
    expect(powerFraction(10, -2)).toEqual({ p: 1, q: 100 })
    expect(powerFraction(5, -2)).toEqual(NEG_ANSWER)
  })

  it('gives 1 for the exponent 0', () => {
    for (const base of LADDER_BASES) expect(powerFraction(base, 0)).toEqual({ p: 1, q: 1 })
  })

  it('keeps a whole power whole', () => {
    expect(powerFraction(3, 4)).toEqual({ p: 81, q: 1 })
    expect(powerFraction(-2, 3)).toEqual({ p: -8, q: 1 })
    expect(powerFraction(-2, -3)).toEqual({ p: -1, q: 8 })
  })

  it('refuses the undefined cases of base 0', () => {
    expect(() => powerFraction(0, 0)).toThrow()
    expect(() => powerFraction(0, -1)).toThrow()
    expect(powerFraction(0, 3)).toEqual({ p: 0, q: 1 })
  })

  it('walks the ladder down one exponent at a time', () => {
    const rows = ladder(2, 5, -4)
    expect(rows).toHaveLength(10)
    expect(rows[0]).toEqual({ exp: 5, value: { p: 32, q: 1 } })
    expect(rows[5]).toEqual({ exp: 0, value: { p: 1, q: 1 } })
    expect(rows[9]).toEqual({ exp: -4, value: { p: 1, q: 16 } })
  })

  it('halves at every step of the base-2 ladder', () => {
    const rows = ladder(2, 5, -4)
    for (let i = 1; i < rows.length; i++) {
      const before = rows[i - 1].value
      const after = rows[i].value
      expect((before.p / before.q) / 2).toBeCloseTo(after.p / after.q, 12)
    }
  })
})

describe('the laws of powers', () => {
  it('names five laws, each with a general form', () => {
    expect(LAW_IDS).toHaveLength(5)
    for (const id of LAW_IDS) expect(LAW_TEX[id]).toBeTruthy()
  })

  it('adds the exponents of a product', () => {
    const law = lawInstance('product', 2, 3, 2)
    expect(law.leftTex).toBe('2^{3} \\cdot 2^{2}')
    expect(law.rightTex).toBe('2^{5}')
    expect(law.value).toBe(32)
    expect(law.resultExponent).toBe(5)
    expect(law.groups).toEqual([
      { label: '2', count: 3 },
      { label: '2', count: 2 },
    ])
  })

  it('subtracts the exponents of a quotient and cancels the rest', () => {
    const law = lawInstance('quotient', 2, 5, 2)
    expect(law.rightTex).toBe('2^{3}')
    expect(law.value).toBe(8)
    expect(law.cancel).toBe(2)
    expect(law.resultExponent).toBe(3)
  })

  it('multiplies the exponents of a power of a power', () => {
    const law = lawInstance('power', 3, 2, 3)
    expect(law.rightTex).toBe('3^{6}')
    expect(law.value).toBe(729)
    expect(law.groups).toHaveLength(3)
    expect(law.groups.every((g) => g.count === 2)).toBe(true)
  })

  it('splits a product base and a quotient base', () => {
    const prod = lawInstance('productBase', 2, 1, 3, 3)
    expect(prod.value).toBe(216)
    expect(prod.groups).toEqual([
      { label: '2', count: 3 },
      { label: '3', count: 3 },
    ])
    const quot = lawInstance('quotientBase', 2, 1, 3, 4)
    expect(quot.value).toBeCloseTo(0.125, 12)
    expect(quot.rightTex).toBe('\\frac{2^{3}}{4^{3}}')
  })

  it('makes both sides of every law agree', () => {
    for (const id of LAW_IDS) {
      for (let m = 2; m <= 5; m++) {
        for (let n = 1; n < m; n++) {
          const law = lawInstance(id, 2, m, n, 3)
          const expected =
            id === 'product'
              ? intPower(2, m) * intPower(2, n)
              : id === 'quotient'
                ? intPower(2, m) / intPower(2, n)
                : id === 'power'
                  ? intPower(intPower(2, m), n)
                  : id === 'productBase'
                    ? intPower(2, n) * intPower(3, n)
                    : intPower(2, n) / intPower(3, n)
          expect(law.value).toBeCloseTo(expected, 9)
        }
      }
    }
  })

  it('pins the exercise and the sum trap', () => {
    expect(LAWS_ANSWER).toBe(2 * 3 + 4 - 5)
    expect(intPower(SUM_TRAP.a + SUM_TRAP.b, 2)).toBe(49)
    expect(intPower(SUM_TRAP.a, 2) + intPower(SUM_TRAP.b, 2)).toBe(25)
  })
})

describe('normal form', () => {
  it('finds the mantissa and the exponent', () => {
    expect(toNormalForm('149600000')).toEqual({ mantissa: '1.496', exponent: 8 })
    expect(toNormalForm('0.00052')).toEqual({ mantissa: '5.2', exponent: -4 })
    expect(toNormalForm('7')).toEqual({ mantissa: '7', exponent: 0 })
    expect(toNormalForm('8849')).toEqual({ mantissa: '8.849', exponent: 3 })
    expect(toNormalForm('0')).toEqual({ mantissa: '0', exponent: 0 })
  })

  it('keeps every digit of a number no float could hold', () => {
    expect(toNormalForm('5972000000000000000000000')).toEqual({ mantissa: '5.972', exponent: 24 })
    expect(toNormalForm('0.0000000001')).toEqual({ mantissa: '1', exponent: -10 })
  })

  it('moves the point without going through a float', () => {
    expect(shiftPoint('149600000', -8)).toBe('1.496')
    expect(shiftPoint('149600000', 0)).toBe('149600000')
    expect(shiftPoint('149600000', -4)).toBe('14960')
    expect(shiftPoint('0.00052', 4)).toBe('5.2')
    expect(shiftPoint('5.2', -1)).toBe('0.52')
  })

  it('knows when a mantissa is where it belongs', () => {
    expect(isNormalMantissa('1')).toBe(true)
    expect(isNormalMantissa('9.99')).toBe(true)
    expect(isNormalMantissa('0.52')).toBe(false)
    expect(isNormalMantissa('14.96')).toBe(false)
  })

  it('goes back to plain digits', () => {
    expect(fromNormalForm({ mantissa: '5.2', exponent: -4 })).toBe('0.00052')
    expect(fromNormalForm({ mantissa: '1.496', exponent: 8 })).toBe('149600000')
  })

  it('round-trips every preset', () => {
    for (const p of SCI_PRESETS) {
      const sci = toNormalForm(p.digits)
      expect(isNormalMantissa(sci.mantissa), p.id).toBe(true)
      expect(fromNormalForm(sci), p.id).toBe(shiftPoint(p.digits, 0))
    }
  })

  it('writes the chosen decimal separator into the tex', () => {
    expect(sciTex({ mantissa: '5.2', exponent: -4 }, ',')).toBe('5{,}2 \\cdot 10^{-4}')
    expect(sciTex({ mantissa: '7', exponent: 0 }, ',')).toBe('7 \\cdot 10^{0}')
  })

  it('pins the exercise', () => {
    expect(toNormalForm('0.00052')).toEqual(SCI_ANSWER)
  })
})

describe('calculating in normal form', () => {
  it('multiplies mantissas and adds exponents', () => {
    const { raw, result } = multiplySci({ mantissa: '2', exponent: 3 }, { mantissa: '3', exponent: 4 })
    expect(raw).toEqual({ mantissa: '6', exponent: 7 })
    expect(result).toEqual({ mantissa: '6', exponent: 7 })
  })

  it('moves the point once more when the mantissa runs over 10', () => {
    const { raw, result } = multiplySci({ mantissa: '4', exponent: 3 }, { mantissa: '5', exponent: 2 })
    expect(raw).toEqual({ mantissa: '20', exponent: 5 })
    expect(result).toEqual({ mantissa: '2', exponent: 6 })
    expect(isNormalMantissa(result.mantissa)).toBe(true)
  })

  it('divides mantissas and subtracts exponents', () => {
    const { raw, result } = divideSci({ mantissa: '2', exponent: 6 }, { mantissa: '8', exponent: 2 })
    expect(raw).toEqual({ mantissa: '0.25', exponent: 4 })
    expect(result).toEqual({ mantissa: '2.5', exponent: 3 })
  })

  it('keeps the value while renormalising', () => {
    const a = { mantissa: '3.7', exponent: 5 }
    const b = { mantissa: '8.1', exponent: -2 }
    for (const { raw, result } of [multiplySci(a, b), divideSci(a, b)]) {
      const rawValue = Number(raw.mantissa) * Math.pow(10, raw.exponent)
      const value = Number(result.mantissa) * Math.pow(10, result.exponent)
      expect(value / rawValue).toBeCloseTo(1, 9)
      expect(isNormalMantissa(result.mantissa)).toBe(true)
    }
  })

  it('has six claims, three of them plausible', () => {
    expect(SCI_CLAIMS).toHaveLength(6)
    expect(SCI_CLAIMS.filter((c) => c.plausible)).toHaveLength(3)
    expect(SCI_CLAIMS_ANSWER).toBe('ok|bad|ok|ok|bad|bad')
  })

  it('marks a claim wrong exactly when it misses the true order of magnitude', () => {
    for (const c of SCI_CLAIMS) {
      expect(c.plausible, c.id).toBe(c.mantissa === c.trueMantissa && c.exponent === c.trueExponent)
    }
  })

  it('gets a human life to a couple of billion seconds', () => {
    const { result } = multiplySci(
      toNormalForm(String(LIFE_SECONDS.years)),
      LIFE_SECONDS.secondsPerYear,
    )
    expect(result).toEqual({ mantissa: '2.52', exponent: 9 })
  })
})

describe('the square root', () => {
  it('knows a perfect square when it sees one', () => {
    expect(isPerfectSquare(49)).toBe(true)
    expect(isPerfectSquare(50)).toBe(false)
    expect(isPerfectSquare(0)).toBe(true)
    expect(isPerfectSquare(-4)).toBe(false)
  })

  it('lists the first fifteen squares', () => {
    expect(PERFECT_SQUARES).toHaveLength(15)
    expect(PERFECT_SQUARES[0]).toBe(1)
    expect(PERFECT_SQUARES[14]).toBe(225)
    for (const n of PERFECT_SQUARES) expect(isPerfectSquare(n)).toBe(true)
  })

  it('catches a root between two whole numbers', () => {
    expect(neighbourSquares(50)).toEqual({ lo: 7, hi: 8 })
    expect(neighbourSquares(49)).toEqual({ lo: 7, hi: 8 })
    expect(neighbourSquares(0)).toEqual({ lo: 0, hi: 1 })
    for (let a = 0; a <= 200; a++) {
      const { lo, hi } = neighbourSquares(a)
      expect(lo * lo, String(a)).toBeLessThanOrEqual(a)
      expect(hi * hi, String(a)).toBeGreaterThan(a)
    }
  })

  it('writes the root to as many places as asked', () => {
    expect(sqrtText(50, 3)).toBe('7.071')
    expect(sqrtText(2, 4)).toBe('1.4142')
    expect(sqrtText(49, 0)).toBe('7')
  })

  it('pins the exercise: a root is never negative', () => {
    expect(Math.sqrt(intPower(-7, 2))).toBe(SQRT_ANSWER)
  })
})

describe('the laws of square roots', () => {
  it('pulls the largest square factor outside', () => {
    expect(simplifyRoot(48)).toEqual({ outside: 4, inside: 3 })
    expect(simplifyRoot(36)).toEqual({ outside: 6, inside: 1 })
    expect(simplifyRoot(7)).toEqual({ outside: 1, inside: 7 })
    expect(simplifyRoot(200)).toEqual({ outside: 10, inside: 2 })
  })

  it('keeps the value while simplifying', () => {
    for (const n of SIMPLIFY_CHOICES) {
      const { outside, inside } = simplifyRoot(n)
      expect(outside * outside * inside, String(n)).toBe(n)
      expect(outside * Math.sqrt(inside), String(n)).toBeCloseTo(Math.sqrt(n), 9)
      expect(simplifyRoot(inside).outside, String(n)).toBe(1)
    }
  })

  it('makes the product law hold for every pair of choices', () => {
    for (const a of ROOT_LAW_CHOICES) {
      for (const b of ROOT_LAW_CHOICES) {
        expect(Math.sqrt(a * b)).toBeCloseTo(Math.sqrt(a) * Math.sqrt(b), 9)
        expect(Math.sqrt(a / b)).toBeCloseTo(Math.sqrt(a) / Math.sqrt(b), 9)
      }
    }
  })

  it('pins the sum trap and the exercise', () => {
    expect(Math.sqrt(ROOT_SUM_TRAP.a + ROOT_SUM_TRAP.b)).toBe(5)
    expect(Math.sqrt(ROOT_SUM_TRAP.a) + Math.sqrt(ROOT_SUM_TRAP.b)).toBe(7)
    expect(simplifyRoot(48)).toEqual(SIMPLIFY_ANSWER)
  })
})

describe('the n-th root and fractional exponents', () => {
  it('is exact on perfect powers', () => {
    expect(nthRoot(8, 3)).toBe(2)
    expect(nthRoot(1000, 3)).toBe(10)
    expect(nthRoot(16, 4)).toBe(2)
    expect(nthRoot(32, 5)).toBe(2)
    for (const v of CUBE_PRESETS) expect(Math.pow(nthRoot(v, 3)!, 3)).toBeCloseTo(v, 9)
  })

  it('keeps the sign of an odd root and refuses an even one', () => {
    expect(nthRoot(-8, 3)).toBe(-2)
    expect(nthRoot(-4, 2)).toBeNull()
    expect(nthRoot(-16, 4)).toBeNull()
  })

  it('refuses an n below 2', () => {
    expect(() => nthRoot(8, 1)).toThrow()
  })

  it('reads a fractional exponent as a root and a power', () => {
    expect(rationalPower(8, 1, 3)).toBe(2)
    expect(rationalPower(16, 3, 4)).toBe(8)
    expect(rationalPower(27, 2, 3)).toBe(9)
    expect(rationalPower(4, -1, 2)).toBe(0.5)
    expect(rationalPower(32, 1, 5)).toBe(2)
    expect(rationalPower(-4, 1, 2)).toBeNull()
  })

  it('gives a whole answer for every row of the table', () => {
    for (const row of RATIONAL_TABLE) {
      const value = rationalPower(row.a, row.m, row.n)
      expect(value, String(row.a)).not.toBeNull()
      expect(Math.pow(value!, row.n), String(row.a)).toBeCloseTo(Math.pow(row.a, row.m), 9)
    }
  })

  it('pins the exercise', () => {
    expect(rationalPower(16, 3, 4)).toBe(NTH_ANSWER)
  })
})
