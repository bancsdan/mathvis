import { useTranslation } from 'react-i18next'
import { QuadCompleteCard } from './QuadCompleteCard'
import { QuadDiscCard } from './QuadDiscCard'
import { QuadFactorCard } from './QuadFactorCard'
import { QuadFormulaCard } from './QuadFormulaCard'
import { QuadIneqCard } from './QuadIneqCard'
import { QuadIntroCard } from './QuadIntroCard'
import { QuadReduceCard } from './QuadReduceCard'
import { QuadWordCard } from './QuadWordCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'quad-intro',
  'quad-factor',
  'quad-complete',
  'quad-formula',
  'quad-disc',
  'quad-ineq',
  'quad-reduce',
  'quad-word',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Másodfokú egyenletek, egyenlőtlenségek: the one form every quadratic can be
 * tidied into and the step that quietly loses a root, the two numbers behind
 * the coefficients, the square that has to be completed, the formula that does
 * that completing once and for all, the discriminant read off the parabola,
 * the inequality answered by a stretch of the axis, a fourth-degree equation
 * put through a substitution, and the two stories where only one of the roots
 * is an answer.
 */
export function QuadPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('quad.tocAria')}>
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
            {t(`quad.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <QuadIntroCard id={SECTION_IDS[0]} />
      <QuadFactorCard id={SECTION_IDS[1]} />
      <QuadCompleteCard id={SECTION_IDS[2]} />
      <QuadFormulaCard id={SECTION_IDS[3]} />
      <QuadDiscCard id={SECTION_IDS[4]} />
      <QuadIneqCard id={SECTION_IDS[5]} />
      <QuadReduceCard id={SECTION_IDS[6]} />
      <QuadWordCard id={SECTION_IDS[7]} />
    </>
  )
}
