import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface Props {
  /** One key per paragraph; each may carry <b>/<i> markup. */
  i18nKey: string | readonly string[]
  /** Anything typeset that belongs under the words, e.g. a block `<Tex>`. */
  children?: ReactNode
}

/**
 * A boxed definition. Every term a lesson introduces gets one of these, so a
 * reader skimming for "what does X mean" finds it by colour alone.
 *
 * The label ("Definíció:") sits on its own line above the text, so every
 * box starts the same way and the term itself opens the first line.
 */
export function Definition({ i18nKey, children }: Props) {
  const { t } = useTranslation()
  const keys = typeof i18nKey === 'string' ? [i18nKey] : i18nKey

  return (
    <aside className="definition lesson-text">
      <strong className="definition-label">{t('app.definition')}:</strong>
      {keys.map((key) => (
        <p key={key}>
          <Trans i18nKey={key} components={{ b: <strong />, i: <em /> }} />
        </p>
      ))}
      {children}
    </aside>
  )
}
