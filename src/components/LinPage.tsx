import { useTranslation } from 'react-i18next'
import { LinBalanceCard } from './LinBalanceCard'
import { LinGraphCard } from './LinGraphCard'
import { LinIneqCard } from './LinIneqCard'
import { LinModelCard } from './LinModelCard'
import { LinProblemsCard } from './LinProblemsCard'
import { LinSetsCard } from './LinSetsCard'
import { LinSysGraphCard } from './LinSysGraphCard'
import { LinSystemsCard } from './LinSystemsCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'lin-balance',
  'lin-sets',
  'lin-graph',
  'lin-ineq',
  'lin-systems',
  'lin-sysgraph',
  'lin-model',
  'lin-problems',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Elsőfokú egyenletek, egyenlőtlenségek, egyenletrendszerek: the balance that
 * every solving step obeys, the base set that decides what counts as an
 * answer, the two lines whose crossing is the root, the one move that turns an
 * inequality sign, two ways of losing an unknown from a system, the same
 * system as a picture, and the five steps that turn a story into an equation —
 * including the stories that cannot be turned into one.
 */
export function LinPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('lin.tocAria')}>
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
            {t(`lin.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <LinBalanceCard id={SECTION_IDS[0]} />
      <LinSetsCard id={SECTION_IDS[1]} />
      <LinGraphCard id={SECTION_IDS[2]} />
      <LinIneqCard id={SECTION_IDS[3]} />
      <LinSystemsCard id={SECTION_IDS[4]} />
      <LinSysGraphCard id={SECTION_IDS[5]} />
      <LinModelCard id={SECTION_IDS[6]} />
      <LinProblemsCard id={SECTION_IDS[7]} />
    </>
  )
}
