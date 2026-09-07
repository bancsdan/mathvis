import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { fmt } from '../lib/analysis'
import { PRESETS, useCompiled } from './presets'
import { Tex } from './Tex'
import { niceTicks, tickLabel } from '../lib/ticks'
import { useWidth } from './useWidth'

const X_MIN = -3
const X_MAX = 3
const EPS = 1e-6

const M = { top: 14, right: 42, bottom: 26, left: 52 }

interface ChartProps {
  fn: (x: number) => number
  x0: number
  h: number
  slope: number
  tangentSlope: number | null
  height?: number
}

/** Curve, secant through (x0, x0+h), and tangent at x0. */
function SecantChart({ fn, x0, h, slope, tangentSlope, height = 300 }: ChartProps) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const plotW = Math.max(width - M.left - M.right, 10)
  const plotH = height - M.top - M.bottom

  const { pts, yMin, yMax } = useMemo(() => {
    const steps = 480
    const pts: Array<[number, number]> = []
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i <= steps; i++) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / steps
      const y = fn(x)
      pts.push([x, y])
      if (y < lo) lo = y
      if (y > hi) hi = y
    }
    const pad = (hi - lo || 1) * 0.12
    return { pts, yMin: lo - pad, yMax: hi + pad }
  }, [fn])

  const sx = (x: number) => M.left + ((x - X_MIN) / (X_MAX - X_MIN)) * plotW
  const sy = (y: number) => M.top + (1 - (y - yMin) / (yMax - yMin || 1)) * plotH

  const curvePath = useMemo(
    () => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`).join(''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pts, width, yMin, yMax]
  )

  const y0 = fn(x0)
  const y1 = fn(x0 + h)
  const lineY = (s: number, atX: number) => y0 + s * (atX - x0)
  const yTicks = niceTicks(yMin, yMax, 4)
  const xTicks = niceTicks(X_MIN, X_MAX, 6)
  const clipId = 'secant-clip'

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={t('deriv.chartAria')}>
          <defs>
            <clipPath id={clipId}>
              <rect x={M.left} y={M.top} width={plotW} height={plotH} />
            </clipPath>
          </defs>
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={M.left} x2={M.left + plotW} y1={sy(t)} y2={sy(t)} stroke={t === 0 ? 'var(--axis)' : 'var(--grid)'} strokeWidth={1} />
              <text x={M.left - 8} y={sy(t) + 4} textAnchor="end" className="tick-text">
                {tickLabel(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={`x${t}`} x={sx(t)} y={M.top + plotH + 17} textAnchor="middle" className="tick-text">
              {tickLabel(t)}
            </text>
          ))}
          <text x={M.left + plotW + 12} y={M.top + plotH + 17} textAnchor="start" className="axis-label">
            x
          </text>
          <g clipPath={`url(#${clipId})`}>
            {tangentSlope !== null && (
              <line
                x1={sx(X_MIN)}
                y1={sy(lineY(tangentSlope, X_MIN))}
                x2={sx(X_MAX)}
                y2={sy(lineY(tangentSlope, X_MAX))}
                stroke="var(--series-3)"
                strokeWidth={2}
                strokeDasharray="7 5"
              />
            )}
            <line
              x1={sx(X_MIN)}
              y1={sy(lineY(slope, X_MIN))}
              x2={sx(X_MAX)}
              y2={sy(lineY(slope, X_MAX))}
              stroke="var(--series-2)"
              strokeWidth={2}
            />
            <path d={curvePath} fill="none" stroke="var(--series-1)" strokeWidth={2.2} />
          </g>
          <circle cx={sx(x0)} cy={sy(y0)} r={5.5} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />
          <circle cx={sx(x0 + h)} cy={sy(y1)} r={5.5} fill="var(--series-2)" stroke="var(--surface)" strokeWidth={2} />
          <text x={sx(x0)} y={sy(y0) - 10} textAnchor="middle" className="point-label">
            x₀
          </text>
          <text x={sx(x0 + h)} y={sy(y1) - 10} textAnchor="middle" className="point-label point-label-secant">
            x₀+h
          </text>
        </svg>
      )}
    </div>
  )
}

