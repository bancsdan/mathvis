import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SENTENCES, type SentenceKind } from '../lib/logic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'

const KINDS: readonly SentenceKind[] = ['true', 'false', 'none']

/** Two worked examples shown labelled, the rest form the exercise. */
const WORKED = SENTENCES.slice(0, 2)
const TASK = SENTENCES.slice(2)

const solutionKey = TASK.map((s) => `${s.id}:${s.kind}`).join(',')

export function LogicStatementCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<ReadonlyMap<string, SentenceKind>>(new Map())

  const answerKey = TASK.map((s) => `${s.id}:${answers.get(s.id) ?? ''}`).join(',')
  const allAnswered = TASK.every((s) => answers.has(s.id))
  const allRight = TASK.every((s) => answers.get(s.id) === s.kind)

  const pick = (sentenceId: string, kind: SentenceKind) => {
    const next = new Map(answers)
    next.set(sentenceId, kind)
    setAnswers(next)
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.stmtTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.stmtIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="logic.stmtIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="logic.stmtDef" />
      </div>

      <ul className="sentence-list">
        {WORKED.map((s) => (
          <li key={s.id} className="sentence-row">
            <span className="sentence-text">{t(s.labelKey)}</span>
            <span className={`sentence-badge kind-${s.kind}`}>{t(`logic.kind_${s.kind}`)}</span>
          </li>
        ))}
      </ul>

      <p className="card-note lesson-text">
        <Trans i18nKey="logic.stmtOpen" components={{ b: <strong />, i: <em /> }} />
      </p>
      <Definition i18nKey="logic.stmtOpenDef" />

      <Exercise
        promptKey="logic.stmtTask"
        isCorrect={allRight}
        canCheck={allAnswered}
        answerKey={answerKey}
        solutionKey={solutionKey}
        onReveal={() => setAnswers(new Map(TASK.map((s) => [s.id, s.kind])))}
        hintKey="logic.stmtHint"
      >
        <ul className="sentence-list">
          {TASK.map((s) => (
            <li key={s.id} className="sentence-row">
              <span className="sentence-text">{t(s.labelKey)}</span>
              <div className="pill-row" role="group" aria-label={t('logic.stmtKindAria', { text: t(s.labelKey) })}>
                {KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={answers.get(s.id) === k ? 'pill active' : 'pill'}
                    aria-pressed={answers.get(s.id) === k}
                    onClick={() => pick(s.id, k)}
                  >
                    {t(`logic.kind_${k}`)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Exercise>
    </section>
  )
}
