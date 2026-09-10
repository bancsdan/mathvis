import { AlgCompleteCard } from '../components/AlgCompleteCard'
import { AlgDiffCard } from '../components/AlgDiffCard'
import { AlgExpandCard } from '../components/AlgExpandCard'
import { AlgSquareCard } from '../components/AlgSquareCard'
import { AlgTrickCard } from '../components/AlgTrickCard'
import type { Explorer } from '../topics'

/**
 * Betűs kifejezések, as five explorers: a mind-reading trick that only works
 * because a letter stands for any number, the rectangle behind the
 * distributive law, the square whose middle strips are the 2ab everyone
 * forgets, the corner cut that turns a² − b² into a product, and the completed
 * square that hands you the lowest point of a parabola.
 */
export const ALG_EXPLORERS: Explorer[] = [
  { id: 'trick', navKey: 'alg.nav1', questionKey: 'alg.q1', Card: AlgTrickCard },
  { id: 'expand', navKey: 'alg.nav2', questionKey: 'alg.q2', Card: AlgExpandCard },
  { id: 'square', navKey: 'alg.nav3', questionKey: 'alg.q3', Card: AlgSquareCard },
  { id: 'diff', navKey: 'alg.nav4', questionKey: 'alg.q4', Card: AlgDiffCard },
  { id: 'complete', navKey: 'alg.nav5', questionKey: 'alg.q5', Card: AlgCompleteCard },
]
