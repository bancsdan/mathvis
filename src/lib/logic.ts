/**
 * Propositional logic for the Matematikai logika lesson. No React, no DOM.
 *
 * Statements are evaluated over the same twelve-element universe as the sets
 * lesson, so "P and Q" literally is the intersection of two sets and the
 * student can see the two topics are one idea in two notations.
 */

import { UNIVERSE, type Elem, type Predicate, type RegionSet } from './sets'

/* ------------------------------------------------------------------ */
/* Connectives                                                         */
/* ------------------------------------------------------------------ */

export type Connective = 'and' | 'or' | 'xor' | 'imp' | 'iff'

export function applyConnective(c: Connective, a: boolean, b: boolean): boolean {
  switch (c) {
    case 'and':
      return a && b
    case 'or':
      return a || b
    case 'xor':
      return a !== b
    case 'imp':
      return !a || b
    case 'iff':
      return a === b
  }
}

/**
 * Regions of a two-circle Venn diagram (A is bit 0, B is bit 1) where the
 * connective holds. This is the bridge to the sets lesson: "and" gives the
 * intersection, "or" the union, "xor" the symmetric difference.
 */
export function connectiveRegions(c: Connective): RegionSet {
  let out = 0
  for (let sig = 0; sig < 4; sig++) {
    if (applyConnective(c, (sig & 1) === 1, (sig & 2) === 2)) out |= 1 << sig
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Predicates over the universe                                        */
/* ------------------------------------------------------------------ */

/**
 * Deliberately includes pairs that pick the same elements under different
 * names ("divisible by 6" and "even and divisible by 3"), so the biconditional
 * section has a genuine "if and only if" to discover.
 */
export const LOGIC_PREDICATES: readonly Predicate[] = [
  { id: 'even', labelKey: 'logic.predEven', test: (e) => e.id % 2 === 0 },
  { id: 'odd', labelKey: 'logic.predOdd', test: (e) => e.id % 2 === 1 },
  { id: 'notOdd', labelKey: 'logic.predNotOdd', test: (e) => e.id % 2 !== 1 },
  { id: 'gt6', labelKey: 'logic.predGt6', test: (e) => e.id > 6 },
  { id: 'le6', labelKey: 'logic.predLe6', test: (e) => e.id <= 6 },
  { id: 'div3', labelKey: 'logic.predDiv3', test: (e) => e.id % 3 === 0 },
  { id: 'div4', labelKey: 'logic.predDiv4', test: (e) => e.id % 4 === 0 },
  { id: 'div6', labelKey: 'logic.predDiv6', test: (e) => e.id % 6 === 0 },
  { id: 'evenDiv3', labelKey: 'logic.predEvenDiv3', test: (e) => e.id % 2 === 0 && e.id % 3 === 0 },
  { id: 'prime', labelKey: 'logic.predPrime', test: (e) => isPrime(e.id) },
  { id: 'large', labelKey: 'logic.predLarge', test: (e) => e.size === 'large' },
  { id: 'blue', labelKey: 'logic.predBlue', test: (e) => e.color === 'blue' },
  { id: 'square', labelKey: 'logic.predSquare', test: (e) => e.shape === 'square' },
] as const

export const logicPredicateById = (id: string): Predicate => LOGIC_PREDICATES.find((p) => p.id === id) ?? LOGIC_PREDICATES[0]

export const idsWhere = (test: (e: Elem) => boolean, domain: readonly Elem[] = UNIVERSE): number[] => domain.filter(test).map((e) => e.id)

/** The negation of a predicate, as a predicate. */
export const negate = (p: Predicate): Predicate => ({
  id: `not-${p.id}`,
  labelKey: p.labelKey,
  test: (e) => !p.test(e),
})

/* ------------------------------------------------------------------ */
/* Quantifiers                                                         */
/* ------------------------------------------------------------------ */

export type Quantifier = 'all' | 'some'

export interface QuantifierReport {
  value: boolean
  /** Elements of the domain satisfying the predicate. */
  examples: number[]
  /** Elements of the domain failing it: each one refutes a "for all". */
  counterexamples: number[]
}

/** "For all x in the domain, P(x)" or "there is an x in the domain with P(x)". */
export function evalQuantified(q: Quantifier, domain: readonly Elem[], p: Predicate): QuantifierReport {
  const examples = idsWhere(p.test, domain)
  const counterexamples = idsWhere((e) => !p.test(e), domain)
  const value = q === 'all' ? counterexamples.length === 0 : examples.length > 0
  return { value, examples, counterexamples }
}

/** The domain a quantifier ranges over: everything, or the elements with a property. */
export const domainOf = (id: string): readonly Elem[] => (id === 'all' ? UNIVERSE : UNIVERSE.filter(logicPredicateById(id).test))

/* ------------------------------------------------------------------ */
/* Implication, converse, biconditional                                */
/* ------------------------------------------------------------------ */

export interface ImplicationReport {
  /** "If P then Q" over the universe. */
  forward: boolean
  /** "If Q then P", the converse. */
  converse: boolean
  /** "P if and only if Q". */
  iff: boolean
  /** Elements with P but not Q: each refutes the forward implication. */
  counterForward: number[]
  /** Elements with Q but not P: each refutes the converse. */
  counterConverse: number[]
}

/**
 * An implication over a finite universe is true exactly when nothing has the
 * premise without the conclusion, i.e. when P's set is a subset of Q's. The
 * biconditional then says the two sets are equal.
 */
export function implicationReport(p: Predicate, q: Predicate): ImplicationReport {
  const counterForward = idsWhere((e) => p.test(e) && !q.test(e))
  const counterConverse = idsWhere((e) => q.test(e) && !p.test(e))
  const forward = counterForward.length === 0
  const converse = counterConverse.length === 0
  return { forward, converse, iff: forward && converse, counterForward, counterConverse }
}

/* ------------------------------------------------------------------ */
/* Statements: true, false, or not a statement at all                  */
/* ------------------------------------------------------------------ */

export type SentenceKind = 'true' | 'false' | 'none'

export interface Sentence {
  id: string
  labelKey: string
  kind: SentenceKind
}

/** A mix of maths, everyday facts, questions, commands and an open sentence. */
export const SENTENCES: readonly Sentence[] = [
  { id: 'prime7', labelKey: 'logic.sentPrime7', kind: 'true' },
  { id: 'div15', labelKey: 'logic.sentDiv15', kind: 'false' },
  { id: 'question', labelKey: 'logic.sentQuestion', kind: 'none' },
  { id: 'squares', labelKey: 'logic.sentSquares', kind: 'true' },
  { id: 'open', labelKey: 'logic.sentOpen', kind: 'none' },
  { id: 'angles', labelKey: 'logic.sentAngles', kind: 'false' },
  { id: 'command', labelKey: 'logic.sentCommand', kind: 'none' },
  { id: 'smallestPrime', labelKey: 'logic.sentSmallestPrime', kind: 'true' },
] as const

/* ------------------------------------------------------------------ */
/* Proof: examples do not prove, one counterexample refutes            */
/* ------------------------------------------------------------------ */

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

/** The smallest divisor above one, or `n` itself when `n` is prime. */
export function smallestFactor(n: number): number {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return d
  return n
}

/**
 * Euler's polynomial: prime for every n from 0 to 39, and then not. The lesson's
 * worked case of "forty examples are still not a proof".
 */
export const eulerPolynomial = (n: number): number => n * n + n + 41

/** The steps of the proof that two odd numbers add to an even one, in order. */
export const PROOF_STEPS = ['name', 'add', 'factor', 'conclude'] as const
export type ProofStep = (typeof PROOF_STEPS)[number]

/** The same steps as first shown to the student, deliberately out of order. */
export const PROOF_STEPS_SHUFFLED: readonly ProofStep[] = ['factor', 'name', 'conclude', 'add']

export const proofOrderCorrect = (order: readonly ProofStep[]): boolean =>
  order.length === PROOF_STEPS.length && order.every((s, i) => s === PROOF_STEPS[i])

/* ------------------------------------------------------------------ */
/* Knights and knaves ("Mit állít a szigetlakó?")                      */
/* ------------------------------------------------------------------ */

export type Islander = 'A' | 'B'
export type Kind = 'knight' | 'knave'
export type Assignment = Readonly<Record<Islander, Kind>>

export type Claim =
  | { kind: 'isKnight'; who: Islander }
  | { kind: 'isKnave'; who: Islander }
  | { kind: 'bothKnights' }
  | { kind: 'bothKnaves' }
  | { kind: 'atLeastOneKnave' }
  | { kind: 'differentKinds' }

export interface Statement {
  speaker: Islander
  claim: Claim
  labelKey: string
}

export interface Puzzle {
  id: string
  statements: readonly Statement[]
}

export const PUZZLES: readonly Puzzle[] = [
  {
    id: 'bothKnaves',
    statements: [{ speaker: 'A', claim: { kind: 'bothKnaves' }, labelKey: 'logic.sayBothKnaves' }],
  },
  {
    id: 'vouch',
    statements: [
      { speaker: 'A', claim: { kind: 'isKnight', who: 'B' }, labelKey: 'logic.sayBKnight' },
      { speaker: 'B', claim: { kind: 'differentKinds' }, labelKey: 'logic.sayDifferent' },
    ],
  },
  {
    id: 'atLeastOne',
    statements: [{ speaker: 'A', claim: { kind: 'atLeastOneKnave' }, labelKey: 'logic.sayAtLeastOneKnave' }],
  },
  {
    id: 'accuse',
    statements: [
      { speaker: 'A', claim: { kind: 'isKnave', who: 'B' }, labelKey: 'logic.sayBKnave' },
      { speaker: 'B', claim: { kind: 'isKnave', who: 'A' }, labelKey: 'logic.sayAKnave' },
    ],
  },
] as const

export const puzzleById = (id: string): Puzzle => PUZZLES.find((p) => p.id === id) ?? PUZZLES[0]

export const ALL_ASSIGNMENTS: readonly Assignment[] = [
  { A: 'knight', B: 'knight' },
  { A: 'knight', B: 'knave' },
  { A: 'knave', B: 'knight' },
  { A: 'knave', B: 'knave' },
]

/** Is the claim true of the island, supposing this is who everyone is? */
export function claimHolds(claim: Claim, a: Assignment): boolean {
  switch (claim.kind) {
    case 'isKnight':
      return a[claim.who] === 'knight'
    case 'isKnave':
      return a[claim.who] === 'knave'
    case 'bothKnights':
      return a.A === 'knight' && a.B === 'knight'
    case 'bothKnaves':
      return a.A === 'knave' && a.B === 'knave'
    case 'atLeastOneKnave':
      return a.A === 'knave' || a.B === 'knave'
    case 'differentKinds':
      return a.A !== a.B
  }
}

/** Knights only say true things and knaves only false ones: a statement fits when that matches. */
export const statementFits = (s: Statement, a: Assignment): boolean => (a[s.speaker] === 'knight') === claimHolds(s.claim, a)

export const isConsistent = (puzzle: Puzzle, a: Assignment): boolean => puzzle.statements.every((s) => statementFits(s, a))

export const solutions = (puzzle: Puzzle): Assignment[] => ALL_ASSIGNMENTS.filter((a) => isConsistent(puzzle, a))

export const assignmentKey = (a: Assignment): string => `${a.A}|${a.B}`

/* ------------------------------------------------------------------ */
/* NIM                                                                 */
/* ------------------------------------------------------------------ */

export const NIM_MAX_TAKE = 3

/**
 * With takes of 1..maxTake, whoever faces a multiple of maxTake+1 loses against
 * best play: any move lets the opponent restore the multiple. So the winning
 * move is the one that leaves such a multiple, when there is one.
 */
export function nimWinningMove(pile: number, maxTake = NIM_MAX_TAKE): number | null {
  const take = pile % (maxTake + 1)
  return take === 0 || take > pile ? null : take
}

/** The computer's reply: the winning move, or the smallest legal one when there is none. */
export const nimComputerMove = (pile: number, maxTake = NIM_MAX_TAKE): number => nimWinningMove(pile, maxTake) ?? Math.min(1, pile)

/** Is the player to move doomed, assuming the opponent plays well? */
export const nimIsLosing = (pile: number, maxTake = NIM_MAX_TAKE): boolean => pile % (maxTake + 1) === 0
