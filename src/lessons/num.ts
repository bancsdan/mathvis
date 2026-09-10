import { NumAbsCard } from '../components/NumAbsCard'
import { NumFractionCard } from '../components/NumFractionCard'
import { NumIntervalCard } from '../components/NumIntervalCard'
import { NumLineCard } from '../components/NumLineCard'
import { NumTowerCard } from '../components/NumTowerCard'
import type { Explorer } from '../topics'

/**
 * Számhalmazok, műveletek, as five explorers: why ℕ has to keep growing until
 * it is ℝ, the subtraction trick that turns a repeating decimal back into a
 * fraction, where √2 sits on the line and what zooming in on a number writes
 * down, whether an endpoint belongs to an interval, and absolute value read as
 * a distance.
 */
export const NUM_EXPLORERS: Explorer[] = [
  { id: 'tower', navKey: 'num.nav1', questionKey: 'num.q1', Card: NumTowerCard },
  { id: 'fraction', navKey: 'num.nav2', questionKey: 'num.q2', Card: NumFractionCard },
  { id: 'line', navKey: 'num.nav3', questionKey: 'num.q3', Card: NumLineCard },
  { id: 'interval', navKey: 'num.nav4', questionKey: 'num.q4', Card: NumIntervalCard },
  { id: 'abs', navKey: 'num.nav5', questionKey: 'num.q5', Card: NumAbsCard },
]
