import { useTranslation } from 'react-i18next'
import { AlgCompleteCard } from './AlgCompleteCard'
import { AlgDiffCard } from './AlgDiffCard'
import { AlgExpandCard } from './AlgExpandCard'
import { AlgOpsCard } from './AlgOpsCard'
import { AlgSolveCard } from './AlgSolveCard'
import { AlgSquareCard } from './AlgSquareCard'
import { AlgTermsCard } from './AlgTermsCard'
import { AlgTrickCard } from './AlgTrickCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'alg-trick',
  'alg-terms',
  'alg-ops',
  'alg-expand',
  'alg-square',
  'alg-diff',
  'alg-solve',
  'alg-complete',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Betűs kifejezések: a mind-reading trick that only works because a letter
 * stands for any number, the vocabulary that says what may be added to what,
 * the arithmetic of single terms, the rectangle behind the distributive law,
 * the three identities worth knowing by heart, what they do to an equation,
 * and the completed square that hands you the lowest point of a parabola.
 */
export function AlgPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('alg.tocAria')}>
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
            {t(`alg.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <AlgTrickCard id={SECTION_IDS[0]} />
      <AlgTermsCard id={SECTION_IDS[1]} />
      <AlgOpsCard id={SECTION_IDS[2]} />
      <AlgExpandCard id={SECTION_IDS[3]} />
      <AlgSquareCard id={SECTION_IDS[4]} />
      <AlgDiffCard id={SECTION_IDS[5]} />
      <AlgSolveCard id={SECTION_IDS[6]} />
      <AlgCompleteCard id={SECTION_IDS[7]} />
    </>
  )
}
