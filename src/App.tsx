import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ComingSoonPage } from './components/ComingSoonPage'
import { HomePage } from './components/HomePage'
import { LessonPage } from './components/LessonPage'
import { Sidebar } from './components/Sidebar'
import { parseHash } from './topics'

const LANGS = ['hu', 'en'] as const

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    // The home page drops the hash entirely, so going back to a lesson from it
    // is a popstate rather than a hashchange.
    window.addEventListener('popstate', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onHash)
    }
  }, [])

  const select = (id: string) => {
    if (window.location.hash === `#${id}`) setRoute(parseHash(`#${id}`))
    else window.location.hash = id
  }

  const goHome = () => {
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    setRoute(parseHash(''))
  }

  const { topic, section, explorer } = route
  const prefix = topic?.prefix
  const slug = explorer?.id

  // The card only exists once the lesson has rendered, so the jump waits a
  // frame. Arriving anywhere without a slug starts at the top of the page.
  useEffect(() => {
    const target = prefix && slug ? `${prefix}-${slug}` : null
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
  }, [prefix, slug])

  return (
    <div className="shell">
      <header className="header">
        <div className="header-row">
          <h1>
            <button type="button" className="title-home" onClick={goHome}>
              MathVis
            </button>
          </h1>
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
        <Sidebar
          activeId={topic?.id ?? null}
          activeSection={section?.id ?? null}
          onSelect={select}
          onHome={goHome}
        />
        <main className="page" key={topic?.id ?? 'home'}>
          {!topic ? (
            <HomePage />
          ) : topic.explorers ? (
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
