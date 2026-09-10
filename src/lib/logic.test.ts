import { describe, expect, it } from 'vitest'
import { interR, regionsOf, unionR, circleRegions, diffR } from './sets'
import {
  applyConnective,
  connectiveRegions,
  domainOf,
  evalQuantified,
  idsWhere,
  implicationReport,
  isPrime,
  LOGIC_PREDICATES,
  logicPredicateById,
  negate,
} from './logic'

describe('connectives', () => {
  it('follows the textbook truth tables', () => {
    const rows: Array<[boolean, boolean]> = [
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ]
    expect(rows.map(([a, b]) => applyConnective('and', a, b))).toEqual([false, false, false, true])
    expect(rows.map(([a, b]) => applyConnective('or', a, b))).toEqual([false, true, true, true])
    expect(rows.map(([a, b]) => applyConnective('xor', a, b))).toEqual([false, true, true, false])
    expect(rows.map(([a, b]) => applyConnective('imp', a, b))).toEqual([true, true, false, true])
    expect(rows.map(([a, b]) => applyConnective('iff', a, b))).toEqual([true, false, false, true])
  })

  it('maps onto the set operations of the Venn diagram', () => {
    const A = circleRegions(0, 2)
    const B = circleRegions(1, 2)
    expect(connectiveRegions('and')).toBe(interR(A, B))
    expect(connectiveRegions('or')).toBe(unionR(A, B))
    expect(connectiveRegions('xor')).toBe(unionR(diffR(A, B), diffR(B, A)))
    // "If A then B" fails only in the region inside A but outside B.
    expect(regionsOf(connectiveRegions('imp'), 2)).toEqual([0, 2, 3])
    expect(regionsOf(connectiveRegions('iff'), 2)).toEqual([0, 3])
  })
})

describe('predicates', () => {
  it('has unique ids and a fallback for unknown ones', () => {
    const ids = LOGIC_PREDICATES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(logicPredicateById('nope')).toBe(LOGIC_PREDICATES[0])
  })

  it('offers same-set pairs under different names for the biconditional', () => {
    expect(idsWhere(logicPredicateById('div6').test)).toEqual(idsWhere(logicPredicateById('evenDiv3').test))
    expect(idsWhere(logicPredicateById('even').test)).toEqual(idsWhere(logicPredicateById('notOdd').test))
  })

  it('negation picks exactly the other elements', () => {
    const even = logicPredicateById('even')
    expect(idsWhere(negate(even).test)).toEqual([1, 3, 5, 7, 9, 11])
    expect(idsWhere(negate(negate(even)).test)).toEqual(idsWhere(even.test))
  })
})

describe('quantifiers', () => {
  it('"for all" fails on the first counterexample and "some" needs one example', () => {
    const even = logicPredicateById('even')
    const all = evalQuantified('all', domainOf('all'), even)
    expect(all.value).toBe(false)
    expect(all.counterexamples).toEqual([1, 3, 5, 7, 9, 11])
    expect(evalQuantified('some', domainOf('all'), even).value).toBe(true)
  })

  it('restricting the domain can make "for all" true', () => {
    const even = logicPredicateById('even')
    expect(evalQuantified('all', domainOf('div6'), even).value).toBe(true)
    expect(evalQuantified('all', domainOf('gt6'), even).counterexamples).toEqual([7, 9, 11])
  })

  it('"some" is false over a domain with no example', () => {
    expect(evalQuantified('some', domainOf('odd'), logicPredicateById('even')).value).toBe(false)
  })
})

describe('implication', () => {
  it('is a subset check, and the converse the reverse one', () => {
    const r = implicationReport(logicPredicateById('div6'), logicPredicateById('even'))
    expect(r.forward).toBe(true)
    expect(r.converse).toBe(false)
    expect(r.counterConverse).toEqual([2, 4, 8, 10])
    expect(r.iff).toBe(false)
  })

  it('holds both ways exactly when the sets agree', () => {
    expect(implicationReport(logicPredicateById('div6'), logicPredicateById('evenDiv3')).iff).toBe(true)
    expect(implicationReport(logicPredicateById('even'), logicPredicateById('large')).iff).toBe(true)
  })

  it('a false premise never refutes it', () => {
    // Nothing is both prime and divisible by 6, so "if prime then anything" holds
    // only where prime is true; here 2 is prime but not odd.
    const r = implicationReport(logicPredicateById('prime'), logicPredicateById('odd'))
    expect(r.counterForward).toEqual([2])
  })
})

describe('primality', () => {
  it('sorts the small numbers into primes and composites', () => {
    expect([1, 2, 3, 4, 41, 1681].map(isPrime)).toEqual([false, true, true, false, true, false])
  })
})
