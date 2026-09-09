import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { OR_TOKEN } from '../lib/algebra'
import { COMPLETE_ANSWER, COMPLETE_PRESETS, completeSolveSteps, quadTex } from '../lib/quadratic'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** A number with the typographic minus prose uses, not the hyphen. */
const signed = (v: number): string => (v < 0 ? `−${Math.abs(v)}` : String(v))

/**
 * Megoldás teljes négyzetté kiegészítéssel.
 *
 * Once the square stands alone, one number decides everything: the right side.
 * Positive gives two roots, zero gives one, negative gives none — and the
 * sliders make all three easy to reach, so the three cases arrive as
 * observations rather than as a list to learn.
 */
export function QuadCompleteCard({ id }: { id: string }) {
  const { t } = useTranslation()
  // The slider holds half of p, so p stays even and the shift stays whole.
  const [halfP, setHalfP] = useState(3)
  const [q, setQ] = useState(5)
  const [ansA, setAnsA] = useState('')
  const [ansB, setAnsB] = useState('')

  const p = 2 * halfP
  const k = halfP * halfP - q
  const steps = completeSolveSteps(p, q)
  const [solA, solB] = COMPLETE_ANSWER.split('|')

  const typed = [ansA, ansB].map(Number)
  const answered = ansA.trim() !== '' && ansB.trim() !== '' && typed.every(Number.isFinite)
  const answerKey = answered ? [...typed].sort((a, b) => a - b).join('|') : `${ansA}|${ansB}`

  // The library never holds a Hungarian word; the steps that need one carry a
  // token and the translated word goes in here.
  const withWords = (tex: string) => tex.replaceAll(OR_TOKEN, t('quad.orWord'))

  const resultKey = k > 0 ? 'quad.completeResult_two' : k === 0 ? 'quad.completeResult_one' : 'quad.completeResult_none'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.completeTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.completeIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="quad.completeRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="quad.completeIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.completeEqAria')}>
        {COMPLETE_PRESETS.map((preset) => {
          const active = preset.p === p && preset.q === q
          return (
            <button
              key={`${preset.p}|${preset.q}`}
              type="button"
              className={active ? 'pill active' : 'pill'}
              aria-pressed={active}
              onClick={() => {
                setHalfP(preset.p / 2)
                setQ(preset.q)
              }}
            >
              <Tex tex={`${quadTex({ a: 1, b: preset.p, c: preset.q })} = 0`} />
            </button>
          )
        })}
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('quad.completePickP')} <strong>{signed(p)}</strong>
          </span>
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={halfP}
            onChange={(e) => setHalfP(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('quad.completePickQ')} <strong>{signed(q)}</strong>
          </span>
          <input type="range" min={-12} max={12} step={1} value={q} onChange={(e) => setQ(Number(e.target.value))} />
        </label>
      </div>

      <ol className="lin-steps">
        {steps.map((step, i) => (
          <li key={i} className={step.noteKey === 'quad.stepNoRoot' ? 'lin-step lin-flip' : 'lin-step'}>
            <Tex block tex={withWords(step.tex)} />
            <span className="lin-step-note">{t(step.noteKey)}</span>
          </li>
        ))}
      </ol>

      <p className="lin-result lesson-text">
        <Trans i18nKey={resultKey} values={{ k: signed(k) }} components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="quad.completeTask"
        isCorrect={answerKey === COMPLETE_ANSWER}
        canCheck={answered}
        answerKey={answerKey}
        solutionKey={COMPLETE_ANSWER}
        onReveal={() => {
          setAnsA(solA)
          setAnsB(solB)
        }}
        hintKey="quad.completeHint"
      >
        <Tex block tex={`${quadTex({ a: 1, b: -4, c: -12 })} = 0`} />
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('quad.completeAnswer1')}</span>
            <input className="answer-input" type="number" value={ansA} onChange={(e) => setAnsA(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('quad.completeAnswer2')}</span>
            <input className="answer-input" type="number" value={ansB} onChange={(e) => setAnsB(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
