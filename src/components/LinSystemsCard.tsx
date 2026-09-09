import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  additionSteps,
  fracPlain,
  solveSystem,
  substitutionSteps,
  SYSTEM_ANSWER,
  SYSTEM_PRESETS,
  SYSTEM_TASK,
  systemTex,
} from '../lib/linear'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const METHODS = ['Sub', 'Add'] as const

/**
 * Egyenletrendszerek. Two methods, one idea: get rid of an unknown. Stepping
 * through them side by side is the argument that they are the same journey,
 * and the last step is the one that makes an answer an answer — the check.
 */
export function LinSystemsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState('sum')
  const [method, setMethod] = useState<'Sub' | 'Add'>('Sub')
  const [shown, setShown] = useState(1)
  const [ansX, setAnsX] = useState('')
  const [ansY, setAnsY] = useState('')

  const preset = SYSTEM_PRESETS.find((p) => p.id === presetId) ?? SYSTEM_PRESETS[0]
  const steps = method === 'Sub' ? substitutionSteps(preset.s) : additionSteps(preset.s)
  const result = solveSystem(preset.s)
  const answerKey = `${ansX}|${ansY}`
  const [solX, solY] = SYSTEM_ANSWER.split('|')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.systemsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.systemsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="lin.systemsDef" />
        <p className="card-note">
          <Trans i18nKey="lin.systemsIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('lin.systemsEqAria')}>
        {SYSTEM_PRESETS.map((p) => (
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
            {t(`lin.systemsEq_${p.id}`)}
          </button>
        ))}
      </div>

      <div className="pill-row" role="group" aria-label={t('lin.systemsMethodAria')}>
        {METHODS.map((m) => (
          <button
            key={m}
            type="button"
            className={method === m ? 'pill active' : 'pill'}
            aria-pressed={method === m}
            onClick={() => {
              setMethod(m)
              setShown(1)
            }}
          >
            {t(`lin.method${m}`)}
          </button>
        ))}
      </div>

      {presetId === 'shop' && (
        <p className="card-note lesson-text">
          <Trans i18nKey="lin.systemsShopText" components={{ b: <strong />, i: <em /> }} />
        </p>
      )}

      {systemTex(preset.s).map((row) => (
        <Tex key={row} block tex={row} />
      ))}

      <ol className="lin-steps">
        {steps.slice(0, shown).map((step, i) => (
          <li key={i} className="lin-step">
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
          {t('lin.systemsNext')}
        </button>
        <button type="button" className="btn" onClick={() => setShown(1)}>
          {t('lin.systemsReset')}
        </button>
      </div>

      {shown >= steps.length && result.kind === 'one' && (
        <p className="lin-result lesson-text">
          <Trans
            i18nKey="lin.systemsResult"
            values={{ x: fracPlain(result.x, sep), y: fracPlain(result.y, sep) }}
            components={{ b: <strong />, i: <em /> }}
          />
        </p>
      )}

      <Exercise
        promptKey="lin.systemsTask"
        isCorrect={answerKey === SYSTEM_ANSWER}
        canCheck={ansX.trim() !== '' && ansY.trim() !== ''}
        answerKey={answerKey}
        solutionKey={SYSTEM_ANSWER}
        onReveal={() => {
          setAnsX(solX)
          setAnsY(solY)
        }}
        hintKey="lin.systemsHint"
      >
        {systemTex(SYSTEM_TASK).map((row) => (
          <Tex key={row} block tex={row} />
        ))}
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('lin.systemsAnswerX')}</span>
            <input
              className="answer-input"
              type="number"
              value={ansX}
              onChange={(e) => setAnsX(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('lin.systemsAnswerY')}</span>
            <input
              className="answer-input"
              type="number"
              value={ansY}
              onChange={(e) => setAnsY(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
