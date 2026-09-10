import { QuadCompleteCard } from '../components/QuadCompleteCard'
import { QuadDiscCard } from '../components/QuadDiscCard'
import { QuadFactorCard } from '../components/QuadFactorCard'
import { QuadFormulaCard } from '../components/QuadFormulaCard'
import { QuadIneqCard } from '../components/QuadIneqCard'
import { QuadIntroCard } from '../components/QuadIntroCard'
import { QuadReduceCard } from '../components/QuadReduceCard'
import { QuadWordCard } from '../components/QuadWordCard'
import type { Explorer } from '../topics'

/**
 * Másodfokú egyenletek, egyenlőtlenségek: the one form every quadratic can be
 * tidied into and the step that quietly loses a root, the two numbers behind
 * the coefficients, the square that has to be completed, the formula that does
 * that completing once and for all, the discriminant read off the parabola,
 * the inequality answered by a stretch of the axis, a fourth-degree equation
 * put through a substitution, and the two stories where only one of the roots
 * is an answer.
 */
export const QUAD_EXPLORERS: Explorer[] = [
  { id: 'intro', navKey: 'quad.nav1', questionKey: 'quad.q1', Card: QuadIntroCard },
  { id: 'factor', navKey: 'quad.nav2', questionKey: 'quad.q2', Card: QuadFactorCard },
  { id: 'complete', navKey: 'quad.nav3', questionKey: 'quad.q3', Card: QuadCompleteCard },
  { id: 'formula', navKey: 'quad.nav4', questionKey: 'quad.q4', Card: QuadFormulaCard },
  { id: 'disc', navKey: 'quad.nav5', questionKey: 'quad.q5', Card: QuadDiscCard },
  { id: 'ineq', navKey: 'quad.nav6', questionKey: 'quad.q6', Card: QuadIneqCard },
  { id: 'reduce', navKey: 'quad.nav7', questionKey: 'quad.q7', Card: QuadReduceCard },
  { id: 'word', navKey: 'quad.nav8', questionKey: 'quad.q8', Card: QuadWordCard },
]
