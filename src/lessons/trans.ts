import { TransComposeCard } from '../components/TransComposeCard'
import { TransCongruentCard } from '../components/TransCongruentCard'
import { TransReflectCard } from '../components/TransReflectCard'
import { TransSimilarCard } from '../components/TransSimilarCard'
import type { Explorer } from '../topics'

/**
 * Transzformációk, szerkesztések: what a reflection keeps and what it turns
 * round, two reflections composing into a rotation or a translation, the three
 * data that pin a triangle down, and why doubling the sides quadruples the
 * area.
 */
export const TRANS_EXPLORERS: Explorer[] = [
  { id: 'reflect', navKey: 'trans.nav1', questionKey: 'trans.q1', Card: TransReflectCard },
  { id: 'compose', navKey: 'trans.nav2', questionKey: 'trans.q2', Card: TransComposeCard },
  { id: 'congruent', navKey: 'trans.nav3', questionKey: 'trans.q3', Card: TransCongruentCard },
  { id: 'similar', navKey: 'trans.nav4', questionKey: 'trans.q4', Card: TransSimilarCard },
]
