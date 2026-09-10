import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  DIRECT_ANSWER,
  DIRECT_QUIZ,
  DIRECT_SCENARIOS,
  directTable,
  directValue,
  groupThousands,
  plainNumber,
} from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/** The rows that are always on the table, whichever scenario is picked. */
const FIXED_XS = [1, 2, 5, 10]

/**
 * Egyenes arányosság. Whatever the slider says, the last column of the table
 * holds the same number — and that is the whole content of "proportional".
 * The doubling button says the same thing a second way: twice the quantity,
 * twice the value, no matter where you started.
 */
export function PropDirectCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [scId, setScId] = useState('apples')
  const [x, setX] = useState(2)
  /** The x the reader doubled from, so the two rows can be compared. */
  const [doubledFrom, setDoubledFrom] = useState<number | null>(null)
  const [pick, setPick] = useState('')
  const [showRatios, setShowRatios] = useState(false)

  const sc = DIRECT_SCENARIOS.find((s) => s.id === scId) ?? DIRECT_SCENARIOS[0]
  // The row the slider stands on takes its place among the fixed ones rather
  // than being repeated under them.
  const rows = directTable(sc.k, [...new Set([...FIXED_XS, x])].sort((a, b) => a - b))
  const unitX = t(`prop.directUnitX_${sc.id}`)
  const unitY = t(`prop.directUnitY_${sc.id}`)

  const xs = Array.from({ length: 41 }, (_, i) => (i * sc.xMax) / 40)
  const values = xs.map((v) => directValue(sc.k, v))
  const canDouble = 2 * x <= sc.xMax && x > 0

  const quantity = (v: number) => `${plainNumber(v, sep)} ${unitX}`
  const amount = (v: number) => `${groupThousands(v)} ${unitY}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.directIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['prop.directDef1', 'prop.directDef2']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('prop.directScAria')}>
        {DIRECT_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={scId === s.id ? 'pill active' : 'pill'}
            aria-pressed={scId === s.id}
            onClick={() => {
              setScId(s.id)
              setX(2)
              setDoubledFrom(null)
            }}
          >
            {t(`prop.directSc_${s.id}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('prop.directPickX')} <strong>{quantity(x)}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={sc.xMax}
            step={sc.xStep}
            value={x}
            onChange={(e) => {
              setX(Number(e.target.value))
              setDoubledFrom(null)
            }}
          />
        </label>
      </div>

      <div className="pill-row">
        <button
          type="button"
          className="btn"
          disabled={!canDouble}
          onClick={() => {
            setDoubledFrom(x)
            setX(2 * x)
          }}
        >
          {t('prop.directDouble')}
        </button>
      </div>

      <Tex block tex={`y = ${sc.k} \\cdot x`} />

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{`${t('prop.directThX')} (${unitX})`}</th>
              <th>{`${t('prop.directThY')} (${unitY})`}</th>
              <th>
                <strong>{`${t('prop.directThRatio')} (${unitY}/${unitX})`}</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.x} className={row.x === x ? 'prop-current' : undefined}>
                <td>{plainNumber(row.x, sep)}</td>
                <td>{groupThousands(row.y)}</td>
                <td>
                  <strong>{row.x === 0 ? '—' : groupThousands(row.ratio)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="prop.directConstant"
          values={{ k: `${groupThousands(sc.k)} ${unitY}/${unitX}` }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      {doubledFrom !== null && (
        <p className="card-note lesson-text">
          <Trans
            i18nKey="prop.directDoubled"
            values={{
              x: quantity(doubledFrom),
              x2: quantity(2 * doubledFrom),
              y: amount(directValue(sc.k, doubledFrom)),
              y2: amount(directValue(sc.k, 2 * doubledFrom)),
            }}
            components={{ b: <strong />, i: <em /> }}
          />
        </p>
      )}

      <LineChart
        xs={xs}
        height={200}
        xLabel={unitX}
        yLabel={unitY}
        format={(v) => groupThousands(v)}
        series={[{ name: t('prop.directCurve'), color: 'var(--series-1)', values }]}
      />
      <p className="card-note lesson-text">{t('prop.directNote')}</p>

      <Exercise
        promptKey="prop.directTask"
        isCorrect={pick === DIRECT_ANSWER}
        canCheck={pick !== ''}
        answerKey={pick}
        solutionKey={DIRECT_ANSWER}
        onReveal={() => {
          setPick(DIRECT_ANSWER)
          setShowRatios(true)
        }}
        hintKey="prop.directHint"
      >
        <div className="prop-quiz" role="group" aria-label={t('prop.directQuizAria')}>
          {DIRECT_QUIZ.map((quiz) => (
            <div key={quiz.id} className={pick === quiz.id ? 'prop-quiz-table lit' : 'prop-quiz-table'}>
              <p className="mini-title">{t(`prop.directQuizName_${quiz.id}`)}</p>
              <table className="paper-table">
                <thead>
                  <tr>
                    <th>x</th>
                    <th>y</th>
                    {showRatios && <th>y : x</th>}
                  </tr>
                </thead>
                <tbody>
                  {quiz.pairs.map((pair) => (
                    <tr key={pair.x}>
                      <td>{pair.x}</td>
                      <td>{groupThousands(pair.y)}</td>
                      {showRatios && (
                        <td>
                          <strong>{plainNumber(pair.y / pair.x, sep)}</strong>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className={pick === quiz.id ? 'pill active' : 'pill'}
                aria-pressed={pick === quiz.id}
                onClick={() => setPick(quiz.id)}
              >
                {t('prop.directPick')}
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" onClick={() => setShowRatios(!showRatios)}>
          {showRatios ? t('prop.directHideRatios') : t('prop.directShowRatios')}
        </button>
      </Exercise>
    </section>
  )
}
