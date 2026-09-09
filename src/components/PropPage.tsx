import { useTranslation } from 'react-i18next'
import { PropBillCard } from './PropBillCard'
import { PropChangeCard } from './PropChangeCard'
import { PropDirectCard } from './PropDirectCard'
import { PropGraphsCard } from './PropGraphsCard'
import { PropInterestCard } from './PropInterestCard'
import { PropInverseCard } from './PropInverseCard'
import { PropPercentCard } from './PropPercentCard'
import { PropUnitsCard } from './PropUnitsCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'prop-direct',
  'prop-inverse',
  'prop-graphs',
  'prop-units',
  'prop-percent',
  'prop-change',
  'prop-bill',
  'prop-interest',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Arányosság, százalékszámítás: the constant quotient and the constant
 * product, the shapes those and their relatives draw on a graph, the ladders
 * behind unit conversion, the three numbers of a percentage, why two
 * percentage changes never simply add up, an electricity bill taken apart,
 * and the interest that earns interest.
 */
export function PropPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('prop.tocAria')}>
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
            {t(`prop.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <PropDirectCard id={SECTION_IDS[0]} />
      <PropInverseCard id={SECTION_IDS[1]} />
      <PropGraphsCard id={SECTION_IDS[2]} />
      <PropUnitsCard id={SECTION_IDS[3]} />
      <PropPercentCard id={SECTION_IDS[4]} />
      <PropChangeCard id={SECTION_IDS[5]} />
      <PropBillCard id={SECTION_IDS[6]} />
      <PropInterestCard id={SECTION_IDS[7]} />
    </>
  )
}
