import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { INVERSE_ANSWER, INVERSE_SCENARIOS, inverseValue, plainNumber } from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/**
 * Fordított arányosság. The two numbers move in opposite directions, but their
 * product never budges — the third stat is the one to watch. The curve says
 * the rest: it flattens for ever without ever touching an axis.
 */
export function PropInverseCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [scId, setScId] = useState('pizza')
  const [x, setX] = useState(2)
  const [doubledFrom, setDoubledFrom] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')

  const sc = INVERSE_SCENARIOS.find((s) => s.id === scId) ?? INVERSE_SCENARIOS[0]
  const clamped = Math.min(Math.max(x, sc.xMin), sc.xMax)
  const y = inverseValue(sc.k, clamped)
  const unitX = t(`prop.inverseUnitX_${sc.id}`)
  const unitY = t(`prop.inverseUnitY_${sc.id}`)

  const steps = Math.round((sc.xMax - sc.xMin) / sc.xStep)
  const xs = Array.from({ length: steps + 1 }, (_, i) => sc.xMin + i * sc.xStep)
  const values = xs.map((v) => inverseValue(sc.k, v))
  const canDouble = 2 * clamped <= sc.xMax

  const quantity = (v: number) => `${plainNumber(v, sep)} ${unitX}`
  const share = (v: number) => `${plainNumber(v, sep)} ${unitY}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.inverseIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="prop.inverseDef" />
      </div>

      <div className="pill-row" role="group" aria-label={t('prop.inverseScAria')}>
        {INVERSE_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={scId === s.id ? 'pill active' : 'pill'}
            aria-pressed={scId === s.id}
            onClick={() => {
              setScId(s.id)
              setX(s.xMin * 2)
              setDoubledFrom(null)
            }}
          >
            {t(`prop.inverseSc_${s.id}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t(`prop.inverseLblX_${sc.id}`)} <strong>{quantity(clamped)}</strong>
          </span>
          <input
            type="range"
            min={sc.xMin}
            max={sc.xMax}
            step={sc.xStep}
            value={clamped}
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
            setDoubledFrom(clamped)
            setX(2 * clamped)
          }}
        >
          {t('prop.inverseDouble')}
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t(`prop.inverseLblX_${sc.id}`)}</span>
          <span className="stat-value">{quantity(clamped)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t(`prop.inverseLblY_${sc.id}`)}</span>
          <span className="stat-value">{share(y)}</span>
        </div>
        <div className="stat prop-constant">
          <span className="stat-label">{t('prop.inverseStatK')}</span>
          <span className="stat-value">{plainNumber(clamped * y, sep)}</span>
        </div>
      </div>

      <Tex block tex={`y = \\frac{${sc.k}}{x}`} />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="prop.inverseConstant"
          values={{ x: plainNumber(clamped, sep), y: plainNumber(y, sep), k: sc.k }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      {doubledFrom !== null && (
        <p className="card-note lesson-text">
          <Trans
            i18nKey="prop.inverseDoubled"
            values={{
              x: quantity(doubledFrom),
              x2: quantity(2 * doubledFrom),
              y: share(inverseValue(sc.k, doubledFrom)),
              y2: share(inverseValue(sc.k, 2 * doubledFrom)),
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
        format={(v) => plainNumber(v, sep)}
        series={[{ name: t(`prop.inverseLblY_${sc.id}`), color: 'var(--series-2)', values }]}
      />
      <p className="card-note lesson-text">{t('prop.inverseNote')}</p>

      <Exercise
        promptKey="prop.inverseTask"
        isCorrect={Number(answer) === INVERSE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(INVERSE_ANSWER)}
        onReveal={() => setAnswer(String(INVERSE_ANSWER))}
        hintKey="prop.inverseHint"
      >
        <label className="field">
          <span className="field-label">{t('prop.inverseAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
