import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  equationTex,
  frac,
  fracPlain,
  GRAPH_ANSWER,
  GRAPH_PRESET,
  lineValues,
  solveLinear,
  type Side,
} from '../lib/linear'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/** −6 to 6 in half steps: fine enough that the crossing looks like a point. */
const XS = Array.from({ length: 25 }, (_, i) => -6 + i * 0.5)
const Y_DOMAIN: [number, number] = [-12, 12]

/**
 * Grafikus megoldás. The two sides are two lines, and the x of their crossing
 * is the root — which also makes "no solution" and "every number" something
 * you can see rather than something you have to be told.
 */
export function LinGraphCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [left, setLeft] = useState<Side>(GRAPH_PRESET.l)
  const [right, setRight] = useState<Side>(GRAPH_PRESET.r)
  const [answer, setAnswer] = useState('')

  const result = solveLinear(left, right)
  const resultKey = `lin.graphResult_${result.kind}`

  const chart = (l: Side, r: Side) => (
    <LineChart
      xs={XS}
      height={240}
      xLabel="x"
      yLabel="y"
      yDomain={Y_DOMAIN}
      xStep={1}
      series={[
        { name: t('lin.graphLeft'), color: 'var(--series-1)', values: lineValues(l, XS) },
        { name: t('lin.graphRight'), color: 'var(--series-2)', values: lineValues(r, XS) },
      ]}
    />
  )

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.graphTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.graphIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.graphRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.graphIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.graphIntro3" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('lin.graphPickA')} <strong>{left.a}</strong>
          </span>
          <input
            type="range"
            min={-3}
            max={3}
            step={1}
            value={left.a}
            onChange={(e) => setLeft({ ...left, a: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('lin.graphPickB')} <strong>{left.b}</strong>
          </span>
          <input
            type="range"
            min={-6}
            max={6}
            step={1}
            value={left.b}
            onChange={(e) => setLeft({ ...left, b: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('lin.graphPickC')} <strong>{right.a}</strong>
          </span>
          <input
            type="range"
            min={-3}
            max={3}
            step={1}
            value={right.a}
            onChange={(e) => setRight({ ...right, a: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('lin.graphPickD')} <strong>{right.b}</strong>
          </span>
          <input
            type="range"
            min={-6}
            max={6}
            step={1}
            value={right.b}
            onChange={(e) => setRight({ ...right, b: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="pill-row">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLeft(GRAPH_PRESET.l)
            setRight(GRAPH_PRESET.r)
          }}
        >
          {t('lin.graphReset')}
        </button>
      </div>

      {chart(left, right)}

      <Tex block tex={equationTex(left, right)} />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={resultKey}
          values={{
            x: result.kind === 'one' ? fracPlain(result.x, sep) : '',
            y:
              result.kind === 'one'
                ? fracPlain(frac(left.a * result.x.p + left.b * result.x.q, result.x.q), sep)
                : '',
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="lin.graphTask"
        isCorrect={Number(answer) === GRAPH_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(GRAPH_ANSWER)}
        onReveal={() => setAnswer(String(GRAPH_ANSWER))}
        hintKey="lin.graphHint"
      >
        {chart(GRAPH_PRESET.l, GRAPH_PRESET.r)}
        <Tex block tex={equationTex(GRAPH_PRESET.l, GRAPH_PRESET.r)} />
        <label className="field">
          <span className="field-label">{t('lin.graphAnswerLabel')}</span>
          <input
            className="answer-input"
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
