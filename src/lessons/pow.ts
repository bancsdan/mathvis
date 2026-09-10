import { PowDefCard } from '../components/PowDefCard'
import { PowLawsCard } from '../components/PowLawsCard'
import { PowNegCard } from '../components/PowNegCard'
import { PowNthCard } from '../components/PowNthCard'
import { PowSciCalcCard } from '../components/PowSciCalcCard'
import { PowSciCard } from '../components/PowSciCard'
import { PowSqrtCard } from '../components/PowSqrtCard'
import { PowSqrtLawsCard } from '../components/PowSqrtLawsCard'
import type { Explorer } from '../topics'

/**
 * Hatvány, gyök: the shorthand for repeated multiplication, the pattern that
 * forces the zero and negative exponents, the laws as counted factors, normal
 * form and arithmetic in it, the square root as the side of a square, the laws
 * of roots with the sum trap, and finally the n-th root and fractional
 * exponents the earlier laws leave no choice about.
 */
export const POW_EXPLORERS: Explorer[] = [
  { id: 'def', navKey: 'pow.nav1', questionKey: 'pow.q1', Card: PowDefCard },
  { id: 'neg', navKey: 'pow.nav2', questionKey: 'pow.q2', Card: PowNegCard },
  { id: 'laws', navKey: 'pow.nav3', questionKey: 'pow.q3', Card: PowLawsCard },
  { id: 'sci', navKey: 'pow.nav4', questionKey: 'pow.q4', Card: PowSciCard },
  { id: 'scicalc', navKey: 'pow.nav5', questionKey: 'pow.q5', Card: PowSciCalcCard },
  { id: 'sqrt', navKey: 'pow.nav6', questionKey: 'pow.q6', Card: PowSqrtCard },
  { id: 'sqrtlaws', navKey: 'pow.nav7', questionKey: 'pow.q7', Card: PowSqrtLawsCard },
  { id: 'nth', navKey: 'pow.nav8', questionKey: 'pow.q8', Card: PowNthCard },
]
