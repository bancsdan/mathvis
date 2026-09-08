import { useTranslation } from 'react-i18next'
import { NumAbsCard } from './NumAbsCard'
import { NumEstimateCard } from './NumEstimateCard'
import { NumFractionCard } from './NumFractionCard'
import { NumIntervalCard } from './NumIntervalCard'
import { NumLawsCard } from './NumLawsCard'
import { NumLineCard } from './NumLineCard'
import { NumRoundCard } from './NumRoundCard'
import { NumTowerCard } from './NumTowerCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'num-tower',
  'num-laws',
  'num-fraction',
  'num-line',
  'num-interval',
  'num-abs',
  'num-estimate',
  'num-round',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Számhalmazok, műveletek: how ℕ grows into ℝ, the laws the four operations
 * obey, fractions and decimals as two writings of one number, the number line,
 * intervals, absolute value with its two companions, estimating before
 * calculating, and rounding a measurement honestly.
 */
export function NumPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('num.tocAria')}>
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
            {t(`num.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <NumTowerCard id={SECTION_IDS[0]} />
      <NumLawsCard id={SECTION_IDS[1]} />
      <NumFractionCard id={SECTION_IDS[2]} />
      <NumLineCard id={SECTION_IDS[3]} />
      <NumIntervalCard id={SECTION_IDS[4]} />
      <NumAbsCard id={SECTION_IDS[5]} />
      <NumEstimateCard id={SECTION_IDS[6]} />
      <NumRoundCard id={SECTION_IDS[7]} />
    </>
  )
}
