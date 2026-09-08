import { describe, expect, it } from 'vitest'
import {
  allRegions,
  binomial,
  bucketByRegion,
  checkAssignment,
  checkScheme,
  circleRegions,
  circleSize,
  complR,
  diffR,
  elemSignature,
  EXPRESSIONS,
  inR,
  interR,
  interSize,
  isDisjoint,
  isProperSubset,
  isSubset,
  MAPPINGS,
  nameRegionSet,
  popcount,
  PREDICATES,
  regionsOf,
  regionTex,
  relationOf,
  SCHEMES,
  selectBy,
  setsEqual,
  sieveTerms,
  sieveTotal,
  timesCounted,
  unionR,
  unionSize,
  UNIVERSE,
} from './sets'

describe('region bitfields', () => {
  it('has 4 regions for two circles and 8 for three', () => {
    expect(regionsOf(allRegions(2), 2)).toHaveLength(4)
    expect(regionsOf(allRegions(3), 3)).toHaveLength(8)
  })

  it('builds a circle from exactly the regions inside it', () => {
    // With two circles the regions are 00, 01, 10, 11. Circle A is bit 0.
    expect(regionsOf(circleRegions(0, 2), 2)).toEqual([1, 3])
    expect(regionsOf(circleRegions(1, 2), 2)).toEqual([2, 3])
    // With three circles, half of the eight regions lie inside each circle.
    for (let i = 0; i < 3; i++) {
      expect(regionsOf(circleRegions(i, 3), 3)).toHaveLength(4)
    }
  })

  it('never includes the outside region in any circle', () => {
    for (let n = 2; n <= 3; n++) {
      for (let i = 0; i < n; i++) expect(inR(circleRegions(i, n), 0)).toBe(false)
    }
  })

  it('treats union, intersection and complement as the boolean operations', () => {
    const a = circleRegions(0, 3)
    const b = circleRegions(1, 3)
    expect(unionR(a, b)).toBe(a | b)
    expect(interR(a, b)).toBe(a & b)
    expect(diffR(a, b)).toBe(interR(a, complR(b, 3)))
  })

  it('satisfies De Morgan for both two and three circles', () => {
    for (const n of [2, 3] as const) {
      const a = circleRegions(0, n)
      const b = circleRegions(1, n)
      expect(complR(interR(a, b), n)).toBe(unionR(complR(a, n), complR(b, n)))
      expect(complR(unionR(a, b), n)).toBe(interR(complR(a, n), complR(b, n)))
    }
  })

  it('satisfies distributivity', () => {
    const [a, b, c] = [0, 1, 2].map((i) => circleRegions(i, 3))
    expect(interR(a, unionR(b, c))).toBe(unionR(interR(a, b), interR(a, c)))
    expect(unionR(a, interR(b, c))).toBe(interR(unionR(a, b), unionR(a, c)))
  })

  it('complements back to the original', () => {
    for (const n of [2, 3] as const) {
      for (let rs = 0; rs <= allRegions(n); rs++) expect(complR(complR(rs, n), n)).toBe(rs)
    }
  })
})

describe('regionTex', () => {
  it('names the outside region as a complement of everything', () => {
    expect(regionTex(0, 2)).toBe('\\overline{A \\cup B}')
    expect(regionTex(0, 3)).toBe('\\overline{A \\cup B \\cup C}')
  })

  it('names the innermost region without any subtraction', () => {
    expect(regionTex(0b11, 2)).toBe('A \\cap B')
    expect(regionTex(0b111, 3)).toBe('A \\cap B \\cap C')
  })

  it('subtracts a single outside circle bare and several in parentheses', () => {
    expect(regionTex(0b011, 3)).toBe('A \\cap B \\setminus C')
    expect(regionTex(0b001, 3)).toBe('A \\setminus (B \\cup C)')
  })
})

describe('named expressions', () => {
  it('matches every catalogued expression back to itself', () => {
    for (const e of EXPRESSIONS) expect(nameRegionSet(e.value, e.n)?.id).toBe(e.id)
  })

  it('does not confuse a two-circle value with a three-circle one', () => {
    const union2 = EXPRESSIONS.find((e) => e.id === 'union2')!
    expect(nameRegionSet(union2.value, 3)?.id).not.toBe('union2')
  })

  it('returns null for a region set with no name in the catalogue', () => {
    // Just the outside region is not one of the offered expressions.
    expect(nameRegionSet(1 << 0, 3)).toBeNull()
  })

  it('agrees with its own tex about how many circles it mentions', () => {
    for (const e of EXPRESSIONS) {
      if (e.n === 2) expect(e.tex).not.toContain('C')
      expect(e.value).toBeLessThanOrEqual(allRegions(e.n))
    }
  })
})

