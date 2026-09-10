import { SetsCountingCard } from '../components/SetsCountingCard'
import { SetsDefineCard } from '../components/SetsDefineCard'
import { SetsDeMorganCard } from '../components/SetsDeMorganCard'
import { SetsInfinityCard } from '../components/SetsInfinityCard'
import { SetsOperationsCard } from '../components/SetsOperationsCard'
import { SetsRelationsCard } from '../components/SetsRelationsCard'
import type { Explorer } from '../topics'

/**
 * Halmazok: six explorers, from the two ways of giving a set through the
 * operations and De Morgan to the pairing that makes an infinite set the same
 * size as a proper subset of itself.
 */
export const SETS_EXPLORERS: Explorer[] = [
  { id: 'define', navKey: 'sets.nav1', questionKey: 'sets.q1', Card: SetsDefineCard },
  { id: 'relations', navKey: 'sets.nav2', questionKey: 'sets.q2', Card: SetsRelationsCard },
  { id: 'ops', navKey: 'sets.nav3', questionKey: 'sets.q3', Card: SetsOperationsCard },
  { id: 'demorgan', navKey: 'sets.nav4', questionKey: 'sets.q4', Card: SetsDeMorganCard },
  { id: 'count', navKey: 'sets.nav5', questionKey: 'sets.q5', Card: SetsCountingCard },
  { id: 'infinity', navKey: 'sets.nav6', questionKey: 'sets.q6', Card: SetsInfinityCard },
]
