import { GeoAnglesCard } from '../components/GeoAnglesCard'
import { GeoBisectorCard } from '../components/GeoBisectorCard'
import { GeoConstructCard } from '../components/GeoConstructCard'
import { GeoDistanceCard } from '../components/GeoDistanceCard'
import type { Explorer } from '../topics'

/**
 * Geometriai alapismeretek: the angle pairs two parallels and a transversal
 * make, why the perpendicular is the distance to a line, the two loci that
 * turn "equally far" into a line, and what a compass-and-ruler construction is
 * really doing.
 */
export const GEO_EXPLORERS: Explorer[] = [
  { id: 'angles', navKey: 'geo.nav1', questionKey: 'geo.q1', Card: GeoAnglesCard },
  { id: 'distance', navKey: 'geo.nav2', questionKey: 'geo.q2', Card: GeoDistanceCard },
  { id: 'bisector', navKey: 'geo.nav3', questionKey: 'geo.q3', Card: GeoBisectorCard },
  { id: 'construct', navKey: 'geo.nav4', questionKey: 'geo.q4', Card: GeoConstructCard },
]
