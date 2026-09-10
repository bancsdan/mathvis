import { NumAbsCard } from '../components/NumAbsCard'
import { NumEstimateCard } from '../components/NumEstimateCard'
import { NumFractionCard } from '../components/NumFractionCard'
import { NumIntervalCard } from '../components/NumIntervalCard'
import { NumLawsCard } from '../components/NumLawsCard'
import { NumLineCard } from '../components/NumLineCard'
import { NumRoundCard } from '../components/NumRoundCard'
import { NumTowerCard } from '../components/NumTowerCard'
import type { Explorer } from '../topics'

/**
 * Számhalmazok, műveletek: how ℕ grows into ℝ, the laws the four operations
 * obey, fractions and decimals as two writings of one number, the number line,
 * intervals, absolute value with its two companions, estimating before
 * calculating, and rounding a measurement honestly.
 */
export const NUM_EXPLORERS: Explorer[] = [
  { id: 'tower', navKey: 'num.nav1', questionKey: 'num.q1', Card: NumTowerCard },
  { id: 'laws', navKey: 'num.nav2', questionKey: 'num.q2', Card: NumLawsCard },
  { id: 'fraction', navKey: 'num.nav3', questionKey: 'num.q3', Card: NumFractionCard },
  { id: 'line', navKey: 'num.nav4', questionKey: 'num.q4', Card: NumLineCard },
  { id: 'interval', navKey: 'num.nav5', questionKey: 'num.q5', Card: NumIntervalCard },
  { id: 'abs', navKey: 'num.nav6', questionKey: 'num.q6', Card: NumAbsCard },
  { id: 'estimate', navKey: 'num.nav7', questionKey: 'num.q7', Card: NumEstimateCard },
  { id: 'round', navKey: 'num.nav8', questionKey: 'num.q8', Card: NumRoundCard },
]
