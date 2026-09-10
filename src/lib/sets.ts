/**
 * Set-theory logic for the Halmazok lesson. No React, no DOM — everything here
 * is pure so it can be unit tested.
 *
 * Two representations do all the work:
 *
 * - A **signature** is a small integer whose bit `i` says "inside circle i".
 *   With n circles there are 2^n disjoint Venn regions, signature 0 being the
 *   part of the universe outside every circle.
 * - A **RegionSet** is a bitfield over those signatures: bit `sig` is set when
 *   region `sig` belongs to the set. Set operations are then bitwise operations,
 *   which is exactly the union/intersection/complement ↔ OR/AND/NOT
 *   correspondence the lesson teaches.
 */

/** Bitfield over region signatures. Bit `sig` set ⇔ region `sig` is included. */
export type RegionSet = number

/** How many disjoint regions an n-circle Venn diagram has. */
export const regionCount = (n: number): number => 1 << n

/** Every region of an n-circle diagram, i.e. the universe. */
export const allRegions = (n: number): RegionSet => (1 << (1 << n)) - 1

/** The whole of circle `i`: every region whose signature has bit `i` set. */
export function circleRegions(i: number, n: number): RegionSet {
  let out = 0
  for (let sig = 0; sig < 1 << n; sig++) {
    if ((sig >> i) & 1) out |= 1 << sig
  }
  return out
}

export const unionR = (a: RegionSet, b: RegionSet): RegionSet => a | b
export const interR = (a: RegionSet, b: RegionSet): RegionSet => a & b
export const diffR = (a: RegionSet, b: RegionSet): RegionSet => a & ~b
export const complR = (a: RegionSet, n: number): RegionSet => allRegions(n) & ~a

/** Is region `sig` a member of `rs`? */
export const inR = (rs: RegionSet, sig: number): boolean => ((rs >> sig) & 1) === 1

/** The signatures in `rs`, ascending. */
export function regionsOf(rs: RegionSet, n: number): number[] {
  const out: number[] = []
  for (let sig = 0; sig < 1 << n; sig++) if (inR(rs, sig)) out.push(sig)
  return out
}

const SET_NAMES = ['A', 'B', 'C']

/**
 * LaTeX for a single region, e.g. signature 0b011 with n=3 is
 * `A \cap B \setminus C`. Region names are pure symbols, so this needs no
 * translation.
 */
export function regionTex(sig: number, n: number): string {
  const names = SET_NAMES.slice(0, n)
  const inside = names.filter((_, i) => (sig >> i) & 1)
  const outside = names.filter((_, i) => !((sig >> i) & 1))
  if (inside.length === 0) return `\\overline{${names.join(' \\cup ')}}`
  const head = inside.join(' \\cap ')
  if (outside.length === 0) return head
  const tail = outside.length === 1 ? outside[0] : `(${outside.join(' \\cup ')})`
  return `${head} \\setminus ${tail}`
}

/* ------------------------------------------------------------------ */
/* Named expressions                                                   */
/* ------------------------------------------------------------------ */

export interface SetExpr {
  id: string
  /** Rendered with KaTeX; also the label, since notation needs no translating. */
  tex: string
  /** Same expression in plain Unicode, for places that cannot hold markup. */
  plain: string
  /** How many circles the expression mentions. */
  n: 2 | 3
  /** Which regions it covers. */
  value: RegionSet
}

const A2 = circleRegions(0, 2)
const B2 = circleRegions(1, 2)
const A3 = circleRegions(0, 3)
const B3 = circleRegions(1, 3)
const C3 = circleRegions(2, 3)

export const EXPRESSIONS: readonly SetExpr[] = [
  { id: 'union2', tex: 'A \\cup B', plain: 'A ∪ B', n: 2, value: unionR(A2, B2) },
  { id: 'inter2', tex: 'A \\cap B', plain: 'A ∩ B', n: 2, value: interR(A2, B2) },
  { id: 'diffAB2', tex: 'A \\setminus B', plain: 'A ∖ B', n: 2, value: diffR(A2, B2) },
  { id: 'diffBA2', tex: 'B \\setminus A', plain: 'B ∖ A', n: 2, value: diffR(B2, A2) },
  { id: 'complA2', tex: '\\overline{A}', plain: 'Ā', n: 2, value: complR(A2, 2) },
  { id: 'symm2', tex: '(A \\setminus B) \\cup (B \\setminus A)', plain: '(A ∖ B) ∪ (B ∖ A)', n: 2, value: unionR(diffR(A2, B2), diffR(B2, A2)) },
  { id: 'union3', tex: 'A \\cup B \\cup C', plain: 'A ∪ B ∪ C', n: 3, value: unionR(unionR(A3, B3), C3) },
  { id: 'inter3', tex: 'A \\cap B \\cap C', plain: 'A ∩ B ∩ C', n: 3, value: interR(interR(A3, B3), C3) },
  { id: 'unionMinus3', tex: '(A \\cup B) \\setminus C', plain: '(A ∪ B) ∖ C', n: 3, value: diffR(unionR(A3, B3), C3) },
  { id: 'distrib3', tex: 'A \\cap (B \\cup C)', plain: 'A ∩ (B ∪ C)', n: 3, value: interR(A3, unionR(B3, C3)) },
  { id: 'onlyA3', tex: 'A \\setminus (B \\cup C)', plain: 'A ∖ (B ∪ C)', n: 3, value: diffR(A3, unionR(B3, C3)) },
  { id: 'complInter3', tex: '\\overline{A \\cap B \\cap C}', plain: 'A ∩ B ∩ C‾', n: 3, value: complR(interR(interR(A3, B3), C3), 3) },
] as const

