import { describe, expect, it } from 'vitest'
import {
  allPermutations,
  buildChoiceTree,
  buildPermutationTree,
  circulantEdges,
  combinations,
  completeEdgeCount,
  completeGraphEdges,
  countMultiples,
  deadEnds,
  degreeSum,
  degrees,
  distinctPermutations,
  edgeKey,
  EXPRESSION_ANSWER,
  EXPRESSION_STORIES,
  factorial,
  gcd,
  GRAPH_STORIES,
  GRAPH_STORY_ANSWER,
  hasEdge,
  lcm,
  leafCount,
  multisetPermutationCount,
  PEOPLE,
  productOf,
  regularGraphPossible,
  satisfies,
  sieveCounts,
  stillPossible,
  STORY_GRAPH_EDGES,
  subsets,
  SUBJECTS,
  TIMETABLE_CONSTRAINTS,
  toggleEdge,
  validTimetables,
  variations,
  WRONG_SOLUTION,
  WRONG_STEP,
  type Constraint,
  type Edge,
  type Subject,
} from './combinatorics'

describe('counting', () => {
  it('factorial, variations and combinations agree with the textbook values', () => {
    expect([0, 1, 2, 3, 4, 5, 10].map(factorial)).toEqual([1, 1, 2, 6, 24, 120, 3628800])
    expect(variations(5, 3)).toBe(60)
    expect(variations(5, 5)).toBe(120)
    expect(variations(5, 0)).toBe(1)
    expect(variations(3, 4)).toBe(0)
    expect(combinations(5, 3)).toBe(10)
    expect(combinations(8, 3)).toBe(56)
    // The lottery: 5 numbers out of 90.
    expect(combinations(90, 5)).toBe(43949268)
  })

  it('ordered choices are the unordered ones lined up in every order', () => {
    for (let n = 1; n <= 8; n++) {
      for (let k = 0; k <= n; k++) expect(variations(n, k)).toBe(combinations(n, k) * factorial(k))
    }
  })

  it('multiplies the steps of a multi-step choice', () => {
    expect(productOf([2, 3])).toBe(6)
    expect(productOf([3, 4, 2])).toBe(24)
    expect(productOf([])).toBe(1)
  })
})

describe('listing possibilities', () => {
  it('lists every ordering once, first item varying slowest', () => {
    expect(allPermutations(['a', 'b', 'c'])).toEqual([
      ['a', 'b', 'c'],
      ['a', 'c', 'b'],
      ['b', 'a', 'c'],
      ['b', 'c', 'a'],
      ['c', 'a', 'b'],
      ['c', 'b', 'a'],
    ])
    for (let n = 1; n <= 6; n++) {
      const items = Array.from({ length: n }, (_, i) => i)
      const perms = allPermutations(items)
      expect(perms).toHaveLength(factorial(n))
      expect(new Set(perms.map((p) => p.join(','))).size).toBe(factorial(n))
    }
  })

  it('collapses the orderings that repeated letters make look alike', () => {
    expect(multisetPermutationCount('ALMA')).toBe(12)
    expect(distinctPermutations('ALMA')).toHaveLength(12)
    expect(distinctPermutations('ALMA')[0]).toBe('AALM')
    expect(distinctPermutations('AAAA')).toEqual(['AAAA'])
    expect(multisetPermutationCount('ABC')).toBe(factorial(3))
    for (const word of ['ALMA', 'ANNA', 'KEREK', 'ABC']) {
      expect(distinctPermutations(word)).toHaveLength(multisetPermutationCount(word))
    }
  })

  it('lists the k-subsets in index order and there are C(n, k) of them', () => {
    expect(subsets(['a', 'b', 'c'], 2)).toEqual([
      ['a', 'b'],
      ['a', 'c'],
      ['b', 'c'],
    ])
    expect(subsets([1, 2, 3, 4, 5], 3)).toHaveLength(10)
    expect(subsets([1, 2, 3], 0)).toEqual([[]])
    expect(subsets([1, 2, 3], 4)).toEqual([])
    for (let k = 0; k <= 6; k++) expect(subsets([1, 2, 3, 4, 5, 6], k)).toHaveLength(combinations(6, k))
  })
})

