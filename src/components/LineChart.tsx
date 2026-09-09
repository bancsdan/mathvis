import { useMemo, useState } from 'react'
import { niceTicks, tickLabel } from '../lib/ticks'
import { useWidth } from './useWidth'

export interface LineSeries {
  name: string
  color: string
  values: number[]
  dashed?: boolean
  /** Shade the area between the curve and y = 0. */
  area?: boolean
}

interface Props {
  xs: number[]
  series: LineSeries[]
  height?: number
  xLabel: string
  yLabel: string
  /** Fixed y-domain (e.g. to share a scale across small multiples). */
  yDomain?: [number, number]
  /** Small-multiple mode: fewer ticks, no x-axis labels. */
  compact?: boolean
  /** How a y value is written, for series the default notation reads badly on
      (money, say, where `1.0e+5` helps nobody). */
  format?: (v: number) => string
  /** Fixed spacing of the x ticks, for axes that count whole things (years). */
  xStep?: number
}

export function LineChart({
  xs,
  series,
  height = 260,
  xLabel,
  yLabel,
  yDomain,
  compact = false,
  format,
  xStep,
}: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const writeY = format ?? tickLabel

  const M = { top: compact ? 6 : 12, right: 30, bottom: compact ? 8 : 30, left: 52 }
  const plotW = Math.max(width - M.left - M.right, 10)
  const plotH = height - M.top - M.bottom

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const xMin = xs[0] ?? 0
    const xMax = xs[xs.length - 1] ?? 1
    if (yDomain) return { xMin, xMax, yMin: yDomain[0], yMax: yDomain[1] }
    let lo = Infinity
    let hi = -Infinity
    for (const s of series) {
      for (const v of s.values) {
        if (v < lo) lo = v
        if (v > hi) hi = v
      }
    }
    if (!Number.isFinite(lo)) {
      lo = 0
      hi = 1
    }
    const pad = (hi - lo || 1) * 0.08
    return { xMin, xMax, yMin: lo - pad, yMax: hi + pad }
  }, [xs, series, yDomain])

  const sx = (x: number) => M.left + ((x - xMin) / (xMax - xMin || 1)) * plotW
  const sy = (y: number) => M.top + (1 - (y - yMin) / (yMax - yMin || 1)) * plotH

  const yTicks = niceTicks(yMin, yMax, compact ? 2 : 4)
  const xTicks = compact
    ? []
    : xStep
      ? Array.from({ length: Math.floor((xMax - xMin) / xStep + 1e-9) + 1 }, (_, i) => xMin + i * xStep)
      : niceTicks(xMin, xMax, 6)

  const paths = useMemo(
    () =>
      series.map((s) =>
        s.values
          .map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(xs[i]).toFixed(2)},${sy(v).toFixed(2)}`)
          .join('')
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, xs, width, yMin, yMax, height]
  )

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left - M.left
    const i = Math.round((px / plotW) * (xs.length - 1))
    setHover(i >= 0 && i < xs.length ? i : null)
  }

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${yLabel || series[0]?.name || 'value'} versus ${xLabel}`}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line
                x1={M.left}
                x2={M.left + plotW}
                y1={sy(t)}
                y2={sy(t)}
                stroke={t === 0 ? 'var(--axis)' : 'var(--grid)'}
                strokeWidth={1}
              />
              <text x={M.left - 8} y={sy(t) + 4} textAnchor="end" className="tick-text">
                {writeY(t)}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={`x${t}`}
              x={sx(t)}
              y={M.top + plotH + 18}
              textAnchor="middle"
              className="tick-text"
            >
              {tickLabel(t)}
            </text>
          ))}
          {!compact && (
            <text
              x={M.left + plotW + 8}
              y={M.top + plotH + 18}
              textAnchor="start"
              className="axis-label"
            >
              {xLabel}
            </text>
          )}
          {series.map(
            (s, si) =>
              s.area && (
                <path
                  key={`area-${s.name}`}
                  d={`${paths[si]}L${sx(xs[xs.length - 1]).toFixed(2)},${sy(0).toFixed(2)}L${sx(
                    xs[0]
                  ).toFixed(2)},${sy(0).toFixed(2)}Z`}
                  fill={s.color}
                  opacity={0.22}
                  stroke="none"
                />
              )
          )}
          {series.map((s, si) => (
            <path
              key={s.name}
              d={paths[si]}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '6 4' : undefined}
              strokeLinejoin="round"
            />
          ))}
          {hover !== null && (
            <g>
              <line
                x1={sx(xs[hover])}
                x2={sx(xs[hover])}
                y1={M.top}
                y2={M.top + plotH}
                stroke="var(--axis)"
                strokeWidth={1}
              />
              {series.map((s) => (
                <circle
                  key={s.name}
                  cx={sx(xs[hover])}
                  cy={sy(s.values[hover])}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div
          className="tooltip"
          style={{
            left: Math.min(sx(xs[hover]) + 12, width - 170),
            top: M.top + 4,
          }}
        >
          <div className="tooltip-title">
            {xLabel} = {xs[hover].toPrecision(4)}
          </div>
          {series.map((s) => (
            <div key={s.name} className="tooltip-row">
              <span className="chip" style={{ background: s.color }} />
              <span className="tooltip-name">{s.name}</span>
              <span className="tooltip-value">
                {format ? format(s.values[hover]) : s.values[hover].toPrecision(4)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