/** The derivative as a limit: drag h toward 0 and watch the secant become the tangent. */
export function DerivativePage() {
  const { t } = useTranslation()
  const [expr, setExpr] = useState(PRESETS[0].expr)
  const [x0, setX0] = useState(0.6)
  const [hExp, setHExp] = useState(0.3) // h = 10^hExp
  const [fromLeft, setFromLeft] = useState(false)

  const { fn, error } = useCompiled(expr)
  const h = (fromLeft ? -1 : 1) * 10 ** hExp

  let slope = 0
  let dLeft = 0
  let dRight = 0
  let tangentSlope: number | null = null
  if (fn) {
    slope = (fn(x0 + h) - fn(x0)) / h
    dRight = (fn(x0 + EPS) - fn(x0)) / EPS
    dLeft = (fn(x0) - fn(x0 - EPS)) / EPS
    tangentSlope = Math.abs(dLeft - dRight) < 1e-3 * (1 + Math.abs(dLeft)) ? (dLeft + dRight) / 2 : null
  }

  const rows = useMemo(() => {
    if (!fn) return []
    const out: Array<{ h: number; q: number }> = []
    let hh = fromLeft ? -1 : 1
    for (let i = 0; i < 9; i++) {
      out.push({ h: hh, q: (fn(x0 + hh) - fn(x0)) / hh })
      hh /= 2
    }
    return out
  }, [fn, x0, fromLeft])

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>{t('deriv.title')}</h2>
          <div className="legend">
            <span className="legend-item">
              <span className="chip chip-dashed" style={{ background: 'var(--series-1)', height: 3 }} /> f(x)
            </span>
            <span className="legend-item">
              <span className="chip chip-dashed" style={{ background: 'var(--series-2)', height: 3 }} /> {t('deriv.legendSecant')}
            </span>
            <span className="legend-item">
              <span className="chip chip-dashed" style={{ background: 'var(--series-3)' }} /> {t('deriv.legendTangent')}
            </span>
          </div>
        </div>
        <div className="lesson-text">
          <p className="card-note">
            <Trans i18nKey="deriv.intro1" components={{ b: <strong />, i: <em /> }} />
          </p>
          <p className="card-note">
            <Trans i18nKey="deriv.intro2" components={{ b: <strong />, i: <em /> }} />
          </p>
          <p className="card-note">
            <Trans i18nKey="deriv.steps12" components={{ b: <strong />, i: <em /> }} />
          </p>
          <Tex
            block
            tex={`\\text{${t('deriv.texSlope')}} = \\frac{\\text{${t('deriv.texRise')}}}{\\text{${t('deriv.texRun')}}} = \\frac{f(x_0+h)-f(x_0)}{h}`}
          />
          <p className="card-note">
            <Trans i18nKey="deriv.step3" components={{ b: <strong />, i: <em /> }} />
          </p>
          <Tex block tex={"f'(x_0) = \\lim_{h \\to 0}\\; \\frac{f(x_0+h)-f(x_0)}{h}"} />
          <p className="card-note">{t('deriv.dragNote')}</p>
        </div>
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">f(x)</span>
            <select
              value={PRESETS.find((p) => p.expr === expr)?.name ?? ''}
              onChange={(e) => {
                const p = PRESETS.find((p) => p.name === e.target.value)
                if (p) setExpr(p.expr)
              }}
            >
              {PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.labelKey ? t(p.labelKey) : p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">
              x₀ = <strong>{x0.toFixed(1)}</strong>
            </span>
            <input type="range" min={-2.5} max={2.5} step={0.1} value={x0} onChange={(e) => setX0(Number(e.target.value))} />
          </label>
          <label className="field">
            <span className="field-label">
              h = <strong>{h.toFixed(Math.max(0, Math.min(4, 1 - Math.floor(hExp))))}</strong>{' '}
              {t('deriv.hHint')}
            </span>
            <input type="range" min={-3.5} max={0.3} step={0.01} value={hExp} onChange={(e) => setHExp(Number(e.target.value))} />
          </label>
          <label className="field checkbox-field">
            <span className="field-label">{t('deriv.fromLeft')}</span>
            <input type="checkbox" checked={fromLeft} onChange={(e) => setFromLeft(e.target.checked)} />
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            {t('deriv.errorEval', { msg: error })}
          </p>
        )}
        {fn && (
          <>
            <SecantChart fn={fn} x0={x0} h={h} slope={slope} tangentSlope={tangentSlope} />
            <Tex
              block
              tex={`\\text{${t('deriv.texSlope')}} = \\frac{f(${fmt(x0 + h, 4)})-f(${fmt(x0, 3)})}{${fmt(h, 3)}} = \\frac{${fmt(fn(x0 + h), 4)}-${fmt(fn(x0), 4)}}{${fmt(h, 3)}} = \\mathbf{${fmt(slope, 5)}}`}
            />
            {tangentSlope !== null ? (
              <Tex
                block
                tex={`\\text{${t('deriv.texLimitHeading')}}\\quad f'(${fmt(x0, 3)}) = \\mathbf{${fmt(tangentSlope, 5)}} \\qquad \\text{${t('deriv.texGap')}} ${fmt(Math.abs(slope - tangentSlope), 2)}`}
              />
            ) : (
              <p className="card-note lesson-text">
                <Trans
                  i18nKey="deriv.noTangent"
                  components={{ b: <strong /> }}
                  values={{ right: fmt(dRight, 3), left: fmt(dLeft, 3), x0: fmt(x0, 3) }}
                />
              </p>
            )}
          </>
        )}
      </section>

      {fn && (
        <section className="card">
          <div className="card-head">
            <h2>{t('deriv.tableTitle')}</h2>
          </div>
          <p className="card-note lesson-text">
            <Trans i18nKey="deriv.tableIntro" components={{ b: <strong />, i: <em /> }} />
          </p>
          <div className="table-wrap">
            <table className="paper-table">
              <thead>
                <tr>
                  <th>h</th>
                  <th>x₀ + h</th>
                  <th>f(x₀+h)</th>
                  <th>(f(x₀+h) − f(x₀)) / h</th>
                  <th>{tangentSlope !== null ? t('deriv.thDistanceKnown') : t('deriv.thDistanceUnknown')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.h}>
                    <td>{r.h}</td>
                    <td>{fmt(x0 + r.h, 4)}</td>
                    <td>{fmt(fn(x0 + r.h), 5)}</td>
                    <td>{fmt(r.q, 6)}</td>
                    <td>{tangentSlope !== null ? fmt(Math.abs(r.q - tangentSlope), 2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="card-note lesson-text">
            <Trans i18nKey="deriv.tryIt" components={{ b: <strong /> }} />
          </p>
        </section>
      )}
    </>
  )
}
