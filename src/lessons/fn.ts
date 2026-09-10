import { FnAssignCard } from '../components/FnAssignCard'
import { FnDefineCard } from '../components/FnDefineCard'
import { FnElementaryCard } from '../components/FnElementaryCard'
import { FnInverseCard } from '../components/FnInverseCard'
import { FnLinearCard } from '../components/FnLinearCard'
import { FnModelCard } from '../components/FnModelCard'
import { FnReadCard } from '../components/FnReadCard'
import { FnTransformCard } from '../components/FnTransformCard'
import type { Explorer } from '../topics'

/**
 * A függvény fogalma, függvénytulajdonságok: the arrows that make an
 * assignment a function and the ones that let it be turned around, a rule
 * given as a formula, a table and a picture at once, the properties read off a
 * graph, the two numbers of a straight line, the three graphs worth knowing by
 * heart, the four moves that shift and stretch them, the mirror image in
 * y = x, and two everyday quantities whose answer is the shape of the graph.
 */
export const FN_EXPLORERS: Explorer[] = [
  { id: 'assign', navKey: 'fn.nav1', questionKey: 'fn.q1', Card: FnAssignCard },
  { id: 'define', navKey: 'fn.nav2', questionKey: 'fn.q2', Card: FnDefineCard },
  { id: 'read', navKey: 'fn.nav3', questionKey: 'fn.q3', Card: FnReadCard },
  { id: 'linear', navKey: 'fn.nav4', questionKey: 'fn.q4', Card: FnLinearCard },
  { id: 'elementary', navKey: 'fn.nav5', questionKey: 'fn.q5', Card: FnElementaryCard },
  { id: 'transform', navKey: 'fn.nav6', questionKey: 'fn.q6', Card: FnTransformCard },
  { id: 'inverse', navKey: 'fn.nav7', questionKey: 'fn.q7', Card: FnInverseCard },
  { id: 'model', navKey: 'fn.nav8', questionKey: 'fn.q8', Card: FnModelCard },
]
