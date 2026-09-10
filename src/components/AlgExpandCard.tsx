import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { expandBinomials, expandedTex, EXPAND_ANSWER, FACTOR_EXAMPLES } from '../lib/algebra'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

/** x is not a number, so it is drawn as a fixed stretch the numbers sit next to. */
const X_UNITS = 6
const PAD = { left: 26, top: 20, right: 10, bottom: 10 }

interface Region {
  x: number
  y: number
  w: number
  h: number
  series: 1 | 2 | 3
  label: string
}

/**
 * The rectangle whose area is the product, cut along the terms of its sides.
 *
 * Labels are plain text because KaTeX cannot live inside an SVG; the typeset
 * version of the same statement sits under the picture.
 */
function AreaPicture({
  regions,
  cols,
  rows,
  topLabels,
  sideLabels,
  ariaLabel,
}: {
  regions: readonly Region[]
  cols: number
  rows: number
  topLabels: readonly { at: number; span: number; text: string }[]
  sideLabels: readonly { at: number; span: number; text: string }[]
  ariaLabel: string
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const unit = Math.max(6, Math.min(26, (width - PAD.left - PAD.right) / cols, 260 / rows))
  const height = rows * unit + PAD.top + PAD.bottom
  const px = (u: number) => PAD.left + u * unit
  const py = (u: number) => PAD.top + u * unit

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg className="alg-area" width={width} height={height} role="img" aria-label={ariaLabel}>
          {regions.map((r) => (
            <g key={`${r.x}-${r.y}-${r.label}`}>
              <rect
                className="alg-region"
                x={px(r.x)}
                y={py(r.y)}
                width={r.w * unit}
                height={r.h * unit}
                fill={`var(--series-${r.series})`}
              />
              <text className="alg-label" x={px(r.x + r.w / 2)} y={py(r.y + r.h / 2) + 4} textAnchor="middle">
                {r.label}
              </text>
            </g>
          ))}
          {topLabels.map((l) => (
            <text
              key={`t${l.at}`}
              className="alg-label"
              x={px(l.at + l.span / 2)}
              y={PAD.top - 6}
              textAnchor="middle"
            >
              {l.text}
            </text>
          ))}
          {sideLabels.map((l) => (
            <text
              key={`s${l.at}`}
              className="alg-label"
              x={PAD.left - 8}
              y={py(l.at + l.span / 2) + 4}
              textAnchor="end"
            >
              {l.text}
            </text>
          ))}
        </svg>
      )}
    </div>
  )
}

/**
 * Zárójelfelbontás és kiemelés. One rectangle, two ways of measuring it: in one
 * piece, or piece by piece. That the two agree is the distributive law, and
 * reading the picture backwards is factoring out.
 */
