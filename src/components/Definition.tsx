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
 * The label ("Definíció:") opens the first paragraph rather than sitting on
 * its own line, so a one-sentence definition stays one line tall.
 */
export function Definition({ i18nKey, children }: Props) {
  const { t } = useTranslation()
  const keys = typeof i18nKey === 'string' ? [i18nKey] : i18nKey

  return (
    <aside className="definition lesson-text">
      {keys.map((key, i) => (
        <p key={key}>
          {i === 0 && <strong className="definition-label">{t('app.definition')}:</strong>}{' '}
          <Trans i18nKey={key} components={{ b: <strong />, i: <em /> }} />
        </p>
      ))}
      {children}
    </aside>
  )
}
