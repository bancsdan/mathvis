import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  fmt,
  INVERSE_ANSWER,
  INVERSE_PRESETS,
  inverseLinear,
  inverseTex,
  linear,
  linearTex,
} from '../lib/functions'
import { texSeparator } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

const grid = (from: number, to: number, step: number): number[] =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => from + i * step)

/**
 * A window each preset fits into: the function, its inverse and the mirror line
 * all have to be on the same picture, or the reflection is not visible as one.
 */
const VIEW: Record<
  string,
  { xs: number[]; yDomain: [number, number]; xStep: number; min: number; max: number; step: number }
> = {
  fahrenheit: { xs: grid(-10, 50, 1), yDomain: [-10, 130], xStep: 10, min: -10, max: 40, step: 1 },
  double: { xs: grid(-10, 10, 0.5), yDomain: [-10, 10], xStep: 2, min: -5, max: 5, step: 1 },
  vat: { xs: grid(0, 100, 2), yDomain: [0, 130], xStep: 20, min: 0, max: 100, step: 5 },
}

/**
 * A hozzárendelés megfordítása.
 *
 * Undoing the steps and mirroring the graph in y = x are the same thing seen
 * two ways, so the slider says the pair out loud — f sends x to y, the inverse
 * sends y back to x — while the chart shows the two curves as each other's
 * reflection.
 */
export function FnInverseCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState(INVERSE_PRESETS[0].id)
  const [x, setX] = useState(20)
  const [answer, setAnswer] = useState('')

  const preset = INVERSE_PRESETS.find((p) => p.id === presetId) ?? INVERSE_PRESETS[0]
  const view = VIEW[preset.id]
  const f = linear(preset.m, preset.b)
  const inv = inverseLinear(preset.m, preset.b)
  const value = Math.min(Math.max(x, view.min), view.max)

  const pick = (nextId: string) => {
    setPresetId(nextId)
    const next = VIEW[nextId]
    setX(Math.min(Math.max(x, next.min), next.max))
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.inverseTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.inverseIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="fn.inverseDef" />
        <p className="card-note">
          <Trans i18nKey="fn.inverseIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.inversePickAria')}>
        {INVERSE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => pick(p.id)}
          >
            {t(`fn.inv_${p.id}`)}
          </button>
        ))}
      </div>

      <Tex block tex={texSeparator(linearTex(preset.m, preset.b), sep)} />
      <Tex block tex={texSeparator(inverseTex(preset.m, preset.b), sep)} />

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('fn.inversePickX')} <strong>{fmt(value, sep)}</strong>
          </span>
          <input
            type="range"
            min={view.min}
            max={view.max}
            step={view.step}
            value={value}
            onChange={(e) => setX(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="fn.inverseLine"
          values={{ x: fmt(value, sep), y: fmt(f(value), sep) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <LineChart
        xs={view.xs}
        height={260}
        xLabel="x"
        yLabel="y"
        yDomain={view.yDomain}
        xStep={view.xStep}
        format={(v) => fmt(v, sep)}
        series={[
          {
            name: t('fn.inverseCurveF'),
            color: 'var(--series-1)',
            values: view.xs.map((v) => f(v)),
          },
          {
            name: t('fn.inverseCurveInv'),
            color: 'var(--series-2)',
            values: view.xs.map((v) => inv.m * v + inv.b),
          },
          {
            name: t('fn.inverseCurveMirror'),
            color: 'var(--series-3)',
            values: view.xs.map((v) => v),
            dashed: true,
          },
        ]}
      />
      <p className="card-note lesson-text">{t('fn.inverseChartNote')}</p>

      <p className="mini-title">{t('fn.inverseSquareTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="fn.inverseSquareNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="fn.inverseTask"
        isCorrect={Number(answer) === INVERSE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(INVERSE_ANSWER)}
        onReveal={() => setAnswer(String(INVERSE_ANSWER))}
        hintKey="fn.inverseHint"
      >
        <Tex block tex="f(x) = 2x + 6" />
        <label className="field">
          <span className="field-label">{t('fn.inverseAnswerLabel')}</span>
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
