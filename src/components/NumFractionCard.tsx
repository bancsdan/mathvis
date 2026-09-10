import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  DECIMAL_PRESETS,
  FRACTION_ANSWER,
  reduce,
  repeatingToFraction,
  type DecimalPreset,
} from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** A decimal written out: whole part, the digits before the period, the period. */
const decimalTex = (whole: string, before: string, repeating: string, sep: string): string => {
  const head = String(Number(whole))
  if (before === '' && repeating === '') return head
  return `${head}{${sep}}${before}${repeating === '' ? '' : `\\overline{${repeating}}`}`
}

/**
 * The `10x − x` lines that turn a decimal back into a fraction.
 *
 * Multiplying by a power of ten only moves the point, so after two shifts the
 * two numbers have the very same tail — and subtracting wipes the tail out.
 */
function backSteps(d: DecimalPreset, sep: string): string[] {
  const f = repeatingToFraction(d.intPart, d.nonRepeating, d.repeating)
  const lines = [`x = ${decimalTex(d.intPart, d.nonRepeating, d.repeating, sep)}`]
  if (d.repeating === '') {
    lines.push(`${f.mult2}x = ${decimalTex(d.intPart + d.nonRepeating, '', '', sep)}`)
  } else {
    if (d.nonRepeating !== '') {
      lines.push(`${f.mult1}x = ${decimalTex(d.intPart + d.nonRepeating, '', d.repeating, sep)}`)
    }
    lines.push(`${f.mult2}x = ${decimalTex(d.intPart + d.nonRepeating + d.repeating, '', d.repeating, sep)}`)
    lines.push(`${f.mult2}x - ${f.mult1 === 1 ? '' : f.mult1}x = ${f.p}`)
    lines.push(`${f.diff}x = ${f.p}`)
  }
  lines.push(`x = \\frac{${f.p}}{${f.q}} = \\frac{${f.reducedP}}{${f.reducedQ}}`)
  return lines
}

/**
 * Hogyan lesz 0,2727…-ből tört: the subtraction trick, step by step, for any
 * of the decimals on the pills.
 */
export function NumFractionCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState('p27')
  const [answerP, setAnswerP] = useState('')
  const [answerQ, setAnswerQ] = useState('')

  const preset = DECIMAL_PRESETS.find((d) => d.id === presetId) ?? DECIMAL_PRESETS[0]

  const given = reduce(Number(answerP), Number(answerQ))
  const answerKey = `${answerP}/${answerQ}`
  const solutionKey = `${FRACTION_ANSWER.p}/${FRACTION_ANSWER.q}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.fracIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="num.fracDef" />
      </div>

      <div className="pill-row" role="group" aria-label={t('num.fracPickDecimalAria')}>
        {DECIMAL_PRESETS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={presetId === d.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === d.id}
            onClick={() => setPresetId(d.id)}
          >
            <Tex tex={decimalTex(d.intPart, d.nonRepeating, d.repeating, sep)} />
          </button>
        ))}
      </div>
      {backSteps(preset, sep).map((tex) => (
        <Tex key={tex} block tex={tex} />
      ))}

      <p className="lin-result lesson-text">
        <Trans i18nKey="num.fracResult" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="num.fracTask"
        isCorrect={given.p === FRACTION_ANSWER.p && given.q === FRACTION_ANSWER.q}
        canCheck={answerP.trim() !== '' && Number(answerQ) !== 0 && answerQ.trim() !== ''}
        answerKey={answerKey}
        solutionKey={solutionKey}
        onReveal={() => {
          setAnswerP(String(FRACTION_ANSWER.p))
          setAnswerQ(String(FRACTION_ANSWER.q))
        }}
        hintKey="num.fracHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('num.fracAnswerP')}</span>
            <input
              className="answer-input"
              type="number"
              value={answerP}
              onChange={(e) => setAnswerP(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('num.fracAnswerQ')}</span>
            <input
              className="answer-input"
              type="number"
              value={answerQ}
              onChange={(e) => setAnswerQ(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
