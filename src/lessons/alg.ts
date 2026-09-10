import { AlgCompleteCard } from '../components/AlgCompleteCard'
import { AlgDiffCard } from '../components/AlgDiffCard'
import { AlgExpandCard } from '../components/AlgExpandCard'
import { AlgOpsCard } from '../components/AlgOpsCard'
import { AlgSolveCard } from '../components/AlgSolveCard'
import { AlgSquareCard } from '../components/AlgSquareCard'
import { AlgTermsCard } from '../components/AlgTermsCard'
import { AlgTrickCard } from '../components/AlgTrickCard'
import type { Explorer } from '../topics'

/**
 * Betűs kifejezések: a mind-reading trick that only works because a letter
 * stands for any number, the vocabulary that says what may be added to what,
 * the arithmetic of single terms, the rectangle behind the distributive law,
 * the three identities worth knowing by heart, what they do to an equation,
 * and the completed square that hands you the lowest point of a parabola.
 */
export const ALG_EXPLORERS: Explorer[] = [
  { id: 'trick', navKey: 'alg.nav1', questionKey: 'alg.q1', Card: AlgTrickCard },
  { id: 'terms', navKey: 'alg.nav2', questionKey: 'alg.q2', Card: AlgTermsCard },
  { id: 'ops', navKey: 'alg.nav3', questionKey: 'alg.q3', Card: AlgOpsCard },
  { id: 'expand', navKey: 'alg.nav4', questionKey: 'alg.q4', Card: AlgExpandCard },
  { id: 'square', navKey: 'alg.nav5', questionKey: 'alg.q5', Card: AlgSquareCard },
  { id: 'diff', navKey: 'alg.nav6', questionKey: 'alg.q6', Card: AlgDiffCard },
  { id: 'solve', navKey: 'alg.nav7', questionKey: 'alg.q7', Card: AlgSolveCard },
  { id: 'complete', navKey: 'alg.nav8', questionKey: 'alg.q8', Card: AlgCompleteCard },
]
