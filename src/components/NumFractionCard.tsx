import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  DECIMAL_PRESETS,
  decimalExpansion,
  expansionToTex,
  FRACTION_ANSWER,
  isTerminating,
  reduce,
  repeatingToFraction,
  type DecimalPreset,
} from '../lib/numbers'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const NUMERATORS = Array.from({ length: 30 }, (_, i) => i + 1)
const DENOMINATORS = Array.from({ length: 29 }, (_, i) => i + 2)
const SHOWN_STEPS = 12

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
 * Tizedes tört és közönséges tört: the long division that turns a fraction into
 * a decimal, and the subtraction trick that turns it back.
 */
export function NumFractionCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [p, setP] = useState(1)
  const [q, setQ] = useState(6)
  const [presetId, setPresetId] = useState('p36')
  const [answerP, setAnswerP] = useState('')
  const [answerQ, setAnswerQ] = useState('')

  const expansion = decimalExpansion(p, q)
  const stops = isTerminating(p, q)
  const steps = expansion.steps.slice(0, SHOWN_STEPS)
  const preset = DECIMAL_PRESETS.find((d) => d.id === presetId) ?? DECIMAL_PRESETS[0]

  const given = reduce(Number(answerP), Number(answerQ))
  const answerKey = `${answerP}/${answerQ}`
  const solutionKey = `${FRACTION_ANSWER.p}/${FRACTION_ANSWER.q}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.fracTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.fracIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="num.fracIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('num.fracPickP')}</span>
          <select value={p} onChange={(e) => setP(Number(e.target.value))}>
            {NUMERATORS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('num.fracPickQ')}</span>
          <select value={q} onChange={(e) => setQ(Number(e.target.value))}>
            {DENOMINATORS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Tex block tex={`\\frac{${p}}{${q}} = ${expansionToTex(expansion, sep)}`} />
      <p className="pill-row">
        <span className="num-badge">{stops ? t('num.fracBadgeStop') : t('num.fracBadgeRepeat')}</span>
      </p>

      <p className="mini-title">{t('num.fracStepsTitle')}</p>
      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('num.fracThStep')}</th>
              <th>{t('num.fracThDigit')}</th>
              <th>{t('num.fracThRemainder')}</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, i) => (
              <tr
                key={i}
                className={expansion.repeatStart !== null && i >= expansion.repeatStart ? 'row-ok' : undefined}
              >
                <td>{i + 1}.</td>
                <td>{step.digit}</td>
                <td>{step.remainder}</td>
              </tr>
            ))}
            {steps.length < expansion.steps.length && (
              <tr className="ellipsis-row">
                <td>…</td>
                <td />
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="card-note lesson-text">
        <Trans i18nKey="num.fracRemainderNote" values={{ q }} components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="num.fracStopRule" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('num.fracBackTitle')}</p>
      <p className="card-note lesson-text">{t('num.fracBackIntro')}</p>
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
      <p className="card-note lesson-text">
        <Trans i18nKey="num.fracBackNote" components={{ b: <strong />, i: <em /> }} />
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
