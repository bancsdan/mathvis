import { useTranslation } from 'react-i18next'
import { FnAssignCard } from './FnAssignCard'
import { FnDefineCard } from './FnDefineCard'
import { FnElementaryCard } from './FnElementaryCard'
import { FnInverseCard } from './FnInverseCard'
import { FnLinearCard } from './FnLinearCard'
import { FnModelCard } from './FnModelCard'
import { FnReadCard } from './FnReadCard'
import { FnTransformCard } from './FnTransformCard'
import { useActiveSection } from './useActiveSection'

/** Module level, so the hook's dependency stays stable across renders. */
const SECTION_IDS = [
  'fn-assign',
  'fn-define',
  'fn-read',
  'fn-linear',
  'fn-elementary',
  'fn-transform',
  'fn-inverse',
  'fn-model',
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * A függvény fogalma, függvénytulajdonságok: the arrows that make an
 * assignment a function and the ones that let it be turned around, a rule
 * given as a formula, a table and a picture at once, the properties read off a
 * graph, the two numbers of a straight line, the three graphs worth knowing by
 * heart, the four moves that shift and stretch them, the mirror image in
 * y = x, and two everyday quantities whose answer is the shape of the graph.
 */
export function FnPage() {
  const { t } = useTranslation()
  const active = useActiveSection(SECTION_IDS)

  return (
    <>
      {/* Buttons rather than hash links: the app reads the URL hash to pick the
          topic, so an anchor would navigate away from this lesson. */}
      <nav className="section-nav" aria-label={t('fn.tocAria')}>
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
            {t(`fn.nav${i + 1}`)}
          </button>
        ))}
      </nav>

      <FnAssignCard id={SECTION_IDS[0]} />
      <FnDefineCard id={SECTION_IDS[1]} />
      <FnReadCard id={SECTION_IDS[2]} />
      <FnLinearCard id={SECTION_IDS[3]} />
      <FnElementaryCard id={SECTION_IDS[4]} />
      <FnTransformCard id={SECTION_IDS[5]} />
      <FnInverseCard id={SECTION_IDS[6]} />
      <FnModelCard id={SECTION_IDS[7]} />
    </>
  )
}
