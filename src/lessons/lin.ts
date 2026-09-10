import { LinBalanceCard } from '../components/LinBalanceCard'
import { LinGraphCard } from '../components/LinGraphCard'
import { LinIneqCard } from '../components/LinIneqCard'
import { LinModelCard } from '../components/LinModelCard'
import { LinProblemsCard } from '../components/LinProblemsCard'
import { LinSetsCard } from '../components/LinSetsCard'
import { LinSysGraphCard } from '../components/LinSysGraphCard'
import { LinSystemsCard } from '../components/LinSystemsCard'
import type { Explorer } from '../topics'

/**
 * Elsőfokú egyenletek, egyenlőtlenségek, egyenletrendszerek: the balance that
 * every solving step obeys, the base set that decides what counts as an
 * answer, the two lines whose crossing is the root, the one move that turns an
 * inequality sign, two ways of losing an unknown from a system, the same
 * system as a picture, and the five steps that turn a story into an equation —
 * including the stories that cannot be turned into one.
 */
export const LIN_EXPLORERS: Explorer[] = [
  { id: 'balance', navKey: 'lin.nav1', questionKey: 'lin.q1', Card: LinBalanceCard },
  { id: 'sets', navKey: 'lin.nav2', questionKey: 'lin.q2', Card: LinSetsCard },
  { id: 'graph', navKey: 'lin.nav3', questionKey: 'lin.q3', Card: LinGraphCard },
  { id: 'ineq', navKey: 'lin.nav4', questionKey: 'lin.q4', Card: LinIneqCard },
  { id: 'systems', navKey: 'lin.nav5', questionKey: 'lin.q5', Card: LinSystemsCard },
  { id: 'sysgraph', navKey: 'lin.nav6', questionKey: 'lin.q6', Card: LinSysGraphCard },
  { id: 'model', navKey: 'lin.nav7', questionKey: 'lin.q7', Card: LinModelCard },
  { id: 'problems', navKey: 'lin.nav8', questionKey: 'lin.q8', Card: LinProblemsCard },
]
