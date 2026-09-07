import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ComingSoonPage } from './components/ComingSoonPage'
import { Sidebar } from './components/Sidebar'
import { DEFAULT_TOPIC_ID, findTopic } from './topics'

const LANGS = ['hu', 'en'] as const

function topicFromHash(): string {
  const id = window.location.hash.replace(/^#/, '')
  return findTopic(id) ? id : DEFAULT_TOPIC_ID
}

export default function App() {
  const [topicId, setTopicId] = useState<string>(topicFromHash)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const onHash = () => setTopicId(topicFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id: string) => {
    setTopicId(id)
    if (window.location.hash !== `#${id}`) window.location.hash = id
  }

  const hit = findTopic(topicId) ?? findTopic(DEFAULT_TOPIC_ID)!
  const Page = hit.topic.page

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
        <Sidebar activeId={hit.topic.id} activeSection={hit.section.id} onSelect={select} />
        <main className="page" key={hit.topic.id}>
          {Page ? <Page /> : <ComingSoonPage titleKey={hit.topic.labelKey} />}
        </main>
      </div>
    </div>
  )
}
