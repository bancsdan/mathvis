import { describe, expect, it } from 'vitest'
import { interR, regionsOf, unionR, circleRegions, diffR } from './sets'
import {
  ALL_ASSIGNMENTS,
  applyConnective,
  claimHolds,
  connectiveRegions,
  domainOf,
  eulerPolynomial,
  evalQuantified,
  idsWhere,
  implicationReport,
  isConsistent,
  isPrime,
  LOGIC_PREDICATES,
  logicPredicateById,
  negate,
  nimComputerMove,
  nimIsLosing,
  nimWinningMove,
  PROOF_STEPS,
  PROOF_STEPS_SHUFFLED,
  proofOrderCorrect,
  PUZZLES,
  puzzleById,
  SENTENCES,
  smallestFactor,
  solutions,
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

describe('sentences', () => {
  it('has all three kinds and unique ids', () => {
    const kinds = new Set(SENTENCES.map((s) => s.kind))
    expect(kinds).toEqual(new Set(['true', 'false', 'none']))
    expect(new Set(SENTENCES.map((s) => s.id)).size).toBe(SENTENCES.length)
  })
})

describe('proof', () => {
  it('primes and factors', () => {
    expect([1, 2, 3, 4, 41, 1681].map(isPrime)).toEqual([false, true, true, false, true, false])
    expect(smallestFactor(1681)).toBe(41)
    expect(smallestFactor(43)).toBe(43)
  })

  it("Euler's polynomial is prime for forty cases and then fails", () => {
    for (let n = 0; n < 40; n++) expect(isPrime(eulerPolynomial(n))).toBe(true)
    expect(eulerPolynomial(40)).toBe(41 * 41)
    expect(isPrime(eulerPolynomial(40))).toBe(false)
  })

  it('the shuffled steps are a permutation and only the true order passes', () => {
    expect([...PROOF_STEPS_SHUFFLED].sort()).toEqual([...PROOF_STEPS].sort())
    expect(proofOrderCorrect(PROOF_STEPS)).toBe(true)
    expect(proofOrderCorrect(PROOF_STEPS_SHUFFLED)).toBe(false)
    expect(proofOrderCorrect(PROOF_STEPS.slice(0, 3))).toBe(false)
  })
})

describe('knights and knaves', () => {
  it('evaluates claims against an assignment', () => {
    const a = { A: 'knight', B: 'knave' } as const
    expect(claimHolds({ kind: 'isKnave', who: 'B' }, a)).toBe(true)
    expect(claimHolds({ kind: 'bothKnights' }, a)).toBe(false)
    expect(claimHolds({ kind: 'atLeastOneKnave' }, a)).toBe(true)
    expect(claimHolds({ kind: 'differentKinds' }, a)).toBe(true)
  })

  it('"we are both knaves" can only come from a knave with a knight beside him', () => {
    expect(solutions(puzzleById('bothKnaves'))).toEqual([{ A: 'knave', B: 'knight' }])
  })

  it('solves the remaining puzzles', () => {
    expect(solutions(puzzleById('vouch'))).toEqual([{ A: 'knave', B: 'knave' }])
    expect(solutions(puzzleById('atLeastOne'))).toEqual([{ A: 'knight', B: 'knave' }])
    // Mutual accusation is satisfied by either being the knight, so it is undecidable.
    expect(solutions(puzzleById('accuse'))).toHaveLength(2)
  })

  it('every puzzle has at least one solution and the fallback puzzle exists', () => {
    for (const p of PUZZLES) expect(solutions(p).length).toBeGreaterThan(0)
    expect(puzzleById('nope')).toBe(PUZZLES[0])
    expect(ALL_ASSIGNMENTS.filter((a) => isConsistent(PUZZLES[0], a))).toHaveLength(1)
  })
})

describe('nim', () => {
  it('leaves a multiple of four when it can', () => {
    expect(nimWinningMove(13)).toBe(1)
    expect(nimWinningMove(7)).toBe(3)
    expect(nimWinningMove(8)).toBeNull()
    expect(nimWinningMove(2)).toBe(2)
  })

  it('always makes a legal move', () => {
    for (let pile = 1; pile <= 20; pile++) {
      const take = nimComputerMove(pile)
      expect(take).toBeGreaterThanOrEqual(1)
      expect(take).toBeLessThanOrEqual(Math.min(3, pile))
    }
  })

  it('knows the losing positions', () => {
    expect([4, 8, 12].every((p) => nimIsLosing(p))).toBe(true)
    expect([1, 2, 3, 5, 13].some((p) => nimIsLosing(p))).toBe(false)
  })
})
