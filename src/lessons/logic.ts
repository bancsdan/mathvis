import { LogicConnectivesCard } from '../components/LogicConnectivesCard'
import { LogicImplicationCard } from '../components/LogicImplicationCard'
import { LogicNegationCard } from '../components/LogicNegationCard'
import { LogicQuantifierCard } from '../components/LogicQuantifierCard'
import type { Explorer } from '../topics'

/**
 * Matematikai logika: four explorers — negation as the complement, the three
 * connectives, the two quantifiers, and "if…, then…" with its converse and its
 * equivalence.
 */
export const LOGIC_EXPLORERS: Explorer[] = [
  { id: 'negation', navKey: 'logic.nav1', questionKey: 'logic.q1', Card: LogicNegationCard },
  { id: 'connectives', navKey: 'logic.nav2', questionKey: 'logic.q2', Card: LogicConnectivesCard },
  { id: 'quantifiers', navKey: 'logic.nav3', questionKey: 'logic.q3', Card: LogicQuantifierCard },
  { id: 'implication', navKey: 'logic.nav4', questionKey: 'logic.q4', Card: LogicImplicationCard },
]
