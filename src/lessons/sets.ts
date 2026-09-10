import { SetsCountingCard } from '../components/SetsCountingCard'
import { SetsDefineCard } from '../components/SetsDefineCard'
import { SetsInfinityCard } from '../components/SetsInfinityCard'
import { SetsLogicCard } from '../components/SetsLogicCard'
import { SetsOperationsCard } from '../components/SetsOperationsCard'
import { SetsPartitionCard } from '../components/SetsPartitionCard'
import { SetsRelationsCard } from '../components/SetsRelationsCard'
import type { Explorer } from '../topics'

/**
 * Halmazok: the first high school lesson, covering the whole curriculum entry
 * from defining a set through to comparing infinite ones.
 */
export const SETS_EXPLORERS: Explorer[] = [
  { id: 'define', navKey: 'sets.nav1', questionKey: 'sets.q1', Card: SetsDefineCard },
  { id: 'relations', navKey: 'sets.nav2', questionKey: 'sets.q2', Card: SetsRelationsCard },
  { id: 'ops', navKey: 'sets.nav3', questionKey: 'sets.q3', Card: SetsOperationsCard },
  { id: 'logic', navKey: 'sets.nav4', questionKey: 'sets.q4', Card: SetsLogicCard },
  { id: 'count', navKey: 'sets.nav5', questionKey: 'sets.q5', Card: SetsCountingCard },
  { id: 'partition', navKey: 'sets.nav6', questionKey: 'sets.q6', Card: SetsPartitionCard },
  { id: 'infinity', navKey: 'sets.nav7', questionKey: 'sets.q7', Card: SetsInfinityCard },
]
