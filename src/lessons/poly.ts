import { PolyAnglesCard } from '../components/PolyAnglesCard'
import { PolyAreaCard } from '../components/PolyAreaCard'
import { PolyFamilyCard } from '../components/PolyFamilyCard'
import { PolyRegularCard } from '../components/PolyRegularCard'
import type { Explorer } from '../topics'

/**
 * Négyszögek, sokszögek: how the names of the quadrilaterals nest, the
 * rearrangements the area formulas come from, the two angle sums of a polygon,
 * and why a regular polygon's area is perimeter times apothem over two.
 */
export const POLY_EXPLORERS: Explorer[] = [
  { id: 'family', navKey: 'poly.nav1', questionKey: 'poly.q1', Card: PolyFamilyCard },
  { id: 'area', navKey: 'poly.nav2', questionKey: 'poly.q2', Card: PolyAreaCard },
  { id: 'angles', navKey: 'poly.nav3', questionKey: 'poly.q3', Card: PolyAnglesCard },
  { id: 'regular', navKey: 'poly.nav4', questionKey: 'poly.q4', Card: PolyRegularCard },
]
