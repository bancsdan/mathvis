import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal } from '../lib/numbers'
import {
  applyChanges,
  CHANGE_ANSWER,
  groupThousands,
  multiplier,
  percentRate,
  plainNumber,
  POINT_EXAMPLE,
  round,
  totalChange,
} from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** A rate as it is spoken: with its sign in front, minus typographic. */
const signed = (rate: number): string => (rate < 0 ? `−${Math.abs(rate)}%` : `+${rate}%`)

/**
 * Százalékos változás és a százalékpont. Two changes are two multiplications,
 * and multiplications do not add up: the table keeps the multipliers next to
 * the prices so +20% then −20% visibly lands below where it started.
 */
export function PropChangeCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [start, setStart] = useState(50000)
  const [first, setFirst] = useState(20)
  const [second, setSecond] = useState(-20)
  const [from, setFrom] = useState(POINT_EXAMPLE.from)
  const [to, setTo] = useState(POINT_EXAMPLE.to)
  const [answer, setAnswer] = useState('')

  const rows = applyChanges(start, [first, second])
  const total = totalChange([first, second])
  const naive = first + second
  const product = round(multiplier(first) * multiplier(second), 4)
  const number = (v: number) => formatDecimal(String(v), sep, true)

  const diff = round(to - from, 2)
  const pct = from === 0 ? 0 : percentRate(diff, from)
  const ratio = from === 0 ? 0 : percentRate(to, from)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.changeIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="prop.changeDef" />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('prop.changePickStart')} <strong>{groupThousands(start)}</strong>
          </span>
          <input
            type="range"
            min={10000}
            max={100000}
            step={1000}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('prop.changePick1')} <strong>{signed(first)}</strong>
          </span>
          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={first}
            onChange={(e) => setFirst(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('prop.changePick2')} <strong>{signed(second)}</strong>
          </span>
          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={second}
            onChange={(e) => setSecond(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('prop.changeThChange')}</th>
              <th>{t('prop.changeThFactor')}</th>
              <th>{t('prop.changeThPrice')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('prop.changeRowStart')}</td>
              <td>—</td>
              <td>{groupThousands(start)}</td>
            </tr>
            {rows.map((row, i) => (
              <tr key={i} className={i === rows.length - 1 ? 'prop-current' : undefined}>
                <td>{t(i === 0 ? 'prop.changeRow1' : 'prop.changeRow2')}</td>
                <td>
                  <Tex tex={number(row.factor)} />
                </td>
                <td>{groupThousands(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Tex block tex={`${number(multiplier(first))} \\cdot ${number(multiplier(second))} = ${number(product)}`} />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="prop.changeTotal"
          values={{ total: plainNumber(total, sep), naive: plainNumber(naive, sep) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="prop.changeRule" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('prop.changePointsTitle')}</p>
      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('prop.changePickFrom')} <strong>{`${from}%`}</strong>
          </span>
          <input type="range" min={1} max={10} step={1} value={from} onChange={(e) => setFrom(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('prop.changePickTo')} <strong>{`${to}%`}</strong>
          </span>
          <input type="range" min={0} max={10} step={1} value={to} onChange={(e) => setTo(Number(e.target.value))} />
        </label>
      </div>

      <p className="card-note lesson-text">
        <Trans
          i18nKey="prop.changePoints"
          values={{ diff: plainNumber(diff, sep), pct: plainNumber(pct, sep), ratio: plainNumber(ratio, sep) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="prop.changeTask"
        isCorrect={Number(answer) === CHANGE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(CHANGE_ANSWER)}
        onReveal={() => setAnswer(String(CHANGE_ANSWER))}
        hintKey="prop.changeHint"
      >
        <label className="field">
          <span className="field-label">{t('prop.changeAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
