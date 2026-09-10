import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ComingSoonPage } from './components/ComingSoonPage'
import { LessonPage } from './components/LessonPage'
import { Sidebar } from './components/Sidebar'
import { DEFAULT_TOPIC_ID, findTopic, parseHash } from './topics'

const LANGS = ['hu', 'en'] as const

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id: string) => {
    if (window.location.hash === `#${id}`) setRoute(parseHash(`#${id}`))
    else window.location.hash = id
  }

  const hit = route.topic ? route : parseHash(`#${DEFAULT_TOPIC_ID}`)
  const topic = hit.topic ?? findTopic(DEFAULT_TOPIC_ID)!.topic
  const section = hit.section ?? findTopic(DEFAULT_TOPIC_ID)!.section
  const slug = route.explorer?.id

  // The card only exists once the lesson has rendered, so the jump waits a
  // frame. Landing on a lesson without a slug starts at the top of it.
  useEffect(() => {
    const target = slug && topic.prefix ? `${topic.prefix}-${slug}` : null
    const frame = requestAnimationFrame(() => {
      const el = target ? document.getElementById(target) : null
      if (!el) {
        window.scrollTo({ top: 0 })
        return
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [topic, slug])

  return (
    <div className="shell">
      <header className="header">
        <div className="header-row">
          <h1>MathVis</h1>
          <div className="lang-switch" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l}
                className={i18n.language === l ? 'lang-btn active' : 'lang-btn'}
                onClick={() => i18n.changeLanguage(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      <div className="body">
        <Sidebar activeId={topic.id} activeSection={section.id} onSelect={select} />
        <main className="page" key={topic.id}>
          {topic.explorers ? (
            <LessonPage topic={topic} />
          ) : topic.page ? (
            <topic.page />
          ) : (
            <ComingSoonPage titleKey={topic.labelKey} />
          )}
        </main>
      </div>
    </div>
  )
}
