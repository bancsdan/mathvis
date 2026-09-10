import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Topic } from '../topics'
import { useActiveSection } from './useActiveSection'

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * Every lesson, drawn from its list of explorers: a sticky in-page menu, then
 * one card per explorer. The card's DOM id is `${prefix}-${explorer.id}`,
 * which is also the slug the URL hash carries (`#functions/transform`).
 */
export function LessonPage({ topic }: { topic: Topic }) {
  const { t } = useTranslation()
  const explorers = topic.explorers ?? []
  const prefix = topic.prefix ?? topic.id
  // `useActiveSection` observes the array it is given, so it has to keep its
  // identity between renders; the topic itself only changes on navigation.
  const ids = useMemo(
    () => (topic.explorers ?? []).map((ex) => `${topic.prefix ?? topic.id}-${ex.id}`),
    [topic],
  )
  const active = useActiveSection(ids)

  // Buttons rather than hash links: an anchor would fire a hashchange and
  // remount the page. The hash is rewritten in place instead, so the explorer
  // stays copy-pasteable without the click piling up history entries.
  const select = (slug: string) => {
    const hash = `#${topic.id}/${slug}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
    scrollToSection(`${prefix}-${slug}`)
  }

  return (
    <>
      <nav className="section-nav" aria-label={t(`${prefix}.tocAria`)}>
        {explorers.map((ex, i) => (
          <button
            key={ex.id}
            type="button"
            className={active === ids[i] ? 'section-nav-item active' : 'section-nav-item'}
            aria-current={active === ids[i] ? 'true' : undefined}
            onClick={() => select(ex.id)}
          >
            <span className="section-nav-num" aria-hidden="true">
              {i + 1}
            </span>
            {t(ex.navKey)}
          </button>
        ))}
      </nav>

      {explorers.map((ex, i) => (
        <ex.Card key={ex.id} id={ids[i]} />
      ))}
    </>
  )
}
