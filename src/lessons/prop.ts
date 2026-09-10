import { PropBillCard } from '../components/PropBillCard'
import { PropChangeCard } from '../components/PropChangeCard'
import { PropDirectCard } from '../components/PropDirectCard'
import { PropGraphsCard } from '../components/PropGraphsCard'
import { PropInterestCard } from '../components/PropInterestCard'
import { PropInverseCard } from '../components/PropInverseCard'
import { PropPercentCard } from '../components/PropPercentCard'
import { PropUnitsCard } from '../components/PropUnitsCard'
import type { Explorer } from '../topics'

/**
 * Arányosság, százalékszámítás: the constant quotient and the constant
 * product, the shapes those and their relatives draw on a graph, the ladders
 * behind unit conversion, the three numbers of a percentage, why two
 * percentage changes never simply add up, an electricity bill taken apart,
 * and the interest that earns interest.
 */
export const PROP_EXPLORERS: Explorer[] = [
  { id: 'direct', navKey: 'prop.nav1', questionKey: 'prop.q1', Card: PropDirectCard },
  { id: 'inverse', navKey: 'prop.nav2', questionKey: 'prop.q2', Card: PropInverseCard },
  { id: 'graphs', navKey: 'prop.nav3', questionKey: 'prop.q3', Card: PropGraphsCard },
  { id: 'units', navKey: 'prop.nav4', questionKey: 'prop.q4', Card: PropUnitsCard },
  { id: 'percent', navKey: 'prop.nav5', questionKey: 'prop.q5', Card: PropPercentCard },
  { id: 'change', navKey: 'prop.nav6', questionKey: 'prop.q6', Card: PropChangeCard },
  { id: 'bill', navKey: 'prop.nav7', questionKey: 'prop.q7', Card: PropBillCard },
  { id: 'interest', navKey: 'prop.nav8', questionKey: 'prop.q8', Card: PropInterestCard },
]
