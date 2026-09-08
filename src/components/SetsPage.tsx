import { useTranslation } from 'react-i18next'
import { SetsCountingCard } from './SetsCountingCard'
import { SetsDefineCard } from './SetsDefineCard'
import { SetsInfinityCard } from './SetsInfinityCard'
import { SetsLogicCard } from './SetsLogicCard'
import { SetsOperationsCard } from './SetsOperationsCard'
import { SetsPartitionCard } from './SetsPartitionCard'
import { SetsRelationsCard } from './SetsRelationsCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'sets-define',
  'sets-relations',
  'sets-ops',
  'sets-logic',
  'sets-count',
  'sets-partition',
  'sets-infinity',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Halmazok: the first high school lesson, covering the whole curriculum entry
 * from defining a set through to comparing infinite ones.
 */
export function SetsPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('sets.tocAria')}>
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
            {t(`sets.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <SetsDefineCard id={SECTION_IDS[0]} />
      <SetsRelationsCard id={SECTION_IDS[1]} />
      <SetsOperationsCard id={SECTION_IDS[2]} />
      <SetsLogicCard id={SECTION_IDS[3]} />
      <SetsCountingCard id={SECTION_IDS[4]} />
      <SetsPartitionCard id={SECTION_IDS[5]} />
      <SetsInfinityCard id={SECTION_IDS[6]} />
    </>
  )
}
