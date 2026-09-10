import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal } from '../lib/numbers'
import { compound, groupThousands, INTEREST_ANSWER, multiplier, simpleInterest } from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/**
 * Kamatos kamat. Interest on the interest is a multiplication repeated, so the
 * two curves cannot stay together: the table's last column is the gap between
 * them, and it grows every year.
 */
export function PropInterestCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [amount, setAmount] = useState(200000)
  const [rate, setRate] = useState(5)
  const [years, setYears] = useState(5)
  const [answer, setAnswer] = useState('')

  const withInterest = compound(amount, rate, years)
  const without = simpleInterest(amount, rate, years)
  const xs = Array.from({ length: years + 1 }, (_, n) => n)
  const gap = withInterest[years] - without[years]

  const factorTex = formatDecimal(String(multiplier(rate)), sep, true)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.q6')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.interestIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="prop.interestDef" />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('prop.interestPickAmount')} <strong>{groupThousands(amount)}</strong>
          </span>
          <input
            type="range"
            min={100000}
            max={1000000}
            step={50000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('prop.interestPickRate')} <strong>{`${rate}%`}</strong>
          </span>
          <input type="range" min={1} max={12} step={1} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('prop.interestPickYears')} <strong>{years}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('prop.interestThYear')}</th>
              <th>{t('prop.interestThCompound')}</th>
              <th>{t('prop.interestThSimple')}</th>
              <th>{t('prop.interestThDiff')}</th>
            </tr>
          </thead>
          <tbody>
            {xs.map((n) => (
              <tr key={n} className={n === years ? 'prop-current' : undefined}>
                <td>{n}</td>
                <td>{groupThousands(withInterest[n])}</td>
                <td>{groupThousands(without[n])}</td>
                <td>
                  <strong>{groupThousands(withInterest[n] - without[n])}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LineChart
        xs={xs}
        height={200}
        xLabel={t('prop.interestChartX')}
        yLabel={t('prop.interestChartY')}
        format={(v) => groupThousands(v)}
        xStep={1}
        series={[
          { name: t('prop.interestCompound'), color: 'var(--series-1)', values: withInterest },
          { name: t('prop.interestSimple'), color: 'var(--series-2)', values: without, dashed: true },
        ]}
      />

      <Tex block tex={`${amount} \\cdot ${factorTex}^{${years}} = ${withInterest[years]}`} />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="prop.interestGap"
          values={{ years, diff: groupThousands(gap) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="prop.interestTask"
        isCorrect={Number(answer) === INTEREST_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(INTEREST_ANSWER)}
        onReveal={() => setAnswer(String(INTEREST_ANSWER))}
        hintKey="prop.interestHint"
      >
        <label className="field">
          <span className="field-label">{t('prop.interestAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
