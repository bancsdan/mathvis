import { TriAnglesCard } from '../components/TriAnglesCard'
import { TriAreaCard } from '../components/TriAreaCard'
import { TriInequalityCard } from '../components/TriInequalityCard'
import { TriLinesCard } from '../components/TriLinesCard'
import { TriPythagorasCard } from '../components/TriPythagorasCard'
import type { Explorer } from '../topics'

/**
 * Háromszögek: why the angles add up to 180°, when three lengths cannot close
 * into a triangle, why the notable lines meet in one point, the rearrangement
 * behind a² + b² = c², and where the height goes in an obtuse triangle.
 */
export const TRI_EXPLORERS: Explorer[] = [
  { id: 'angles', navKey: 'tri.nav1', questionKey: 'tri.q1', Card: TriAnglesCard },
  { id: 'inequality', navKey: 'tri.nav2', questionKey: 'tri.q2', Card: TriInequalityCard },
  { id: 'lines', navKey: 'tri.nav3', questionKey: 'tri.q3', Card: TriLinesCard },
  { id: 'pythagoras', navKey: 'tri.nav4', questionKey: 'tri.q4', Card: TriPythagorasCard },
  { id: 'area', navKey: 'tri.nav5', questionKey: 'tri.q5', Card: TriAreaCard },
]
