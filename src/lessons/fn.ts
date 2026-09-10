import { FnAssignCard } from '../components/FnAssignCard'
import { FnElementaryCard } from '../components/FnElementaryCard'
import { FnInverseCard } from '../components/FnInverseCard'
import { FnLinearCard } from '../components/FnLinearCard'
import { FnModelCard } from '../components/FnModelCard'
import { FnReadCard } from '../components/FnReadCard'
import { FnTransformCard } from '../components/FnTransformCard'
import type { Explorer } from '../topics'

/**
 * A függvény fogalma, függvénytulajdonságok: the arrows that make an
 * assignment a function, the properties read off a graph, the two numbers of a
 * straight line, the three graphs worth knowing by heart and how many x-es a
 * value has on each, the four moves that shift and stretch them, the mirror
 * image in y = x, and two everyday quantities whose answer is the shape of the
 * graph.
 */
export const FN_EXPLORERS: Explorer[] = [
  { id: 'assign', navKey: 'fn.nav1', questionKey: 'fn.q1', Card: FnAssignCard },
  { id: 'read', navKey: 'fn.nav2', questionKey: 'fn.q2', Card: FnReadCard },
  { id: 'linear', navKey: 'fn.nav3', questionKey: 'fn.q3', Card: FnLinearCard },
  { id: 'elementary', navKey: 'fn.nav4', questionKey: 'fn.q4', Card: FnElementaryCard },
  { id: 'transform', navKey: 'fn.nav5', questionKey: 'fn.q5', Card: FnTransformCard },
  { id: 'inverse', navKey: 'fn.nav6', questionKey: 'fn.q6', Card: FnInverseCard },
  { id: 'model', navKey: 'fn.nav7', questionKey: 'fn.q7', Card: FnModelCard },
]