describe('inclusion-exclusion', () => {
  it('counts bits', () => {
    expect(popcount(0)).toBe(0)
    expect(popcount(0b1011)).toBe(3)
  })

  it('computes binomial coefficients', () => {
    expect(binomial(3, 0)).toBe(1)
    expect(binomial(3, 2)).toBe(3)
    expect(binomial(5, 2)).toBe(10)
    expect(binomial(3, 4)).toBe(0)
  })

  it('over-counts an overlap before the correction and settles at one after', () => {
    const both = 0b11 // a region inside both A and B
    expect(timesCounted(both, 1)).toBe(2) // added twice, once by |A| and once by |B|
    expect(timesCounted(both, 2)).toBe(1) // minus |A ∩ B| brings it back to one
  })

  it('counts every non-empty region exactly once at full depth', () => {
    // This is the whole reason the alternating sum works.
    for (const n of [2, 3] as const) {
      for (let sig = 1; sig < 1 << n; sig++) expect(timesCounted(sig, n)).toBe(1)
    }
  })

  it('never counts the outside region', () => {
    for (let depth = 0; depth <= 3; depth++) expect(timesCounted(0, depth)).toBe(0)
  })

  it('sums a circle from the regions inside it', () => {
    // Regions indexed by signature: [outside, A only, B only, both]
    const counts = [5, 3, 4, 2]
    expect(circleSize(counts, 0, 2)).toBe(3 + 2)
    expect(circleSize(counts, 1, 2)).toBe(4 + 2)
    expect(interSize(counts, 0b11, 2)).toBe(2)
    expect(unionSize(counts, 2)).toBe(3 + 4 + 2)
  })

  it('makes the sieve total equal the plain sum over regions', () => {
    const two = [5, 3, 4, 2]
    expect(sieveTotal(two, 2)).toBe(unionSize(two, 2))
    const three = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(sieveTotal(three, 3)).toBe(unionSize(three, 3))
  })

  it('holds for many random count vectors', () => {
    for (let trial = 0; trial < 200; trial++) {
      const counts = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20))
      expect(sieveTotal(counts, 3)).toBe(unionSize(counts, 3))
    }
  })

  it('orders sieve terms by how many circles they intersect', () => {
    const terms = sieveTerms([1, 2, 3, 4, 5, 6, 7, 8], 3)
    expect(terms).toHaveLength(7) // 3 singles, 3 pairs, 1 triple
    expect(terms.map((term) => popcount(term.mask))).toEqual([1, 1, 1, 2, 2, 2, 3])
    expect(terms.map((term) => term.sign)).toEqual([1, 1, 1, -1, -1, -1, 1])
  })

  it('reproduces the classic word problem', () => {
    // 30 students, 18 football, 15 swimming, 7 both. How many do neither?
    const both = 7
    const footballOnly = 18 - both
    const swimOnly = 15 - both
    const counts = [0, footballOnly, swimOnly, both]
    expect(sieveTotal(counts, 2)).toBe(18 + 15 - 7)
    expect(30 - sieveTotal(counts, 2)).toBe(4)
  })
})

