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
