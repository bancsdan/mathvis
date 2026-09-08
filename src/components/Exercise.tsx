import { useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'

interface Props {
  /** i18n key of the task text. Rendered with Trans, so it may carry <b>/<i>. */
  promptKey: string
  promptValues?: Record<string, string | number>
  /** Whether the answer the parent currently holds is the right one. */
  isCorrect: boolean
  /** False while the student has not answered at all, which disables checking. */
  canCheck: boolean
  /** Identifies the current answer, so a verdict can be tied to it. */
  answerKey: string
  /** The value `answerKey` takes once revealed, so the notice survives revealing. */
  solutionKey: string
  /** Sets the parent's own state to the solution, so revealing demonstrates it. */
  onReveal: () => void
  /** Shown only after a wrong answer. */
  hintKey?: string
  /** The answer widget, usually the section's own exploration control. */
  children: ReactNode
}

/**
 * Poses one task, checks it, and reports the verdict. The section owns the
 * answer and decides correctness; this only renders.
 *
 * A verdict is pinned to the answer that earned it and disappears the moment the
 * student changes that answer, so the feedback on screen is never stale.
 */
export function Exercise({
  promptKey,
  promptValues,
  isCorrect,
  canCheck,
  answerKey,
  solutionKey,
  onReveal,
  hintKey,
  children,
}: Props) {
  const { t } = useTranslation()
  const [state, setState] = useState<'checked' | 'revealed' | null>(null)
  const [verdictFor, setVerdictFor] = useState('')

  const shown = verdictFor === answerKey ? state : null
  const verdict = shown === 'revealed' ? 'revealed' : shown === 'checked' ? (isCorrect ? 'ok' : 'bad') : null

  return (
    <div className="exercise">
      <p className="exercise-prompt">
        <span className="exercise-tag">{t('ex.task')}</span>
        <Trans i18nKey={promptKey} values={promptValues} components={{ b: <strong />, i: <em /> }} />
      </p>
      {children}
      <div className="exercise-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canCheck}
          onClick={() => {
            setState('checked')
            setVerdictFor(answerKey)
          }}
        >
          {t('ex.check')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            onReveal()
            setState('revealed')
            setVerdictFor(solutionKey)
          }}
        >
          {t('ex.reveal')}
        </button>
      </div>
      {verdict && (
        <p className={`alias-verdict verdict-${verdict}`} role="status" aria-live="polite">
          {verdict === 'ok' && t('ex.correct')}
          {verdict === 'bad' && `${t('ex.wrong')}${hintKey ? ` ${t(hintKey)}` : ''}`}
          {verdict === 'revealed' && t('ex.revealed')}
        </p>
      )}
    </div>
  )
}
