import { useTranslation } from 'react-i18next'
import { CombiGraphCard } from './CombiGraphCard'
import { CombiModelCard } from './CombiModelCard'
import { CombiOrderCard } from './CombiOrderCard'
import { CombiProductCard } from './CombiProductCard'
import { CombiSelectCard } from './CombiSelectCard'
import { CombiSieveCard } from './CombiSieveCard'
import { CombiSumCard } from './CombiSumCard'
import { CombiTimetableCard } from './CombiTimetableCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'combi-product',
  'combi-sum',
  'combi-order',
  'combi-timetable',
  'combi-select',
  'combi-graph',
  'combi-model',
  'combi-sieve',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Kombinatorika, gráfok: counting a multi-step choice, splitting into cases,
 * arranging in order, ordering under conditions, choosing with and without
 * order, graphs and their degrees, modelling a word problem with a graph, and
 * the sieve applied to numbers.
 */
export function CombiPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('combi.tocAria')}>
        {SECTION_IDS.map((id, i) => (
          <button
            key={id}
            type="button"
            className={active === id ? 'section-nav-item active' : 'section-nav-item'}
            aria-current={active === id ? 'true' : undefined}
            onClick={() => scrollToSection(id)}
          >
            <span className="section-nav-num" aria-hidden="true">
              {i + 1}
            </span>
            {t(`combi.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <CombiProductCard id={SECTION_IDS[0]} />
      <CombiSumCard id={SECTION_IDS[1]} />
      <CombiOrderCard id={SECTION_IDS[2]} />
      <CombiTimetableCard id={SECTION_IDS[3]} />
      <CombiSelectCard id={SECTION_IDS[4]} />
      <CombiGraphCard id={SECTION_IDS[5]} selectSectionId={SECTION_IDS[4]} />
      <CombiModelCard id={SECTION_IDS[6]} />
      <CombiSieveCard id={SECTION_IDS[7]} />
    </>
  )
}
