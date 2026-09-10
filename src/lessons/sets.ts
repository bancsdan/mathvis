import { SetsCountingCard } from '../components/SetsCountingCard'
import { SetsDeMorganCard } from '../components/SetsDeMorganCard'
import { SetsOperationsCard } from '../components/SetsOperationsCard'
import type { Explorer } from '../topics'

/**
 * Halmazok: three explorers, from the operations read off a Venn diagram
 * through De Morgan to the sieve that counts a union without counting anyone
 * twice.
 */
export const SETS_EXPLORERS: Explorer[] = [
  { id: 'ops', navKey: 'sets.nav3', questionKey: 'sets.q3', Card: SetsOperationsCard },
  { id: 'demorgan', navKey: 'sets.nav4', questionKey: 'sets.q4', Card: SetsDeMorganCard },
  { id: 'count', navKey: 'sets.nav5', questionKey: 'sets.q5', Card: SetsCountingCard },
]
