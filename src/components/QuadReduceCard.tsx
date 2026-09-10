import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { REDUCE_ANSWER, REDUCE_PRESETS, reduceSteps } from '../lib/quadratic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/**
 * Másodfokúra visszavezethető egyenletek.
 *
 * Naming a repeated part turns a fourth-degree equation into one we can already
 * solve. The step-through is there for the way back, which is where the marks
 * are lost: a u that came out negative has no x behind it when u was x², and
 * that line is tinted rather than quietly skipped.
 */
export function QuadReduceCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [presetId, setPresetId] = useState('biquad')
  const [shown, setShown] = useState(1)
  const [answer, setAnswer] = useState('')

  const preset = REDUCE_PRESETS.find((p) => p.id === presetId) ?? REDUCE_PRESETS[0]
  const steps = reduceSteps(preset)
  const visible = steps.slice(0, shown)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.q6')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.reduceIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="quad.reduceDef" />
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.reduceEqAria')}>
        {REDUCE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => {
              setPresetId(p.id)
              setShown(1)
            }}
          >
            <Tex tex={p.givenTex} />
          </button>
        ))}
      </div>

      <ol className="lin-steps">
        {visible.map((step, i) => (
          <li key={i} className={step.noteKey === 'quad.stepReject' ? 'lin-step lin-flip' : 'lin-step'}>
            <Tex block tex={step.tex} />
            <span className="lin-step-note">{t(step.noteKey)}</span>
          </li>
        ))}
      </ol>

      <div className="pill-row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={shown >= steps.length}
          onClick={() => setShown(Math.min(shown + 1, steps.length))}
        >
          {t('quad.reduceNext')}
        </button>
        <button type="button" className="btn" onClick={() => setShown(1)}>
          {t('quad.reduceReset')}
        </button>
      </div>

      {/* The verdict is the last step's reward, not a spoiler above the first. */}
      {shown >= steps.length && (
        <>
          <p className="lin-result lesson-text">
            <Trans
              i18nKey="quad.reduceResult"
              values={{ n: preset.xRoots.length }}
              components={{ b: <strong />, i: <em /> }}
            />
          </p>
          {preset.rejectedU.length > 0 && <p className="card-note lesson-text">{t('quad.reduceRejectNote')}</p>}
        </>
      )}

      <Exercise
        promptKey="quad.reduceTask"
        isCorrect={Number(answer) === REDUCE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(REDUCE_ANSWER)}
        onReveal={() => setAnswer(String(REDUCE_ANSWER))}
        hintKey="quad.reduceHint"
      >
        <Tex block tex="x^4 - 10x^2 + 9 = 0" />
        <label className="field">
          <span className="field-label">{t('quad.reduceAnswerLabel')}</span>
          <input
            className="answer-input"
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
