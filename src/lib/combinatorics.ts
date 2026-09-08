/**
 * Counting and graph logic for the Kombinatorika, gráfok lesson. No React, no
 * DOM — everything here is pure so it can be unit tested.
 *
 * The lesson counts by hand first and only names the formula afterwards, so
 * most helpers come in pairs: one that *lists* the possibilities (a tree, the
 * orderings, the k-subsets) and one that *counts* them. The listing is what the
 * student sees; the count is what the listing is checked against.
 */

import { binomial } from './sets'

/* ------------------------------------------------------------------ */
/* Counting                                                            */
/* ------------------------------------------------------------------ */

/** n! — exact up to n = 18, which is well past anything the lesson shows. */
export function factorial(n: number): number {
  let out = 1
  for (let i = 2; i <= n; i++) out *= i
  return out
}

/** n·(n−1)·…·(n−k+1): ordered choices of k out of n, no repetition ("variáció"). */
export function variations(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let out = 1
  for (let i = 0; i < k; i++) out *= n - i
  return out
}

/** C(n, k): unordered choices of k out of n ("kombináció"). */
export const combinations = (n: number, k: number): number => binomial(n, k)

/** The multiplication rule: independent steps multiply. */
export const productOf = (levels: readonly number[]): number => levels.reduce((acc, size) => acc * size, 1)

/**
 * Every ordering of `items`, first item varying slowest, so the list reads the
 * way a student writes it down: fix the first, run through the rest.
 *
 * Grows as n!, so keep n ≤ 6 — the lesson never goes above 5.
 */
export function allPermutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]]
  const out: T[][] = []
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of allPermutations(rest)) out.push([items[i], ...tail])
  }
  return out
}

/** Every distinct rearrangement of a word's letters, sorted. "ALMA" gives 12. */
export function distinctPermutations(word: string): string[] {
  const seen = new Set(allPermutations([...word]).map((p) => p.join('')))
  return [...seen].sort()
}

/** n! / (k₁!·k₂!·…): orderings of a word whose repeated letters look alike. */
export function multisetPermutationCount(word: string): number {
  const counts = new Map<string, number>()
  for (const ch of word) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  let out = factorial(word.length)
  for (const k of counts.values()) out /= factorial(k)
  return out
}

