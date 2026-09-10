import { LogicConnectivesCard } from '../components/LogicConnectivesCard'
import { LogicImplicationCard } from '../components/LogicImplicationCard'
import { LogicNegationCard } from '../components/LogicNegationCard'
import { LogicNimCard } from '../components/LogicNimCard'
import { LogicProofCard } from '../components/LogicProofCard'
import { LogicQuantifierCard } from '../components/LogicQuantifierCard'
import type { Explorer } from '../topics'

/**
 * Matematikai logika: six explorers — negation as the complement, the three
 * connectives, the two quantifiers, "if…, then…" with its converse and its
 * equivalence, what a proof buys over examples, and NIM as a rule you can win
 * with every time.
 */
export const LOGIC_EXPLORERS: Explorer[] = [
  { id: 'negation', navKey: 'logic.nav1', questionKey: 'logic.q1', Card: LogicNegationCard },
  { id: 'connectives', navKey: 'logic.nav2', questionKey: 'logic.q2', Card: LogicConnectivesCard },
  { id: 'quantifiers', navKey: 'logic.nav3', questionKey: 'logic.q3', Card: LogicQuantifierCard },
  { id: 'implication', navKey: 'logic.nav4', questionKey: 'logic.q4', Card: LogicImplicationCard },
  { id: 'proof', navKey: 'logic.nav5', questionKey: 'logic.q5', Card: LogicProofCard },
  { id: 'nim', navKey: 'logic.nav6', questionKey: 'logic.q6', Card: LogicNimCard },
]
