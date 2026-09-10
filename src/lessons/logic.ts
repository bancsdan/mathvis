import { LogicConnectivesCard } from '../components/LogicConnectivesCard'
import { LogicGamesCard } from '../components/LogicGamesCard'
import { LogicIffCard } from '../components/LogicIffCard'
import { LogicImplicationCard } from '../components/LogicImplicationCard'
import { LogicNegationCard } from '../components/LogicNegationCard'
import { LogicProofCard } from '../components/LogicProofCard'
import { LogicQuantifierCard } from '../components/LogicQuantifierCard'
import { LogicStatementCard } from '../components/LogicStatementCard'
import type { Explorer } from '../topics'

/**
 * Matematikai logika: statements and their truth value, the connectives and
 * how they mirror set operations, quantifiers, implication and its converse,
 * what a proof is, and two logic games.
 */
export const LOGIC_EXPLORERS: Explorer[] = [
  { id: 'statement', navKey: 'logic.nav1', questionKey: 'logic.q1', Card: LogicStatementCard },
  { id: 'negation', navKey: 'logic.nav2', questionKey: 'logic.q2', Card: LogicNegationCard },
  { id: 'connectives', navKey: 'logic.nav3', questionKey: 'logic.q3', Card: LogicConnectivesCard },
  { id: 'quantifiers', navKey: 'logic.nav4', questionKey: 'logic.q4', Card: LogicQuantifierCard },
  { id: 'implication', navKey: 'logic.nav5', questionKey: 'logic.q5', Card: LogicImplicationCard },
  { id: 'iff', navKey: 'logic.nav6', questionKey: 'logic.q6', Card: LogicIffCard },
  { id: 'proof', navKey: 'logic.nav7', questionKey: 'logic.q7', Card: LogicProofCard },
  { id: 'games', navKey: 'logic.nav8', questionKey: 'logic.q8', Card: LogicGamesCard },
]
