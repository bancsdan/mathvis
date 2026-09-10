import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { circulantEdges, regularGraphPossible } from '../lib/combinatorics'
import { Exercise } from './Exercise'
import { GraphDiagram } from './GraphDiagram'
import { Tex } from './Tex'

const HEADS = [3, 4, 5, 6, 7, 8]
const DEGREES = [1, 2, 3, 4, 5, 6, 7]

/** The exercise: nine people each knowing three others would need an odd degree sum. */
const TASK_ANSWER = regularGraphPossible(9, 3).possible ? 'yes' : 'no'
const CHOICES = ['yes', 'no'] as const

export function CombiParityCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [n, setN] = useState(5)
  const [d, setD] = useState(3)
  const [answer, setAnswer] = useState<string | null>(null)

  const verdict = regularGraphPossible(n, d)
  const edges = circulantEdges(n, d)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.q6')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.parityIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('combi.parityPickN')}</span>
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {HEADS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('combi.parityPickD')}</span>
          <select value={d} onChange={(e) => setD(Number(e.target.value))}>
            {DEGREES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="card-note lesson-text">{t('combi.parityQuestion', { n, d })}</p>

      {verdict.possible ? (
        <>
          <GraphDiagram n={n} edges={edges} showDegrees ariaLabel={t('combi.parityAria', { n, d })} />
          <Tex block tex={`\\frac{${n} \\cdot ${d}}{2} = ${(n * d) / 2}`} />
        </>
      ) : (
        <Tex block tex={`${n} \\cdot ${d} = ${n * d}`} />
      )}

      <p className="lin-result" role="status" aria-live="polite">
        {t(`combi.parityReason_${verdict.reason}`, { n, d, sum: n * d, edges: (n * d) / 2 })}
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.parityNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="combi.parityTask"
        isCorrect={answer === TASK_ANSWER}
        canCheck={answer !== null}
        answerKey={answer ?? ''}
        solutionKey={TASK_ANSWER}
        onReveal={() => setAnswer(TASK_ANSWER)}
        hintKey="combi.parityHint"
      >
        <div className="pill-row" role="group" aria-label={t('combi.parityChoiceAria')}>
          {CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              className={answer === c ? 'pill active' : 'pill'}
              aria-pressed={answer === c}
              onClick={() => setAnswer(c)}
            >
              {t(c === 'yes' ? 'combi.parityYes' : 'combi.parityNo')}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