describe('the element universe', () => {
  it('has twelve elements numbered 1 to 12', () => {
    expect(UNIVERSE).toHaveLength(12)
    expect(UNIVERSE.map((e) => e.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('gives every predicate a non-trivial extension', () => {
    // A predicate matching nothing or everything would make the lesson pointless.
    for (const p of PREDICATES) {
      const picked = selectBy(p)
      expect(picked.size, `${p.id} matched nothing`).toBeGreaterThan(0)
      expect(picked.size, `${p.id} matched everything`).toBeLessThan(UNIVERSE.length)
    }
  })

  it('offers a predicate pair for every set relation the lesson names', () => {
    const found = new Set(
      PREDICATES.flatMap((p) =>
        PREDICATES.map((q) => relationOf(selectBy(p), selectBy(q))),
      ),
    )
    for (const rel of ['equal', 'subsetAB', 'subsetBA', 'disjoint', 'overlap']) {
      expect(found, `no predicate pair produces ${rel}`).toContain(rel)
    }
  })

  it('partitions the universe across regions, losing and duplicating nothing', () => {
    const preds = [PREDICATES[0], PREDICATES[2], PREDICATES[4]]
    const buckets = bucketByRegion(preds)
    expect(buckets).toHaveLength(8)
    expect(buckets.flat().sort((a, b) => a - b)).toEqual(UNIVERSE.map((e) => e.id))
  })

  it('puts each element in the bucket its own signature names', () => {
    const preds = [PREDICATES[0], PREDICATES[2], PREDICATES[4]]
    bucketByRegion(preds).forEach((ids, sig) => {
      for (const id of ids) {
        const elem = UNIVERSE.find((e) => e.id === id)!
        expect(elemSignature(elem, preds)).toBe(sig)
      }
    })
  })
})

describe('set relations', () => {
  const s = (...xs: number[]) => new Set(xs)

  it('recognises equality regardless of insertion order', () => {
    expect(setsEqual(s(1, 2, 3), s(3, 2, 1))).toBe(true)
    expect(relationOf(s(1, 2), s(2, 1))).toBe('equal')
  })

  it('treats the empty set as a subset of everything', () => {
    expect(isSubset(s(), s(1, 2))).toBe(true)
    expect(isProperSubset(s(), s(1))).toBe(true)
    expect(relationOf(s(), s(1, 2))).toBe('subsetAB')
  })

  it('does not call an equal set a proper subset', () => {
    expect(isSubset(s(1, 2), s(1, 2))).toBe(true)
    expect(isProperSubset(s(1, 2), s(1, 2))).toBe(false)
  })

  it('reports containment before disjointness or overlap', () => {
    expect(relationOf(s(1), s(1, 2))).toBe('subsetAB')
    expect(relationOf(s(1, 2), s(1))).toBe('subsetBA')
    expect(relationOf(s(1), s(2))).toBe('disjoint')
    expect(relationOf(s(1, 2), s(2, 3))).toBe('overlap')
  })

  it('calls two empty sets equal rather than disjoint', () => {
    expect(relationOf(s(), s())).toBe('equal')
    expect(isDisjoint(s(), s())).toBe(true)
  })
})

describe('classification', () => {
  it('accepts the schemes that really do partition the universe', () => {
    for (const id of ['byShape', 'byMod3']) {
      const scheme = SCHEMES.find((sc) => sc.id === id)!
      const check = checkScheme(scheme.bins)
      expect(check.ok, `${id} should be a partition`).toBe(true)
      expect(check.overlapping).toEqual([])
      expect(check.uncovered).toEqual([])
    }
  })

  it('rejects the deliberately broken scheme and says why', () => {
    const broken = SCHEMES.find((sc) => sc.id === 'broken')!
    const check = checkScheme(broken.bins)
    expect(check.ok).toBe(false)
    // It fails both ways: small blue elements land in two bins, large
    // non-blue ones land in none.
    expect(check.overlapping.length).toBeGreaterThan(0)
    expect(check.uncovered.length).toBeGreaterThan(0)
  })

  it('accepts a hand assignment only once every element is placed', () => {
    const bins = ['a', 'b']
    const partial = new Map(UNIVERSE.slice(0, 5).map((e) => [e.id, 'a']))
    expect(checkAssignment(partial, bins).ok).toBe(false)
    expect(checkAssignment(partial, bins).uncovered).toHaveLength(7)

    const full = new Map(UNIVERSE.map((e) => [e.id, e.id % 2 ? 'a' : 'b']))
    expect(checkAssignment(full, bins).ok).toBe(true)
  })

  it('does not count an element placed in a bin that no longer exists', () => {
    const stale = new Map(UNIVERSE.map((e) => [e.id, 'gone']))
    expect(checkAssignment(stale, ['a', 'b']).ok).toBe(false)
    expect(checkAssignment(stale, ['a', 'b']).uncovered).toHaveLength(12)
  })
})

describe('bijections', () => {
  it('never sends two different numbers to the same partner', () => {
    for (const m of MAPPINGS) {
      const seen = new Set<number>()
      for (let n = 1; n <= 50; n++) {
        const image = m.apply(n)
        expect(seen.has(image), `${m.id} is not injective at ${n}`).toBe(false)
        seen.add(image)
      }
    }
  })

  it('is strictly increasing, so the drawn arrows never cross', () => {
    for (const m of MAPPINGS) {
      for (let n = 1; n < 50; n++) expect(m.apply(n + 1)).toBeGreaterThan(m.apply(n))
    }
  })

  it('maps onto the sets the lesson claims', () => {
    const double = MAPPINGS.find((m) => m.id === 'double')!
    expect([1, 2, 3, 4].map(double.apply)).toEqual([2, 4, 6, 8])
    const odd = MAPPINGS.find((m) => m.id === 'odd')!
    expect([1, 2, 3, 4].map(odd.apply)).toEqual([1, 3, 5, 7])
    const triple = MAPPINGS.find((m) => m.id === 'triple')!
    expect([1, 2, 3, 4].map(triple.apply)).toEqual([3, 6, 9, 12])
  })
})
