import { useTranslation } from 'react-i18next'
import { PowDefCard } from './PowDefCard'
import { PowLawsCard } from './PowLawsCard'
import { PowNegCard } from './PowNegCard'
import { PowNthCard } from './PowNthCard'
import { PowSciCalcCard } from './PowSciCalcCard'
import { PowSciCard } from './PowSciCard'
import { PowSqrtCard } from './PowSqrtCard'
import { PowSqrtLawsCard } from './PowSqrtLawsCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'pow-def',
  'pow-neg',
  'pow-laws',
  'pow-sci',
  'pow-scicalc',
  'pow-sqrt',
  'pow-sqrtlaws',
  'pow-nth',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Hatvány, gyök: the shorthand for repeated multiplication, the pattern that
 * forces the zero and negative exponents, the laws as counted factors, normal
 * form and arithmetic in it, the square root as the side of a square, the laws
 * of roots with the sum trap, and finally the n-th root and fractional
 * exponents the earlier laws leave no choice about.
 */
export function PowPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('pow.tocAria')}>
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
            {t(`pow.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <PowDefCard id={SECTION_IDS[0]} />
      <PowNegCard id={SECTION_IDS[1]} />
      <PowLawsCard id={SECTION_IDS[2]} />
      <PowSciCard id={SECTION_IDS[3]} />
      <PowSciCalcCard id={SECTION_IDS[4]} />
      <PowSqrtCard id={SECTION_IDS[5]} />
      <PowSqrtLawsCard id={SECTION_IDS[6]} />
      <PowNthCard id={SECTION_IDS[7]} />
    </>
  )
}
