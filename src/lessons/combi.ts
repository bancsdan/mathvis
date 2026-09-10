import { CombiGraphCard } from '../components/CombiGraphCard'
import { CombiOrderCard } from '../components/CombiOrderCard'
import { CombiParityCard } from '../components/CombiParityCard'
import { CombiProductCard } from '../components/CombiProductCard'
import { CombiSelectCard } from '../components/CombiSelectCard'
import { CombiSumCard } from '../components/CombiSumCard'
import type { Explorer } from '../topics'

/**
 * Kombinatorika, gráfok: six explorers — when a choice multiplies, when cases
 * add up, arranging in order with and without repeated items, choosing with
 * and without order, the handshake graph, and the parity argument that rules
 * some acquaintance patterns out entirely.
 */
export const COMBI_EXPLORERS: Explorer[] = [
  { id: 'product', navKey: 'combi.nav1', questionKey: 'combi.q1', Card: CombiProductCard },
  { id: 'sum', navKey: 'combi.nav2', questionKey: 'combi.q2', Card: CombiSumCard },
  { id: 'order', navKey: 'combi.nav3', questionKey: 'combi.q3', Card: CombiOrderCard },
  { id: 'select', navKey: 'combi.nav4', questionKey: 'combi.q4', Card: CombiSelectCard },
  { id: 'graph', navKey: 'combi.nav5', questionKey: 'combi.q5', Card: CombiGraphCard },
  { id: 'parity', navKey: 'combi.nav6', questionKey: 'combi.q6', Card: CombiParityCard },
]