/** The simplest named expression equal to `rs`, or null when nothing matches. */
export function nameRegionSet(rs: RegionSet, n: 2 | 3): SetExpr | null {
  return EXPRESSIONS.find((e) => e.n === n && e.value === rs) ?? null
}

/* ------------------------------------------------------------------ */
/* Inclusion-exclusion (logikai szita)                                 */
/* ------------------------------------------------------------------ */

/** Number of 1 bits, i.e. how many of the n circles a region lies inside. */
export function popcount(x: number): number {
  let c = 0
  for (let v = x; v; v >>= 1) c += v & 1
  return c
}

/**
 * How many times region `sig` is counted by the inclusion-exclusion sum after
 * `depth` terms: depth 1 adds every single |A|, depth 2 subtracts every pairwise
 * |A ∩ B|, and so on. The point of the lesson is that at full depth every
 * non-empty region has been counted exactly once.
 */
export function timesCounted(sig: number, depth: number): number {
  const k = popcount(sig)
  if (k === 0) return 0
  let total = 0
  for (let j = 1; j <= Math.min(depth, k); j++) {
    total += (j % 2 === 1 ? 1 : -1) * binomial(k, j)
  }
  return total
}

export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let out = 1
  for (let i = 0; i < k; i++) out = (out * (n - i)) / (i + 1)
  return Math.round(out)
}

/** |A ∪ … | computed from per-region counts, as the plain sum over regions. */
export function unionSize(counts: number[], n: number): number {
  let total = 0
  for (let sig = 1; sig < 1 << n; sig++) total += counts[sig] ?? 0
  return total
}

/** The size of one circle, summed from the regions inside it. */
export function circleSize(counts: number[], i: number, n: number): number {
  let total = 0
  for (let sig = 0; sig < 1 << n; sig++) {
    if ((sig >> i) & 1) total += counts[sig] ?? 0
  }
  return total
}

/** The size of an intersection of the circles named by `mask`. */
export function interSize(counts: number[], mask: number, n: number): number {
  let total = 0
  for (let sig = 0; sig < 1 << n; sig++) {
    if ((sig & mask) === mask) total += counts[sig] ?? 0
  }
  return total
}

/**
 * The inclusion-exclusion sum term by term, alternating sign by subset size.
 * Its total must equal `unionSize` for the same counts, which is the identity
 * the lesson demonstrates.
 */
export function sieveTerms(counts: number[], n: number): Array<{ mask: number; size: number; sign: 1 | -1 }> {
  const out: Array<{ mask: number; size: number; sign: 1 | -1 }> = []
  for (let mask = 1; mask < 1 << n; mask++) {
    const k = popcount(mask)
    out.push({ mask, size: interSize(counts, mask, n), sign: k % 2 === 1 ? 1 : -1 })
  }
  return out.sort((a, b) => popcount(a.mask) - popcount(b.mask) || a.mask - b.mask)
}

export const sieveTotal = (counts: number[], n: number): number =>
  sieveTerms(counts, n).reduce((acc, term) => acc + term.sign * term.size, 0)

/* ------------------------------------------------------------------ */
/* The element universe                                                */
/* ------------------------------------------------------------------ */

export type ElemShape = 'circle' | 'square' | 'triangle'
export type ElemColor = 'blue' | 'orange' | 'green'
export type ElemSize = 'small' | 'large'

export interface Elem {
  /** 1..12, and also the element's number, so numeric predicates come free. */
  id: number
  shape: ElemShape
  color: ElemColor
  size: ElemSize
}

/**
 * Twelve elements: enough to fill all eight regions of a three-circle diagram
 * without any predicate being trivially empty or full, few enough to draw as
 * dots and to check by hand.
 */
export const UNIVERSE: readonly Elem[] = [
  { id: 1, shape: 'circle', color: 'blue', size: 'small' },
  { id: 2, shape: 'square', color: 'orange', size: 'large' },
  { id: 3, shape: 'triangle', color: 'green', size: 'small' },
  { id: 4, shape: 'circle', color: 'orange', size: 'large' },
  { id: 5, shape: 'square', color: 'blue', size: 'small' },
  { id: 6, shape: 'triangle', color: 'blue', size: 'large' },
  { id: 7, shape: 'circle', color: 'green', size: 'small' },
  { id: 8, shape: 'square', color: 'green', size: 'large' },
  { id: 9, shape: 'triangle', color: 'orange', size: 'small' },
  { id: 10, shape: 'circle', color: 'blue', size: 'large' },
  { id: 11, shape: 'square', color: 'orange', size: 'small' },
  { id: 12, shape: 'triangle', color: 'green', size: 'large' },
] as const

export interface Predicate {
  id: string
  /** i18n key of the human phrasing, e.g. "páros szám". */
  labelKey: string
  test: (e: Elem) => boolean
}

/** A set of elements, held as their ids. */
export type ElemSet = ReadonlySet<number>

export const isSubset = (a: ElemSet, b: ElemSet): boolean => [...a].every((x) => b.has(x))
export const setsEqual = (a: ElemSet, b: ElemSet): boolean => a.size === b.size && isSubset(a, b)

/** Which Venn region an element falls into, given the predicates defining each circle. */
export const elemSignature = (e: Elem, preds: readonly Predicate[]): number =>
  preds.reduce((sig, p, i) => (p.test(e) ? sig | (1 << i) : sig), 0)

/** Region signature to the element ids sitting in it. Drives dots and counts. */
export function bucketByRegion(preds: readonly Predicate[]): number[][] {
  const out: number[][] = Array.from({ length: 1 << preds.length }, () => [])
  for (const e of UNIVERSE) out[elemSignature(e, preds)].push(e.id)
  return out
}
