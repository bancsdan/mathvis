import { PropChangeCard } from '../components/PropChangeCard'
import { PropGraphsCard } from '../components/PropGraphsCard'
import { PropInterestCard } from '../components/PropInterestCard'
import { PropInverseCard } from '../components/PropInverseCard'
import { PropPercentCard } from '../components/PropPercentCard'
import type { Explorer } from '../topics'

/**
 * Arányosság, százalékszámítás, as five explorers: the constant product, the
 * graph that tells a proportion from something that merely grows with it, the
 * three numbers of a percentage, why two percentage changes never simply add
 * up, and the interest that earns interest.
 */
export const PROP_EXPLORERS: Explorer[] = [
  { id: 'inverse', navKey: 'prop.nav2', questionKey: 'prop.q2', Card: PropInverseCard },
  { id: 'graphs', navKey: 'prop.nav3', questionKey: 'prop.q3', Card: PropGraphsCard },
  { id: 'percent', navKey: 'prop.nav4', questionKey: 'prop.q4', Card: PropPercentCard },
  { id: 'change', navKey: 'prop.nav5', questionKey: 'prop.q5', Card: PropChangeCard },
  { id: 'interest', navKey: 'prop.nav6', questionKey: 'prop.q6', Card: PropInterestCard },
]
