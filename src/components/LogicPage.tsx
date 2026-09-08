import { useTranslation } from 'react-i18next'
import { LogicConnectivesCard } from './LogicConnectivesCard'
import { LogicGamesCard } from './LogicGamesCard'
import { LogicIffCard } from './LogicIffCard'
import { LogicImplicationCard } from './LogicImplicationCard'
import { LogicNegationCard } from './LogicNegationCard'
import { LogicProofCard } from './LogicProofCard'
import { LogicQuantifierCard } from './LogicQuantifierCard'
import { LogicStatementCard } from './LogicStatementCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'logic-statement',
  'logic-negation',
  'logic-connectives',
  'logic-quantifiers',
  'logic-implication',
  'logic-iff',
  'logic-proof',
  'logic-games',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Matematikai logika: statements and their truth value, the connectives and
 * how they mirror set operations, quantifiers, implication and its converse,
 * what a proof is, and two logic games.
 */
export function LogicPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('logic.tocAria')}>
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
            {t(`logic.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <LogicStatementCard id={SECTION_IDS[0]} />
      <LogicNegationCard id={SECTION_IDS[1]} />
      <LogicConnectivesCard id={SECTION_IDS[2]} />
      <LogicQuantifierCard id={SECTION_IDS[3]} />
      <LogicImplicationCard id={SECTION_IDS[4]} />
      <LogicIffCard id={SECTION_IDS[5]} />
      <LogicProofCard id={SECTION_IDS[6]} />
      <LogicGamesCard id={SECTION_IDS[7]} />
    </>
  )
}
