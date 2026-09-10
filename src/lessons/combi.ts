import { CombiGraphCard } from '../components/CombiGraphCard'
import { CombiModelCard } from '../components/CombiModelCard'
import { CombiOrderCard } from '../components/CombiOrderCard'
import { CombiProductCard } from '../components/CombiProductCard'
import { CombiSelectCard } from '../components/CombiSelectCard'
import { CombiSieveCard } from '../components/CombiSieveCard'
import { CombiSumCard } from '../components/CombiSumCard'
import { CombiTimetableCard } from '../components/CombiTimetableCard'
import type { Explorer } from '../topics'

/**
 * Kombinatorika, gráfok: counting a multi-step choice, splitting into cases,
 * arranging in order, ordering under conditions, choosing with and without
 * order, graphs and their degrees, modelling a word problem with a graph, and
 * the sieve applied to numbers.
 */
export const COMBI_EXPLORERS: Explorer[] = [
  { id: 'product', navKey: 'combi.nav1', questionKey: 'combi.q1', Card: CombiProductCard },
  { id: 'sum', navKey: 'combi.nav2', questionKey: 'combi.q2', Card: CombiSumCard },
  { id: 'order', navKey: 'combi.nav3', questionKey: 'combi.q3', Card: CombiOrderCard },
  { id: 'timetable', navKey: 'combi.nav4', questionKey: 'combi.q4', Card: CombiTimetableCard },
  { id: 'select', navKey: 'combi.nav5', questionKey: 'combi.q5', Card: CombiSelectCard },
  { id: 'graph', navKey: 'combi.nav6', questionKey: 'combi.q6', Card: CombiGraphCard },
  { id: 'model', navKey: 'combi.nav7', questionKey: 'combi.q7', Card: CombiModelCard },
  { id: 'sieve', navKey: 'combi.nav8', questionKey: 'combi.q8', Card: CombiSieveCard },
]
