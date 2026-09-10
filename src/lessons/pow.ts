import { PowDefCard } from '../components/PowDefCard'
import { PowLawsCard } from '../components/PowLawsCard'
import { PowNegCard } from '../components/PowNegCard'
import { PowNthCard } from '../components/PowNthCard'
import { PowSciCard } from '../components/PowSciCard'
import { PowSqrtCard } from '../components/PowSqrtCard'
import type { Explorer } from '../topics'

/**
 * Hatvány, gyök, as six explorers: the folded sheet of paper that makes 2ⁿ
 * felt, the ladder that forces the zero and negative exponents, the laws as
 * counted factors, the point walked into normal form, the square root as the
 * side of a square with the sum trap it invites, and the fractional exponent
 * the earlier laws leave no choice about.
 */
export const POW_EXPLORERS: Explorer[] = [
  { id: 'def', navKey: 'pow.nav1', questionKey: 'pow.q1', Card: PowDefCard },
  { id: 'neg', navKey: 'pow.nav2', questionKey: 'pow.q2', Card: PowNegCard },
  { id: 'laws', navKey: 'pow.nav3', questionKey: 'pow.q3', Card: PowLawsCard },
  { id: 'sci', navKey: 'pow.nav4', questionKey: 'pow.q4', Card: PowSciCard },
  { id: 'sqrt', navKey: 'pow.nav5', questionKey: 'pow.q5', Card: PowSqrtCard },
  { id: 'nth', navKey: 'pow.nav6', questionKey: 'pow.q6', Card: PowNthCard },
]