describe('choice tree', () => {
  it('has as many leaves as the multiplication rule predicts', () => {
    const levels = [
      ['p1', 'p2'],
      ['n1', 'n2', 'n3'],
    ]
    const nodes = buildChoiceTree(levels)
    expect(leafCount(nodes, 2)).toBe(6)
    expect(nodes.filter((n) => n.depth === 1)).toHaveLength(2)
    expect(nodes[0].parent).toBeNull()
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length)
    expect(leafCount(buildChoiceTree([['a', 'b'], ['c', 'd'], ['e', 'f', 'g']]), 3)).toBe(12)
    expect(buildChoiceTree([])).toHaveLength(1)
  })

  it('every node except the root has an existing parent', () => {
    const nodes = buildChoiceTree([['a', 'b'], ['c', 'd', 'e']])
    const ids = new Set(nodes.map((n) => n.id))
    for (const n of nodes.slice(1)) expect(ids.has(n.parent as string)).toBe(true)
  })

  it('the unpruned ordering tree has n! leaves and no dead ends', () => {
    const nodes = buildPermutationTree(['A', 'B', 'C'])
    expect(leafCount(nodes, 3)).toBe(6)
    expect(deadEnds(nodes, 3).size).toBe(0)
  })

  it('pruning cuts a branch as soon as it is hopeless', () => {
    // "A must come first": the branches starting with B or C die at depth 1.
    const nodes = buildPermutationTree(['A', 'B', 'C'], (prefix) => prefix[0] === 'A')
    expect(leafCount(nodes, 3)).toBe(2)
    expect(deadEnds(nodes, 3).size).toBe(2)
    expect(nodes.filter((n) => n.depth === 1)).toHaveLength(3)
  })
})

describe('timetable', () => {
  const named = (id: string): Constraint => TIMETABLE_CONSTRAINTS.find((c) => c.id === id)!.constraint

  it('has four distinct conditions over the four subjects', () => {
    expect(SUBJECTS).toHaveLength(4)
    expect(new Set(TIMETABLE_CONSTRAINTS.map((c) => c.id)).size).toBe(4)
  })

  it('counts what each condition leaves', () => {
    expect(validTimetables([])).toHaveLength(24)
    expect(validTimetables([named('peLast')])).toHaveLength(6)
    expect(validTimetables([named('peLast'), named('mathNotFirst')])).toHaveLength(4)
    expect(validTimetables([named('huNextToHist')])).toHaveLength(12)
    expect(validTimetables([named('huBeforeHist')])).toHaveLength(12)
  })

  it('all four conditions together leave exactly the brute-forced timetables', () => {
    const all = TIMETABLE_CONSTRAINTS.map((c) => c.constraint)
    const brute = allPermutations(SUBJECTS).filter((order) =>
      all.every((c) => {
        switch (c.kind) {
          case 'inSlot':
            return order[c.slot] === c.subject
          case 'notInSlot':
            return order[c.slot] !== c.subject
          case 'adjacent':
            return Math.abs(order.indexOf(c.a) - order.indexOf(c.b)) === 1
          case 'before':
            return order.indexOf(c.a) < order.indexOf(c.b)
        }
      }),
    )
    expect(validTimetables(all)).toEqual(brute)
    expect(brute).toEqual([['hungarian', 'history', 'math', 'pe']])
  })

  it('a full order is possible exactly when it satisfies the condition', () => {
    for (const { constraint } of TIMETABLE_CONSTRAINTS) {
      for (const order of allPermutations(SUBJECTS)) {
        expect(stillPossible(order, constraint, SUBJECTS.length)).toBe(satisfies(order, constraint))
      }
    }
  })

  it('pruning never throws away a valid timetable', () => {
    // Over all 16 subsets of the conditions, the surviving leaves of the pruned
    // tree are exactly the valid timetables.
    for (let mask = 0; mask < 1 << TIMETABLE_CONSTRAINTS.length; mask++) {
      const active = TIMETABLE_CONSTRAINTS.filter((_, i) => (mask >> i) & 1).map((c) => c.constraint)
      const nodes = buildPermutationTree([...SUBJECTS], (prefix) =>
        active.every((c) => stillPossible(prefix as Subject[], c, SUBJECTS.length)),
      )
      expect(leafCount(nodes, SUBJECTS.length)).toBe(validTimetables(active).length)
    }
  })

  it('names five classmates for the choosing section', () => {
    expect(PEOPLE).toHaveLength(5)
    expect(new Set(PEOPLE).size).toBe(5)
  })
})