/** Every k-element subset of `items`, in lexicographic order of indices. */
export function subsets<T>(items: readonly T[], k: number): T[][] {
  if (k < 0 || k > items.length) return []
  if (k === 0) return [[]]
  const out: T[][] = []
  for (let i = 0; i <= items.length - k; i++) {
    for (const tail of subsets(items.slice(i + 1), k - 1)) out.push([items[i], ...tail])
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Choice trees                                                        */
/* ------------------------------------------------------------------ */

export interface TreeNode {
  /** Path from the root, so ids are unique and a parent's id is a prefix. */
  id: string
  /** 0 for the root; every level of choices adds one. */
  depth: number
  /** What was chosen at this step. Empty for the root. */
  label: string
  parent: string | null
}

const ROOT: TreeNode = { id: 'r', depth: 0, label: '', parent: null }

/**
 * The full tree of a multi-step choice: level 0 branches into its options, and
 * every one of those branches into level 1's options, and so on. The leaves are
 * the possibilities, so their number is the product of the level sizes — which
 * is the multiplication rule, drawn.
 */
export function buildChoiceTree(levels: readonly (readonly string[])[]): TreeNode[] {
  const out: TreeNode[] = [ROOT]
  let frontier: TreeNode[] = [ROOT]
  levels.forEach((options, depth) => {
    const next: TreeNode[] = []
    for (const parent of frontier) {
      options.forEach((label, i) => {
        const node: TreeNode = { id: `${parent.id}-${i}`, depth: depth + 1, label, parent: parent.id }
        out.push(node)
        next.push(node)
      })
    }
    frontier = next
  })
  return out
}

/**
 * The tree of orderings of `items`: each level places one item not used yet.
 *
 * `valid` is asked about every partial order. When it says the prefix can no
 * longer lead anywhere, the node is still added — the student should see the
 * branch that died — but it is not expanded. So the nodes at full depth are
 * exactly the valid orderings.
 */
export function buildPermutationTree(items: readonly string[], valid?: (prefix: string[]) => boolean): TreeNode[] {
  const out: TreeNode[] = [ROOT]
  const grow = (parent: TreeNode, used: readonly number[], prefix: string[]) => {
    items.forEach((label, i) => {
      if (used.includes(i)) return
      const nextPrefix = [...prefix, label]
      const node: TreeNode = { id: `${parent.id}-${i}`, depth: parent.depth + 1, label, parent: parent.id }
      out.push(node)
      if (valid && !valid(nextPrefix)) return
      if (nextPrefix.length < items.length) grow(node, [...used, i], nextPrefix)
    })
  }
  grow(ROOT, [], [])
  return out
}

/** Ids of the branches that died: no children, yet short of the full depth. */
export function deadEnds(nodes: readonly TreeNode[], maxDepth: number): Set<string> {
  const parents = new Set(nodes.map((n) => n.parent))
  return new Set(nodes.filter((n) => n.depth < maxDepth && !parents.has(n.id)).map((n) => n.id))
}

/** How many leaves the tree has, i.e. how many possibilities it draws. */
export const leafCount = (nodes: readonly TreeNode[], maxDepth: number): number =>
  nodes.filter((n) => n.depth === maxDepth).length

/* ------------------------------------------------------------------ */
/* Timetable with conditions                                           */
/* ------------------------------------------------------------------ */

export const SUBJECTS = ['math', 'hungarian', 'history', 'pe'] as const
export type Subject = (typeof SUBJECTS)[number]

export type Constraint =
  | { kind: 'inSlot'; subject: Subject; slot: number }
  | { kind: 'notInSlot'; subject: Subject; slot: number }
  | { kind: 'adjacent'; a: Subject; b: Subject }
  | { kind: 'before'; a: Subject; b: Subject }

export interface NamedConstraint {
  id: string
  labelKey: string
  constraint: Constraint
}

/** The four conditions the student can switch on and off, in the card's order. */
export const TIMETABLE_CONSTRAINTS: readonly NamedConstraint[] = [
  { id: 'peLast', labelKey: 'combi.ttPeLast', constraint: { kind: 'inSlot', subject: 'pe', slot: 3 } },
  { id: 'mathNotFirst', labelKey: 'combi.ttMathNotFirst', constraint: { kind: 'notInSlot', subject: 'math', slot: 0 } },
  { id: 'huNextToHist', labelKey: 'combi.ttHuNextToHist', constraint: { kind: 'adjacent', a: 'hungarian', b: 'history' } },
  { id: 'huBeforeHist', labelKey: 'combi.ttHuBeforeHist', constraint: { kind: 'before', a: 'hungarian', b: 'history' } },
]

/** Does a finished timetable obey the condition? */
export function satisfies(order: readonly Subject[], c: Constraint): boolean {
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
}

/**
 * Can a half-filled timetable still be completed into one that obeys `c`?
 * This is what prunes the tree: a branch is cut the moment it is hopeless, not
 * once it is finished.
 */
export function stillPossible(prefix: readonly Subject[], c: Constraint, total: number): boolean {
  switch (c.kind) {
    case 'inSlot':
      return c.slot < prefix.length ? prefix[c.slot] === c.subject : !prefix.includes(c.subject)
    case 'notInSlot':
      return c.slot < prefix.length ? prefix[c.slot] !== c.subject : true
    case 'adjacent': {
      const ia = prefix.indexOf(c.a)
      const ib = prefix.indexOf(c.b)
      if (ia >= 0 && ib >= 0) return Math.abs(ia - ib) === 1
      // One of them is placed: the only free slot next to it is the one right
      // after the end of the prefix, so it must sit at the very end.
      if (ia >= 0 || ib >= 0) {
        const placed = ia >= 0 ? ia : ib
        return placed === prefix.length - 1 && placed + 1 < total
      }
      return total - prefix.length >= 2
    }
    case 'before': {
      const ib = prefix.indexOf(c.b)
      if (ib < 0) return true
      const ia = prefix.indexOf(c.a)
      return ia >= 0 && ia < ib
    }
  }
}

/** Every timetable obeying all the active conditions. */
export const validTimetables = (active: readonly Constraint[]): Subject[][] =>
  allPermutations(SUBJECTS).filter((order) => active.every((c) => satisfies(order, c)))

/* ------------------------------------------------------------------ */
/* Choosing people                                                     */
/* ------------------------------------------------------------------ */

/** Five classmates, labelled `combi.person_anna` and so on. */
export const PEOPLE = ['anna', 'bence', 'csilla', 'dani', 'emma'] as const
export type Person = (typeof PEOPLE)[number]

/* ------------------------------------------------------------------ */
/* Graphs                                                              */
/* ------------------------------------------------------------------ */

/** An undirected edge, always stored with the smaller vertex first. */
export type Edge = [number, number]

export const edgeKey = (a: number, b: number): string => `${Math.min(a, b)}-${Math.max(a, b)}`

export const hasEdge = (edges: readonly Edge[], a: number, b: number): boolean =>
  edges.some(([x, y]) => edgeKey(x, y) === edgeKey(a, b))

/** Adds the edge if it is missing, removes it if it is there. Loops are ignored. */
export function toggleEdge(edges: readonly Edge[], a: number, b: number): Edge[] {
  if (a === b) return [...edges]
  const key = edgeKey(a, b)
  if (hasEdge(edges, a, b)) return edges.filter(([x, y]) => edgeKey(x, y) !== key)
  return [...edges, [Math.min(a, b), Math.max(a, b)]]
}

/** How many edges meet each vertex ("fokszám"). */
export function degrees(n: number, edges: readonly Edge[]): number[] {
  const out = new Array<number>(n).fill(0)
  for (const [a, b] of edges) {
    if (a < n) out[a]++
    if (b < n) out[b]++
  }
  return out
}

/** Always 2·(number of edges): every edge has two ends. */
export const degreeSum = (n: number, edges: readonly Edge[]): number =>
  degrees(n, edges).reduce((acc, d) => acc + d, 0)

/** Everyone joined to everyone: the handshake graph. */
export function completeGraphEdges(n: number): Edge[] {
  const out: Edge[] = []
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) out.push([a, b])
  return out
}

/** n(n−1)/2, which is also "choose 2 out of n". */
export const completeEdgeCount = (n: number): number => (n * (n - 1)) / 2

export type RegularReason = 'ok' | 'degreeTooBig' | 'oddSum'

/**
 * Can n people each know exactly d others? Two obstacles only: nobody can know
 * more than the n−1 others, and the degree sum n·d must be even because it
 * equals 2·(number of edges). Whenever both hold such a graph does exist, and
 * `circulantEdges` builds one.
 */
export function regularGraphPossible(n: number, d: number): { possible: boolean; reason: RegularReason } {
  if (d > n - 1) return { possible: false, reason: 'degreeTooBig' }
  if ((n * d) % 2 === 1) return { possible: false, reason: 'oddSum' }
  return { possible: true, reason: 'ok' }
}

/**
 * A concrete d-regular graph on n vertices, drawn as a circle: join every
 * vertex to its ⌊d/2⌋ neighbours on each side, and when d is odd (so n must be
 * even) add the diagonals joining opposite vertices.
 */
export function circulantEdges(n: number, d: number): Edge[] {
  if (!regularGraphPossible(n, d).possible) return []
  const out: Edge[] = []
  for (let h = 1; h <= Math.floor(d / 2); h++) {
    for (let i = 0; i < n; i++) {
      const j = (i + h) % n
      if (!hasEdge(out, i, j)) out.push([Math.min(i, j), Math.max(i, j)])
    }
  }
  if (d % 2 === 1) {
    for (let i = 0; i < n / 2; i++) out.push([i, i + n / 2])
  }
  return out
}

/** The four-person graph the story exercise is about: Anna knows everyone. */
export const STORY_GRAPH_EDGES: readonly Edge[] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
]

