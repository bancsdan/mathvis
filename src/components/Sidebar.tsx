import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { hasLesson, SECTIONS, type SectionId } from '../topics'

interface Props {
  /** null on the home page. */
  activeId: string | null
  activeSection: SectionId | null
  onSelect: (id: string) => void
  onHome: () => void
}

/** Left-hand topic menu: one collapsible group per level (high school / university). */
export function Sidebar({ activeId, activeSection, onSelect, onHome }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    // The home page opens the group the reader most likely wants next.
    highschool: activeSection !== 'university',
    university: activeSection === 'university',
  })

  const toggle = (id: SectionId) => setOpen((o) => ({ ...o, [id]: !o[id] }))

  return (
    <nav className="sidebar" aria-label={t('app.topics')}>
      <button
        className={activeId === null ? 'nav-group-btn nav-home active' : 'nav-group-btn nav-home'}
        aria-current={activeId === null ? 'page' : undefined}
        onClick={onHome}
      >
        {t('nav.home')}
      </button>
      {SECTIONS.map((section) => {
        const expanded = open[section.id]
        const listId = `nav-${section.id}`
        return (
          <div key={section.id} className="nav-group">
            <button
              className={expanded ? 'nav-group-btn open' : 'nav-group-btn'}
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => toggle(section.id)}
            >
              <span className="nav-chevron" aria-hidden="true">
                ▸
              </span>
              {t(section.labelKey)}
            </button>
            <ul id={listId} className="nav-list" hidden={!expanded}>
              {section.topics.map((topic) => (
                <li key={topic.id}>
                  <button
                    className={topic.id === activeId ? 'nav-item active' : 'nav-item'}
                    aria-current={topic.id === activeId ? 'page' : undefined}
                    onClick={() => onSelect(topic.id)}
                  >
                    {t(topic.labelKey)}
                    {!hasLesson(topic) && (
                      <span className="nav-soon" aria-label={t('nav.comingSoon')}>
                        {t('nav.soonBadge')}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