describe('graphs', () => {
  it('stores an edge the same way whichever end it is given from', () => {
    expect(edgeKey(3, 1)).toBe(edgeKey(1, 3))
    const edges = toggleEdge([], 3, 1)
    expect(edges).toEqual([[1, 3]])
    expect(hasEdge(edges, 3, 1)).toBe(true)
    expect(toggleEdge(edges, 1, 3)).toEqual([])
    expect(toggleEdge(edges, 2, 2)).toEqual(edges)
  })

  it('the degree sum is twice the number of edges', () => {
    const edges: Edge[] = [
      [0, 1],
      [1, 2],
      [0, 2],
      [2, 3],
    ]
    expect(degrees(4, edges)).toEqual([2, 2, 3, 1])
    expect(degreeSum(4, edges)).toBe(2 * edges.length)
    for (let n = 3; n <= 8; n++) expect(degreeSum(n, completeGraphEdges(n))).toBe(2 * completeEdgeCount(n))
  })

  it('the complete graph has "choose 2" edges', () => {
    for (let n = 1; n <= 10; n++) {
      expect(completeGraphEdges(n)).toHaveLength(completeEdgeCount(n))
      expect(completeEdgeCount(n)).toBe(combinations(n, 2))
    }
    // The handshake and round-robin exercises.
    expect(completeEdgeCount(7)).toBe(21)
    expect(completeEdgeCount(6)).toBe(15)
    expect(degrees(7, completeGraphEdges(7)).every((d) => d === 6)).toBe(true)
  })

  it('knows when everyone can know exactly d others', () => {
    expect(regularGraphPossible(6, 3)).toEqual({ possible: true, reason: 'ok' })
    expect(regularGraphPossible(5, 3)).toEqual({ possible: false, reason: 'oddSum' })
    expect(regularGraphPossible(4, 5)).toEqual({ possible: false, reason: 'degreeTooBig' })
    expect(regularGraphPossible(4, 3)).toEqual({ possible: true, reason: 'ok' })
  })

  it('builds a d-regular graph whenever one is possible', () => {
    for (let n = 3; n <= 8; n++) {
      for (let d = 1; d <= n - 1; d++) {
        const edges = circulantEdges(n, d)
        if (!regularGraphPossible(n, d).possible) {
          expect(edges).toEqual([])
          continue
        }
        expect(degrees(n, edges)).toEqual(new Array(n).fill(d))
        expect(new Set(edges.map(([a, b]) => edgeKey(a, b))).size).toBe(edges.length)
        expect(edges).toHaveLength((n * d) / 2)
      }
    }
  })

  it('the story graph is a star with one extra edge', () => {
    expect(degrees(4, [...STORY_GRAPH_EDGES])).toEqual([3, 2, 2, 1])
    expect(GRAPH_STORIES.map((s) => s.id)).toContain(GRAPH_STORY_ANSWER)
    expect(new Set(GRAPH_STORIES.map((s) => s.id)).size).toBe(GRAPH_STORIES.length)
    // The two wrong stories describe genuinely different graphs.
    expect(STORY_GRAPH_EDGES).toHaveLength(4)
    expect(completeEdgeCount(4)).toBe(6)
  })
})

describe('sum rule and the planted mistake', () => {
  it('offers exactly one story that matches the expression', () => {
    expect(EXPRESSION_STORIES.map((s) => s.id)).toContain(EXPRESSION_ANSWER)
    expect(new Set(EXPRESSION_STORIES.map((s) => s.id)).size).toBe(3)
  })

  it('points at the second step, where 3 should have been 2', () => {
    expect(WRONG_SOLUTION.stepKeys).toHaveLength(3)
    expect(WRONG_STEP).toBe(1)
    expect(WRONG_SOLUTION.answer).toBe(3 * 2)
  })
})

describe('sieve', () => {
  it('counts multiples up to a limit', () => {
    expect(countMultiples(100, 3)).toBe(33)
    expect(countMultiples(100, 1)).toBe(100)
    expect(countMultiples(30, 7)).toBe(4)
    expect(countMultiples(100, 0)).toBe(0)
  })

  it('gcd and lcm', () => {
    expect(gcd(12, 18)).toBe(6)
    expect(gcd(7, 5)).toBe(1)
    expect(lcm(3, 5)).toBe(15)
    expect(lcm(4, 6)).toBe(12)
    expect(lcm(0, 6)).toBe(0)
  })

  it('subtracts the numbers counted twice', () => {
    expect(sieveCounts(100, 3, 5)).toEqual({ a: 33, b: 20, both: 6, either: 47, neither: 53 })
    expect(sieveCounts(100, 2, 3)).toEqual({ a: 50, b: 33, both: 16, either: 67, neither: 33 })
  })

  it('agrees with counting the numbers one by one', () => {
    for (const limit of [30, 50, 100]) {
      for (let a = 2; a <= 9; a++) {
        for (let b = 2; b <= 9; b++) {
          if (a === b) continue
          const nums = Array.from({ length: limit }, (_, i) => i + 1)
          const c = sieveCounts(limit, a, b)
          expect(c.either).toBe(nums.filter((x) => x % a === 0 || x % b === 0).length)
          expect(c.both).toBe(nums.filter((x) => x % a === 0 && x % b === 0).length)
          expect(c.neither).toBe(nums.filter((x) => x % a !== 0 && x % b !== 0).length)
        }
      }
    }
  })
})
