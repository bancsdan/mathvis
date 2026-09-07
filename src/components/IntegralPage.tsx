import { useMemo, useState } from 'react'
import { fmt } from '../lib/analysis'
import { niceTicks, tickLabel } from '../lib/ticks'
import { PRESETS, useCompiled } from './presets'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const X_MIN = -3
const X_MAX = 3

type Rule = 'left' | 'midpoint' | 'right'

/** Composite Simpson's rule — the "true" integral the rectangles converge to. */
function simpson(fn: (x: number) => number, a: number, b: number): number {
  const n = 2000
  const dx = (b - a) / n
  let sum = fn(a) + fn(b)
  for (let i = 1; i < n; i++) sum += fn(a + i * dx) * (i % 2 === 0 ? 2 : 4)
  return (sum * dx) / 3
}

function riemann(fn: (x: number) => number, a: number, b: number, n: number, rule: Rule): number {
  const dx = (b - a) / n
  const off = rule === 'left' ? 0 : rule === 'right' ? 1 : 0.5
  let sum = 0
  for (let i = 0; i < n; i++) sum += fn(a + (i + off) * dx)
  return sum * dx
}

const M = { top: 14, right: 42, bottom: 26, left: 52 }

interface ChartProps {
  fn: (x: number) => number
  a: number
  b: number
  n: number
  rule: Rule
  height?: number
}

