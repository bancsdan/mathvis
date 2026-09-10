import { NumFractionCard } from '../components/NumFractionCard'
import { NumLineCard } from '../components/NumLineCard'
import type { Explorer } from '../topics'

/**
 * Számhalmazok, műveletek, as two explorers: the subtraction trick that turns a
 * repeating decimal back into a fraction, and where √2 sits on the line once
 * you keep zooming in on it.
 */
export const NUM_EXPLORERS: Explorer[] = [
  { id: 'fraction', navKey: 'num.nav2', questionKey: 'num.q2', Card: NumFractionCard },
  { id: 'line', navKey: 'num.nav3', questionKey: 'num.q3', Card: NumLineCard },
]
