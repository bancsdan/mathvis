import { useTranslation } from 'react-i18next'
import { hasLesson, SECTIONS } from '../topics'

/**
 * The front door: every explorer as the question it answers, grouped by topic,
 * so a reader arrives at a confusion of theirs rather than at a curriculum.
 *
 * The cards are real anchors. In-page navigation must not be, because the app
 * reads the hash to choose the topic — but that is exactly what these do.
 */
export function HomePage() {
  const { t } = useTranslation()
  const soon = SECTIONS.flatMap((section) => section.topics).filter((topic) => !hasLesson(topic))

  return (
    <>
      <h2 className="home-title">{t('home.title')}</h2>
      <p className="home-lead">{t('home.lead')}</p>

      {SECTIONS.map((section) => {
        const pages = section.topics.filter((topic) => topic.page)
        return (
          <div key={section.id} className="home-section">
            {section.topics
              .filter((topic) => topic.explorers)
              .map((topic) => (
                <div key={topic.id} className="home-group">
                  <h3>{t(topic.labelKey)}</h3>
                  <div className="home-grid">
                    {topic.explorers!.map((ex) => (
                      <a key={ex.id} className="home-card" href={`#${topic.id}/${ex.id}`}>
                        {t(ex.questionKey)}
                        <span className="home-tag">{t(ex.navKey)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}

            {pages.length > 0 && (
              <div className="home-group">
                <h3>{t(section.labelKey)}</h3>
                <div className="home-grid">
                  {pages.map((topic) => (
                    <a key={topic.id} className="home-card" href={`#${topic.id}`}>
                      {t(topic.labelKey)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="home-group">
        <h3>{t('home.soon')}</h3>
        <ul className="home-soon">
          {soon.map((topic) => (
            <li key={topic.id}>
              {t(topic.labelKey)}
              <span className="nav-soon" aria-label={t('nav.comingSoon')}>
                {t('nav.soonBadge')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
