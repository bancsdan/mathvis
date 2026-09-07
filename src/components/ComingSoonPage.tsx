import { useTranslation } from 'react-i18next'

interface Props {
  titleKey: string
}

/** Placeholder shown for curriculum topics that have no lesson written yet. */
export function ComingSoonPage({ titleKey }: Props) {
  const { t } = useTranslation()
  return (
    <section className="card">
      <div className="card-head">
        <h2>{t(titleKey)}</h2>
      </div>
      <p className="card-note lesson-text">{t('nav.comingSoonBody')}</p>
    </section>
  )
}
