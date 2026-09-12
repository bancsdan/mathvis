import { CircArcCard } from '../components/CircArcCard'
import { CircTangentCard } from '../components/CircTangentCard'
import { CircThalesCard } from '../components/CircThalesCard'
import type { Explorer } from '../topics'

/**
 * A kör és részei: the central angle as the fraction of the whole circle the
 * arc and the sector take, the tangent and its right angle, and Thales'
 * theorem with the reason behind it.
 */
export const CIRC_EXPLORERS: Explorer[] = [
  { id: 'arc', navKey: 'circ.nav1', questionKey: 'circ.q1', Card: CircArcCard },
  { id: 'tangent', navKey: 'circ.nav2', questionKey: 'circ.q2', Card: CircTangentCard },
  { id: 'thales', navKey: 'circ.nav3', questionKey: 'circ.q3', Card: CircThalesCard },
]
