import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { COMPLETE_ANSWER, completeSquare, completeStepsTex, quadValue } from '../lib/algebra'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

/** x is not a number, so the x² square is drawn at a fixed size. */
const X_UNITS = 6
const PAD = { left: 24, top: 20, right: 10, bottom: 10 }

/** A number with the typographic minus prose uses, not the hyphen. */
const signed = (v: number): string => (v < 0 ? `−${Math.abs(v)}` : String(v))

/**
 * Teljes négyzetté kiegészítés és a parabola.
 *
 * The picture says what is missing — the square is there but for one corner —
 * and the chart says why anyone would bother: once the expression is a square
 * plus a number, the lowest point of the graph can simply be read off.
 */
export function AlgCompleteCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  // The slider holds half of p, so p stays even and h stays a whole number.
  const [halfP, setHalfP] = useState(3)
  const [q, setQ] = useState(5)
  const [ansH, setAnsH] = useState('')
  const [ansK, setAnsK] = useState('')

  const p = 2 * halfP
  const { h, k } = completeSquare(p, q)
  const steps = completeStepsTex(p, q)
  const answerKey = `${ansH}|${ansK}`
  const [solH, solK] = COMPLETE_ANSWER.split('|')

  // A window six units either side of the lowest point, so the parabola's
  // bottom stays in the middle of the chart wherever the sliders put it.
  const xs = useMemo(() => Array.from({ length: 25 }, (_, i) => -h - 6 + i * 0.5), [h])
  const curve = useMemo(() => xs.map((x) => quadValue(p, q, x)), [xs, p, q])
  const floor = useMemo(() => xs.map(() => k), [xs, k])

  const cols = X_UNITS + h
  const unit = Math.max(6, Math.min(24, (width - PAD.left - PAD.right) / Math.max(cols, 1), 220 / Math.max(cols, 1)))
  const height = cols * unit + PAD.top + PAD.bottom
  const px = (u: number) => PAD.left + u * unit
  const py = (u: number) => PAD.top + u * unit

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.completeIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="alg.completeDef" />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('alg.completePickP')} <strong>{signed(p)}</strong>
          </span>
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={halfP}
            onChange={(e) => setHalfP(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('alg.completePickQ')} <strong>{signed(q)}</strong>
          </span>
          <input type="range" min={-10} max={10} step={1} value={q} onChange={(e) => setQ(Number(e.target.value))} />
        </label>
      </div>

      <Tex block tex={steps.join(' = ')} />

      {/* The box stays mounted even with no picture in it, so its width
          observer survives a trip through the negative half of the slider. */}
      <div ref={ref} className="chart-box">
        {h > 0 && width > 0 && (
            <svg
              className="alg-area"
              width={width}
              height={height}
              role="img"
              aria-label={t('alg.completeAria', { h, square: h * h })}
            >
              <rect
                className="alg-region"
                x={px(0)}
                y={py(0)}
                width={X_UNITS * unit}
                height={X_UNITS * unit}
                fill="var(--series-1)"
              />
              <text className="alg-label" x={px(X_UNITS / 2)} y={py(X_UNITS / 2) + 4} textAnchor="middle">
                x²
              </text>
              <rect
                className="alg-region"
                x={px(X_UNITS)}
                y={py(0)}
                width={h * unit}
                height={X_UNITS * unit}
                fill="var(--series-2)"
              />
              <text className="alg-label" x={px(X_UNITS + h / 2)} y={py(X_UNITS / 2) + 4} textAnchor="middle">
                {h}x
              </text>
              <rect
                className="alg-region"
                x={px(0)}
                y={py(X_UNITS)}
                width={X_UNITS * unit}
                height={h * unit}
                fill="var(--series-2)"
              />
              <text className="alg-label" x={px(X_UNITS / 2)} y={py(X_UNITS + h / 2) + 4} textAnchor="middle">
                {h}x
              </text>
              <rect
                className="alg-missing"
                x={px(X_UNITS)}
                y={py(X_UNITS)}
                width={h * unit}
                height={h * unit}
              />
              <text className="alg-label" x={px(X_UNITS + h / 2)} y={py(X_UNITS + h / 2) + 4} textAnchor="middle">
                {h * h}
              </text>
          </svg>
        )}
      </div>
      {h <= 0 && <p className="card-note lesson-text">{t('alg.completeNoPicture')}</p>}

      <LineChart
        xs={xs}
        xLabel="x"
        yLabel="y"
        series={[
          { name: t('alg.completeCurve'), color: 'var(--series-1)', values: curve },
          { name: t('alg.completeMin'), color: 'var(--series-3)', values: floor, dashed: true },
        ]}
      />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="alg.completeVertex"
          values={{ x: signed(-h), k: signed(k) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="alg.completeTask"
        isCorrect={answerKey === COMPLETE_ANSWER}
        canCheck={ansH.trim() !== '' && ansK.trim() !== ''}
        answerKey={answerKey}
        solutionKey={COMPLETE_ANSWER}
        onReveal={() => {
          setAnsH(solH)
          setAnsK(solK)
        }}
        hintKey="alg.completeHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('alg.completeAnswerH')}</span>
            <input className="answer-input" type="number" value={ansH} onChange={(e) => setAnsH(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('alg.completeAnswerK')}</span>
            <input className="answer-input" type="number" value={ansK} onChange={(e) => setAnsK(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