export function AlgExpandCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'one' | 'two'>('one')
  const [k, setK] = useState(3)
  const [a, setA] = useState(4)
  const [b, setB] = useState(2)
  const [ansX, setAnsX] = useState('')
  const [ansC, setAnsC] = useState('')

  const answerKey = `${ansX}|${ansC}`
  const [solX, solC] = EXPAND_ANSWER.split('|')

  const regions: Region[] =
    mode === 'one'
      ? [
          { x: 0, y: 0, w: X_UNITS, h: k, series: 2, label: `${k}x` },
          { x: X_UNITS, y: 0, w: a, h: k, series: 3, label: String(k * a) },
        ]
      : [
          { x: 0, y: 0, w: X_UNITS, h: X_UNITS, series: 1, label: 'x²' },
          { x: X_UNITS, y: 0, w: a, h: X_UNITS, series: 2, label: `${a}x` },
          { x: 0, y: X_UNITS, w: X_UNITS, h: b, series: 2, label: `${b}x` },
          { x: X_UNITS, y: X_UNITS, w: a, h: b, series: 3, label: String(a * b) },
        ]

  const cols = X_UNITS + a
  const rows = mode === 'one' ? k : X_UNITS + b
  const topLabels = [
    { at: 0, span: X_UNITS, text: 'x' },
    { at: X_UNITS, span: a, text: String(a) },
  ]
  const sideLabels =
    mode === 'one'
      ? [{ at: 0, span: k, text: String(k) }]
      : [
          { at: 0, span: X_UNITS, text: 'x' },
          { at: X_UNITS, span: b, text: String(b) },
        ]

  const statement =
    mode === 'one'
      ? `${k}(x + ${a}) = ${k}x + ${k * a}`
      : `(x + ${a})(x + ${b}) = x^2 + ${a}x + ${b}x + ${a * b} = ${expandedTex(expandBinomials(a, b))}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.expandIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['alg.expandDef1', 'alg.expandDef2']} />
      </div>
      <Tex block tex="a(b + c) = ab + ac" />

      <div className="pill-row" role="group" aria-label={t('alg.expandModeAria')}>
        <button
          type="button"
          className={mode === 'one' ? 'pill active' : 'pill'}
          aria-pressed={mode === 'one'}
          onClick={() => setMode('one')}
        >
          {t('alg.expandModeOne')}
        </button>
        <button
          type="button"
          className={mode === 'two' ? 'pill active' : 'pill'}
          aria-pressed={mode === 'two'}
          onClick={() => setMode('two')}
        >
          {t('alg.expandModeTwo')}
        </button>
      </div>

      <div className="controls-inline">
        {mode === 'one' && (
          <label className="field">
            <span className="field-label">
              {t('alg.expandPickK')} <strong>{k}</strong>
            </span>
            <input type="range" min={2} max={6} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} />
          </label>
        )}
        <label className="field">
          <span className="field-label">
            {t('alg.expandPickA')} <strong>{a}</strong>
          </span>
          <input type="range" min={1} max={9} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        {mode === 'two' && (
          <label className="field">
            <span className="field-label">
              {t('alg.expandPickB')} <strong>{b}</strong>
            </span>
            <input type="range" min={1} max={9} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} />
          </label>
        )}
      </div>

      <AreaPicture
        regions={regions}
        cols={cols}
        rows={rows}
        topLabels={topLabels}
        sideLabels={sideLabels}
        ariaLabel={t(`alg.expandAria_${mode}`, { k, a, b })}
      />

      <Tex block tex={statement} />

      <p className="lin-result lesson-text">
        {mode === 'two' ? (
          <Trans
            i18nKey="alg.expandResultTwo"
            values={{ a, b, sum: a + b, product: a * b }}
            components={{ b: <strong />, i: <em /> }}
          />
        ) : (
          <Trans i18nKey="alg.expandResultOne" components={{ b: <strong />, i: <em /> }} />
        )}
      </p>

      {/* Folded in from the old terms section: the one trap of the topic. */}
      <p className="card-note lesson-text">
        <Trans i18nKey="alg.expandLikeNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('alg.expandFactorTitle')}</p>
      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('alg.expandThSum')}</th>
              <th>{t('alg.expandThCommon')}</th>
              <th>{t('alg.expandThProduct')}</th>
            </tr>
          </thead>
          <tbody>
            {FACTOR_EXAMPLES.map((ex) => (
              <tr key={ex.tex}>
                <td>
                  <Tex tex={ex.tex} />
                </td>
                <td>
                  <strong>
                    <Tex tex={ex.common} />
                  </strong>
                </td>
                <td>
                  <Tex tex={`${ex.common}(${ex.rest})`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Exercise
        promptKey="alg.expandTask"
        isCorrect={answerKey === EXPAND_ANSWER}
        canCheck={ansX.trim() !== '' && ansC.trim() !== ''}
        answerKey={answerKey}
        solutionKey={EXPAND_ANSWER}
        onReveal={() => {
          setAnsX(solX)
          setAnsC(solC)
        }}
        hintKey="alg.expandHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('alg.expandAnswerX')}</span>
            <input className="answer-input" type="number" value={ansX} onChange={(e) => setAnsX(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('alg.expandAnswerC')}</span>
            <input className="answer-input" type="number" value={ansC} onChange={(e) => setAnsC(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
