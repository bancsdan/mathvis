import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  groupThousands,
  PERCENT_ANSWER,
  percentBase,
  percentRate,
  percentValue,
  plainNumber,
} from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

type Unknown = 'value' | 'rate' | 'base'

const MODES: readonly Unknown[] = ['value', 'rate', 'base']
const BAR_HEIGHT = 54

/**
 * Százalékalap, százalékérték, százalékláb. The same three numbers stay on
 * screen whichever one is missing, so the reader sees that the three question
 * types are one relationship asked from three sides.
 */
export function PropPercentCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [mode, setMode] = useState<Unknown>('value')
  const [base, setBase] = useState(15000)
  const [rate, setRate] = useState(20)
  const [value, setValue] = useState(3000)
  const [answer, setAnswer] = useState('')

  const shownBase = mode === 'base' ? percentBase(value, rate) : base
  const shownRate = mode === 'rate' ? percentRate(value, base) : rate
  const shownValue = mode === 'value' ? percentValue(base, rate) : value

  const tex =
    mode === 'value'
      ? `${base} \\cdot \\frac{${rate}}{100} = ${shownValue}`
      : mode === 'rate'
        ? `\\frac{${value}}{${base}} \\cdot 100 = ${shownRate}`
        : `${value} : \\frac{${rate}}{100} = ${shownBase}`

  const part = Math.max(0, Math.min(100, shownRate)) / 100
  const barWidth = Math.max(width - 4, 10)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.percentTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.percentIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition
          i18nKey={['prop.percentDef1', 'prop.percentDef2', 'prop.percentDef3', 'prop.percentDef4']}
        />
        <p className="card-note">
          <Trans i18nKey="prop.percentIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('prop.percentModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`prop.unknown_${m}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        {mode !== 'base' && (
          <label className="field">
            <span className="field-label">{t('prop.lblBase')}</span>
            <input
              className="answer-input"
              type="number"
              value={base}
              onChange={(e) => setBase(Number(e.target.value))}
            />
          </label>
        )}
        {mode !== 'rate' && (
          <label className="field">
            <span className="field-label">{t('prop.lblRate')}</span>
            <input
              className="answer-input"
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </label>
        )}
        {mode !== 'value' && (
          <label className="field">
            <span className="field-label">{t('prop.lblValue')}</span>
            <input
              className="answer-input"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </label>
        )}
      </div>

      <div className="stats">
        <div className="stat prop-constant">
          <span className="stat-label">{t(`prop.percentResult_${mode}`)}</span>
          <span className="stat-value">
            {mode === 'rate'
              ? `${plainNumber(shownRate, sep)}%`
              : `${groupThousands(mode === 'value' ? shownValue : shownBase)} ${t('prop.ft')}`}
          </span>
        </div>
      </div>

      <div ref={ref} className="chart-box">
        {width > 0 && (
          <svg
            className="prop-bar"
            width={barWidth}
            height={BAR_HEIGHT}
            role="img"
            aria-label={t('prop.percentBarAria')}
          >
            <rect x={0} y={16} width={barWidth} height={24} className="prop-bar-base" />
            <rect x={0} y={16} width={barWidth * part} height={24} className="prop-bar-value" />
            <text x={barWidth} y={11} textAnchor="end" className="prop-bar-label">
              {`${t('prop.percentBarBase')}: ${groupThousands(shownBase)} ${t('prop.ft')}`}
            </text>
            <text x={2} y={52} textAnchor="start" className="prop-bar-label">
              {`${t('prop.percentBarValue')}: ${groupThousands(shownValue)} ${t('prop.ft')} (${plainNumber(shownRate, sep)}%)`}
            </text>
          </svg>
        )}
      </div>

      <Tex block tex={tex} />

      <p className="card-note lesson-text">
        <Trans
          i18nKey="prop.percentSentence"
          values={{
            base: groupThousands(shownBase),
            rate: plainNumber(shownRate, sep),
            value: groupThousands(shownValue),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="prop.percentTask"
        isCorrect={Number(answer) === PERCENT_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(PERCENT_ANSWER)}
        onReveal={() => setAnswer(String(PERCENT_ANSWER))}
        hintKey="prop.percentHint"
      >
        <label className="field">
          <span className="field-label">{t('prop.percentAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
