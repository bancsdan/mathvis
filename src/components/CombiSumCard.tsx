import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { WRONG_SOLUTION, WRONG_STEP } from '../lib/combinatorics'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

type Mode = 'or' | 'and'

const MODES: readonly Mode[] = ['or', 'and']

/**
 * "Or" is two rows of dots you count together, "and" is a grid whose rows and
 * columns are the two choices — the picture the multiplication rule comes from.
 */
function DotGrid({ a, b, mode, ariaLabel }: { a: number; b: number; mode: Mode; ariaLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const step = 26
  const padX = 14
  const rows = mode === 'or' ? 2 : b
  const height = rows * step + 20

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {mode === 'or'
            ? [
                ...Array.from({ length: a }, (_, i) => (
                  <circle key={`a${i}`} cx={padX + i * step} cy={22} r={8} fill="var(--series-1)" />
                )),
                ...Array.from({ length: b }, (_, i) => (
                  <circle key={`b${i}`} cx={padX + i * step} cy={22 + step} r={8} fill="var(--series-2)" />
                )),
              ]
            : Array.from({ length: b }, (_, row) =>
                Array.from({ length: a }, (_, colIdx) => (
                  <circle
                    key={`${row}-${colIdx}`}
                    cx={padX + colIdx * step}
                    cy={22 + row * step}
                    r={8}
                    fill="var(--accent-select)"
                  />
                )),
              )}
        </svg>
      )}
    </div>
  )
}

export function CombiSumCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [a, setA] = useState(4)
  const [b, setB] = useState(3)
  const [mode, setMode] = useState<Mode>('or')

  const [step, setStep] = useState<number | null>(null)

  const total = mode === 'or' ? a + b : a * b

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.sumIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('combi.sumGroupA')} <strong>{a}</strong>
          </span>
          <input type="range" min={1} max={6} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('combi.sumGroupB')} <strong>{b}</strong>
          </span>
          <input type="range" min={1} max={6} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} />
        </label>
      </div>
      <div className="pill-row" role="group" aria-label={t('combi.sumModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`combi.sumMode_${m}`)}
          </button>
        ))}
      </div>

      <DotGrid a={a} b={b} mode={mode} ariaLabel={t(`combi.sumAria_${mode}`, { a, b, total })} />

      <Tex block tex={mode === 'or' ? `${a} + ${b} = ${total}` : `${a} \\cdot ${b} = ${total}`} />
      <p className="lin-result">{t(`combi.sumRead_${mode}`, { a, b, total })}</p>

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.sumRule" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('combi.wrongTitle')}</p>
      <p className="card-note lesson-text">{t(WRONG_SOLUTION.problemKey)}</p>

      <Exercise
        promptKey="combi.wrongTask"
        isCorrect={step === WRONG_STEP}
        canCheck={step !== null}
        answerKey={String(step ?? '')}
        solutionKey={String(WRONG_STEP)}
        onReveal={() => setStep(WRONG_STEP)}
        hintKey="combi.wrongHint"
      >
        <ul className="step-list">
          {WRONG_SOLUTION.stepKeys.map((key, i) => (
            <li key={key}>
              <button
                type="button"
                className={step === i ? 'step-row' : 'step-btn'}
                aria-pressed={step === i}
                onClick={() => setStep(i)}
              >
                <span>{i + 1}.</span>
                <span>{t(key)}</span>
              </button>
            </li>
          ))}
        </ul>
        {step === WRONG_STEP && (
          <p className="card-note">
            <Trans
              i18nKey={WRONG_SOLUTION.fixKey}
              values={{ total: WRONG_SOLUTION.answer }}
              components={{ b: <strong />, i: <em /> }}
            />
          </p>
        )}
      </Exercise>
    </section>
  )
}
