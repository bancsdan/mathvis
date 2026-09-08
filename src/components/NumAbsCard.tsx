import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  ABS_ANSWER,
  absValue,
  distance,
  formatDecimal,
  fractionOf,
  opposite,
  reciprocal,
  reduce,
} from '../lib/numbers'
import { Exercise } from './Exercise'
import { NumberLine } from './NumberLine'
import { Tex } from './Tex'

const MIN = -5
const MAX = 5

/** A value as a fraction when there is a tidy one, otherwise as a decimal. */
function fracTex(v: number, sep: string): string {
  if (Number.isInteger(v)) return String(v)
  const f = fractionOf(v)
  if (!f) return formatDecimal(v.toFixed(4), sep, true)
  return f.p < 0 ? `-\\frac{${-f.p}}{${f.q}}` : `\\frac{${f.p}}{${f.q}}`
}

/**
 * Abszolút érték, ellentett, reciprok: three things that can be done to a
 * single number, all three visible at once on the same line.
 */
export function NumAbsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [x, setX] = useState(2.5)
  const [answerP, setAnswerP] = useState('')
  const [answerQ, setAnswerQ] = useState('')

  const opp = opposite(x)
  const rec = reciprocal(x)
  const plain = (v: number) => formatDecimal(String(v), sep, false)

  const given = reduce(Number(answerP), Number(answerQ))
  const answerKey = `${answerP}/${answerQ}`

  const rows: Array<[string, string, string]> = [
    ['num.absRowValue', plain(x), fracTex(x, sep)],
    ['num.absRowOpposite', plain(opp), fracTex(opp, sep)],
    ['num.absRowAbs', plain(absValue(x)), fracTex(absValue(x), sep)],
    [
      'num.absRowReciprocal',
      rec === null ? t('num.absNoReciprocal') : plain(Number(rec.toFixed(4))),
      rec === null ? '' : fracTex(rec, sep),
    ],
  ]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.absTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.absIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="num.absIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            x = <strong>{plain(x)}</strong>
          </span>
          <input
            type="range"
            min={-4}
            max={4}
            step={0.25}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
          />
        </label>
      </div>

      <NumberLine
        min={MIN}
        max={MAX}
        height={150}
        tickText={(v) => plain(v)}
        bars={[{ from: 0, to: x, color: 'var(--accent-select)', label: `|x| = ${plain(absValue(x))}` }]}
        points={[
          { id: 'x', value: x, label: `x = ${plain(x)}`, color: 'var(--series-1)' },
          { id: 'opp', value: opp, label: `−x = ${plain(opp)}`, color: 'var(--series-2)' },
          ...(rec === null
            ? []
            : [
                {
                  id: 'rec',
                  value: rec,
                  label: `1/x = ${plain(Number(rec.toFixed(2)))}`,
                  color: 'var(--series-3)',
                },
              ]),
        ]}
        ariaLabel={t('num.absAria', { x: plain(x), opposite: plain(opp) })}
      />

      <div className="legend">
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--series-1)' }} />
          {t('num.absLegendX')}
        </span>
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--series-2)' }} />
          {t('num.absLegendOpp')}
        </span>
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--series-3)' }} />
          {t('num.absLegendRec')}
        </span>
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--accent-select)' }} />
          {t('num.absLegendAbs')}
        </span>
      </div>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('num.absThName')}</th>
              <th>{t('num.absThValue')}</th>
              <th>{t('num.absThFraction')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, value, tex]) => (
              <tr key={key}>
                <td>{t(key)}</td>
                <td>{value}</td>
                <td>{tex === '' ? '—' : <Tex tex={tex} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="sentence-list">
        <li className="sentence-row">
          <Tex tex="x + (-x) = 0" />
          <span className="sentence-text">{t('num.absFact1')}</span>
        </li>
        <li className="sentence-row">
          <Tex tex="x \cdot \frac{1}{x} = 1" />
          <span className="sentence-text">{t('num.absFact2')}</span>
        </li>
        <li className="sentence-row">
          <Tex tex="|x| = |-x| \ge 0" />
          <span className="sentence-text">{t('num.absFact3')}</span>
        </li>
        <li className="sentence-row">
          <Tex tex="\frac{1}{\frac{p}{q}} = \frac{q}{p}" />
          <span className="sentence-text">{t('num.absFact4')}</span>
        </li>
        <li className="sentence-row">
          <Tex tex={`|3 - (-2)| = |5| = ${distance(3, -2)}`} />
          <span className="sentence-text">{t('num.absFact5')}</span>
        </li>
      </ul>

      <Exercise
        promptKey="num.absTask"
        isCorrect={given.p === ABS_ANSWER.p && given.q === ABS_ANSWER.q}
        canCheck={answerP.trim() !== '' && answerQ.trim() !== '' && Number(answerQ) !== 0}
        answerKey={answerKey}
        solutionKey={`${ABS_ANSWER.p}/${ABS_ANSWER.q}`}
        onReveal={() => {
          setAnswerP(String(ABS_ANSWER.p))
          setAnswerQ(String(ABS_ANSWER.q))
        }}
        hintKey="num.absHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('num.absAnswerP')}</span>
            <input
              className="answer-input"
              type="number"
              value={answerP}
              onChange={(e) => setAnswerP(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('num.absAnswerQ')}</span>
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