/** Curve with the true area shaded and n Riemann rectangles overlaid. */
function RiemannChart({ fn, a, b, n, rule, height = 300 }: ChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const plotW = Math.max(width - M.left - M.right, 10)
  const plotH = height - M.top - M.bottom

  const { pts, yMin, yMax } = useMemo(() => {
    const steps = 480
    const pts: Array<[number, number]> = []
    let lo = 0
    let hi = 0
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

  const areaPath = useMemo(() => {
    const steps = 240
    let d = ''
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps
      d += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(2)},${sy(fn(x)).toFixed(2)}`
    }
    d += `L${sx(b).toFixed(2)},${sy(0).toFixed(2)}L${sx(a).toFixed(2)},${sy(0).toFixed(2)}Z`
    return d
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b, fn, width, yMin, yMax])

  const dx = (b - a) / n
  const off = rule === 'left' ? 0 : rule === 'right' ? 1 : 0.5
  const yTicks = niceTicks(yMin, yMax, 4)
  const xTicks = niceTicks(X_MIN, X_MAX, 6)

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Function with true area shaded and Riemann rectangles">
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
          <path d={areaPath} fill="var(--series-1)" opacity={0.15} stroke="none" />
          {Array.from({ length: n }, (_, i) => {
            const y = fn(a + (i + off) * dx)
            const x0 = sx(a + i * dx)
            const x1 = sx(a + (i + 1) * dx)
            const top = Math.min(sy(0), sy(y))
            const h = Math.abs(sy(y) - sy(0))
            return (
              <rect
                key={i}
                x={x0}
                y={top}
                width={Math.max(x1 - x0, 0.5)}
                height={h}
                fill="var(--series-2)"
                opacity={0.3}
                stroke="var(--series-2)"
                strokeWidth={1}
              />
            )
          })}
          <path d={curvePath} fill="none" stroke="var(--series-1)" strokeWidth={2.2} />
        </svg>
      )}
    </div>
  )
}

/** The integral as a limit of Riemann sums: add rectangles and watch them fill the area. */
export function IntegralPage() {
  const [expr, setExpr] = useState(PRESETS[0].expr)
  const [aRaw, setARaw] = useState(0)
  const [bRaw, setBRaw] = useState(2.4)
  const [n, setN] = useState(8)
  const [rule, setRule] = useState<Rule>('left')

  const { fn, error } = useCompiled(expr)
  const a = Math.min(aRaw, bRaw)
  const b = Math.max(aRaw, bRaw)
  const degenerate = Math.abs(b - a) < 1e-9

  const truth = fn && !degenerate ? simpson(fn, a, b) : 0
  const sum = fn && !degenerate ? riemann(fn, a, b, n, rule) : 0

  const rows = useMemo(() => {
    if (!fn || degenerate) return []
    const out: Array<{ n: number; s: number }> = []
    for (let nn = 1; nn <= 256; nn *= 2) out.push({ n: nn, s: riemann(fn, a, b, nn, rule) })
    return out
  }, [fn, a, b, rule, degenerate])

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>The integral: rectangles becoming area</h2>
          <div className="legend">
            <span className="legend-item">
              <span className="chip chip-dashed" style={{ background: 'var(--series-1)', height: 3 }} /> f(x)
            </span>
            <span className="legend-item">
              <span className="chip" style={{ background: 'var(--series-2)', opacity: 0.5 }} /> the n rectangles
            </span>
            <span className="legend-item">
              <span className="chip" style={{ background: 'var(--series-1)', opacity: 0.25 }} /> true area ∫f
            </span>
          </div>
        </div>
        <div className="lesson-text">
          <p className="card-note">
            The integral answers: <strong>how much area sits between the curve and the x-axis,
            from a to b?</strong> For a rectangle that's easy — width times height. But a curved
            roof has no ready-made area formula. So, just like with the derivative, we cheat
            with straight edges, in three steps:
          </p>
          <p className="card-note">
            <strong>1.</strong> Cut the stretch from a to b into n equal strips. Each strip has
            width
          </p>
          <Tex block tex={'\\Delta x = \\frac{b-a}{n}'} />
          <p className="card-note">
            <strong>2.</strong> On each strip, stand a rectangle. Its height is the curve's
            value at one chosen spot in the strip (the left edge, the middle, or the right edge
            — your choice above). Rectangles we <em>can</em> measure: each one contributes
            height × width, and adding all n of them gives the <em>Riemann sum</em>:
          </p>
          <Tex block tex={'\\text{total} = \\sum_{i=1}^{n} f(x_i)\\,\\Delta x'} />
          <p className="card-note">
            <strong>3.</strong> Use more, thinner strips. The error lives in the little slivers
            between the flat rectangle tops and the curve, and thinner strips leave smaller
            slivers. The integral is the value the total settles on — and the ∫ symbol is
            literally a stretched-out S, for "sum":
          </p>
          <Tex block tex={'\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i)\\,\\Delta x'} />
          <p className="card-note">
            Drag n up and watch the orange rectangles melt into the blue area. The numbers
            under the chart track your sliders.
          </p>
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
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">
              a = <strong>{a.toFixed(1)}</strong>
            </span>
            <input type="range" min={-3} max={3} step={0.1} value={aRaw} onChange={(e) => setARaw(Number(e.target.value))} />
          </label>
          <label className="field">
            <span className="field-label">
              b = <strong>{b.toFixed(1)}</strong>
            </span>
            <input type="range" min={-3} max={3} step={0.1} value={bRaw} onChange={(e) => setBRaw(Number(e.target.value))} />
          </label>
          <label className="field">
            <span className="field-label">sample height at</span>
            <select value={rule} onChange={(e) => setRule(e.target.value as Rule)}>
              <option value="left">left edge</option>
              <option value="midpoint">midpoint</option>
              <option value="right">right edge</option>
            </select>
          </label>
          <label className="field field-wide">
            <span className="field-label">
              n = <strong>{n}</strong> rectangle{n === 1 ? '' : 's'} (drag up)
            </span>
            <input type="range" min={1} max={128} value={n} onChange={(e) => setN(Number(e.target.value))} />
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            Could not evaluate f: {error}
          </p>
        )}
        {fn && degenerate && <p className="card-note">a and b coincide — the area of a zero-width region is 0. Drag them apart.</p>}
        {fn && !degenerate && (
          <>
            <RiemannChart fn={fn} a={a} b={b} n={n} rule={rule} />
            <Tex
              block
              tex={`\\sum_{i=1}^{${n}} f(x_i)\\,\\Delta x = \\mathbf{${fmt(sum, 6)}} \\qquad \\Delta x = \\frac{${fmt(b, 3)} - ${fmt(a, 3)}}{${n}} = ${fmt((b - a) / n, 4)}`}
            />
            <Tex
              block
              tex={`\\text{the limit it is heading for:}\\quad \\int_{${fmt(a, 3)}}^{${fmt(b, 3)}} f(x)\\,dx = \\mathbf{${fmt(truth, 6)}} \\qquad \\text{gap still to close: } ${fmt(Math.abs(sum - truth), 2)}`}
            />
          </>
        )}
      </section>

      {fn && !degenerate && (
        <section className="card">
          <div className="card-head">
            <h2>The limit again, as a table</h2>
          </div>
          <p className="card-note lesson-text">
            Same move as on the Derivative tab: a limit is a promise that the numbers settle,
            and a table makes the promise visible. Each row doubles the number of rectangles.
            Read down the third column and watch it stop changing — the value it locks onto is
            the integral.
          </p>
          <div className="table-wrap">
            <table className="paper-table">
              <thead>
                <tr>
                  <th>n</th>
                  <th>Δx</th>
                  <th>Riemann sum ({rule})</th>
                  <th>distance from ∫</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n}>
                    <td>{r.n}</td>
                    <td>{fmt((b - a) / r.n, 4)}</td>
                    <td>{fmt(r.s, 6)}</td>
                    <td>{fmt(Math.abs(r.s - truth), 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="card-note lesson-text">
            <strong>Try it:</strong> switch "left edge" to "midpoint" and watch the table
            settle dramatically faster. Sampling in the middle of each strip lets the
            rectangle's overshoot on one side cancel its undershoot on the other. Integrate
            sin(x) from −2 to 2 and get 0: area below the axis counts as <em>negative</em>, and
            the two halves cancel exactly. And try |x| — the corner that broke the derivative
            gives the integral no trouble at all, because adding areas doesn't care about a
            kink the way slopes do. That one-sidedness is why the fundamental theorem of
            calculus — the statement that derivative and integral undo each other — is a real
            theorem someone had to prove, not an obvious fact.
          </p>
        </section>
      )}
    </>
  )
}
