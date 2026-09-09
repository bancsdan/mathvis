import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  EQUATIONS,
  OR_TOKEN,
  PATTERN_ANSWER,
  PATTERN_IDS,
  PATTERNS,
  type PatternId,
} from '../lib/algebra'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/**
 * Azonosságok az egyenletek megoldásában.
 *
 * The steps are revealed one at a time, each with the name of the move that
 * produced it, so an equation reads as a sequence of decisions rather than a
 * block of algebra that appeared fully formed.
 */
export function AlgSolveCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [eqId, setEqId] = useState('linear')
  const [shown, setShown] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showFactored, setShowFactored] = useState(false)

  const eq = EQUATIONS.find((e) => e.id === eqId) ?? EQUATIONS[0]
  const steps = eq.steps.slice(0, shown)
  const answerKey = PATTERNS.map((p) => answers[p.id] ?? '').join('|')

  // The library never holds a Hungarian word; the one place a step needs one,
  // it carries a token and the translated word goes in here.
  const withWords = (tex: string) => tex.replace(OR_TOKEN, t('alg.orWord'))

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.solveTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.solveIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="alg.solveDef" />
        <p className="card-note">
          <Trans i18nKey="alg.solveIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="alg.solveZeroRule" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('alg.solvePickAria')}>
        {EQUATIONS.map((e) => (
          <button
            key={e.id}
            type="button"
            className={eqId === e.id ? 'pill active' : 'pill'}
            aria-pressed={eqId === e.id}
            onClick={() => {
              setEqId(e.id)
              setShown(1)
            }}
          >
            {t(`alg.solveEq_${e.id}`)}
          </button>
        ))}
      </div>

      <ol className="alg-steps">
        {steps.map((step, i) => (
          <li key={i} className="alg-step">
            <Tex block tex={withWords(step.tex)} />
            <span className="alg-step-note">{t(step.noteKey)}</span>
          </li>
        ))}
      </ol>

      <div className="pill-row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={shown >= eq.steps.length}
          onClick={() => setShown(Math.min(shown + 1, eq.steps.length))}
        >
          {t('alg.solveNext')}
        </button>
        <button type="button" className="btn" onClick={() => setShown(1)}>
          {t('alg.solveReset')}
        </button>
      </div>

      <Exercise
        promptKey="alg.solveTask"
        isCorrect={answerKey === PATTERN_ANSWER}
        canCheck={PATTERNS.every((p) => answers[p.id])}
        answerKey={answerKey}
        solutionKey={PATTERN_ANSWER}
        onReveal={() => {
          setAnswers(Object.fromEntries(PATTERNS.map((p) => [p.id, p.answer])))
          setShowFactored(true)
        }}
        hintKey="alg.solveHint"
      >
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>{t('alg.solveThExpr')}</th>
                <th>{t('alg.solveThPattern')}</th>
                {showFactored && <th>{t('alg.solveThFactored')}</th>}
              </tr>
            </thead>
            <tbody>
              {PATTERNS.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Tex tex={p.tex} />
                  </td>
                  <td>
                    <select
                      value={answers[p.id] ?? ''}
                      aria-label={t('alg.solveThPattern')}
                      onChange={(e) => setAnswers({ ...answers, [p.id]: e.target.value })}
                    >
                      <option value="">{t('alg.patternPick')}</option>
                      {PATTERN_IDS.map((pid: PatternId) => (
                        <option key={pid} value={pid}>
                          {t(`alg.pattern_${pid}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  {showFactored && (
                    <td>{p.factoredTex === '' ? t('alg.patternNoneShort') : <Tex tex={p.factoredTex} />}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn" onClick={() => setShowFactored(!showFactored)}>
          {showFactored ? t('alg.solveHideFactored') : t('alg.solveShowFactored')}
        </button>
      </Exercise>
    </section>
  )
}