/** Vertices of `STORY_GRAPH_EDGES`, in order. */
export const STORY_GRAPH_PEOPLE = ['anna', 'bence', 'csilla', 'dani'] as const

export interface Story {
  id: string
  labelKey: string
}

/** Only one of the three descriptions matches the drawing. */
export const GRAPH_STORIES: readonly Story[] = [
  { id: 'star', labelKey: 'combi.storyStar' },
  { id: 'all', labelKey: 'combi.storyAll' },
  { id: 'twoEach', labelKey: 'combi.storyTwoEach' },
]

export const GRAPH_STORY_ANSWER = 'star'

/* ------------------------------------------------------------------ */
/* Sum rule: which story fits the expression, and where the mistake is */
/* ------------------------------------------------------------------ */

/** The expression the student has to match a story to: 4·3 + 5 = 17. */
export const EXPRESSION_TEX = '4 \\cdot 3 + 5'

export const EXPRESSION_STORIES: readonly Story[] = [
  { id: 'orDress', labelKey: 'combi.exprOrDress' },
  { id: 'allThree', labelKey: 'combi.exprAllThree' },
  { id: 'onlyOne', labelKey: 'combi.exprOnlyOne' },
]

export const EXPRESSION_ANSWER = 'orDress'

/**
 * A solution with a mistake in it, for the "find the error" task of the
 * curriculum. The second digit cannot be chosen freely: one digit is used up.
 */
export const WRONG_SOLUTION = {
  problemKey: 'combi.wrongProblem',
  stepKeys: ['combi.wrongStep1', 'combi.wrongStep2', 'combi.wrongStep3'],
  fixKey: 'combi.wrongFix',
  answer: 6,
} as const

export const WRONG_STEP = 1

/* ------------------------------------------------------------------ */
/* Sieve with numbers                                                  */
/* ------------------------------------------------------------------ */

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) [x, y] = [y, x % y]
  return x
}

export const lcm = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b))

/** How many of 1, 2, …, limit are divisible by d. */
export const countMultiples = (limit: number, d: number): number => (d <= 0 ? 0 : Math.floor(limit / d))

export interface SieveCounts {
  a: number
  b: number
  both: number
  either: number
  neither: number
}

/**
 * Inclusion-exclusion on the numbers 1…limit: the multiples of both a and b are
 * the multiples of their least common multiple, and adding |A| and |B| counts
 * them twice, so they come off once.
 */
export function sieveCounts(limit: number, a: number, b: number): SieveCounts {
  const ca = countMultiples(limit, a)
  const cb = countMultiples(limit, b)
  const both = countMultiples(limit, lcm(a, b))
  const either = ca + cb - both
  return { a: ca, b: cb, both, either, neither: limit - either }
}
