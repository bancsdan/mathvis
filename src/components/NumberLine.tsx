import type { ReactNode } from 'react'
import { useWidth } from './useWidth'

/** A dot sitting on the line. `label` is plain text — KaTeX cannot go in an SVG. */
export interface LinePointMark {
  id: string
  value: number
  label?: string
  color: string
  /** Draw the circle empty, the way an excluded endpoint is drawn. */
  hollow?: boolean
  /** Push it into the background: one point is the subject, the rest are context. */
  muted?: boolean
}

/** A stretch of the line, with each end either taken along or left out. */
export interface LineSegmentMark {
  from: number
  to: number
  leftClosed: boolean
  rightClosed: boolean
  color: string
}

interface Props {
  min: number
  max: number
  /** Where to put the ticks. Defaults to the whole numbers in range. */
  ticks?: number[]
  /** How a tick is written. Defaults to plain digits. */
  tickText?: (v: number) => string
  points?: readonly LinePointMark[]
  segments?: readonly LineSegmentMark[]
  /** A faint band, used by the zoom panel to show the interval being entered. */
  highlight?: { from: number; to: number }
  height?: number
  ariaLabel: string
  /** Extra SVG on top, given the scale and the height of the axis. */
  extra?: (x: (v: number) => number, axisY: number) => ReactNode
}

const MARGIN = 30
/** Two labels closer than this share the space by sitting on different rows. */
const CROWDED = 36

const wholeNumbers = (min: number, max: number): number[] => {
  const out: number[] = []
  for (let v = Math.ceil(min); v <= max; v++) out.push(v)
  return out
}

/**
 * One number line: ticks, dots and intervals on a single axis.
 *
 * Everything is placed through the same scale, so a point and the segment it
 * falls in always line up.
 */
export function NumberLine({
  min,
  max,
  ticks,
  tickText = String,
  points = [],
  segments = [],
  highlight,
  height = 108,
  ariaLabel,
  extra,
}: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const plotW = Math.max(width - 2 * MARGIN, 10)
  const x = (v: number) => MARGIN + (plotW * (v - min)) / (max - min)
  const axisY = height - 34
  const marks = ticks ?? wholeNumbers(min, max)

  // Labels of neighbouring dots would overlap, so every crowded one steps up a
  // row instead of being dropped.
  const rows = new Map<string, number>()
  let prevX = -Infinity
  let prevRow = 1
  for (const p of [...points].filter((p) => p.label).sort((a, b) => a.value - b.value)) {
    const row = x(p.value) - prevX < CROWDED ? 1 - prevRow : 0
    rows.set(p.id, row)
    prevX = x(p.value)
    prevRow = row
  }

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {highlight && (
            <rect
              x={x(highlight.from)}
              y={8}
              width={Math.max(x(highlight.to) - x(highlight.from), 2)}
              height={axisY - 8}
              fill="var(--accent-select)"
              fillOpacity={0.14}
            />
          )}

          <line x1={MARGIN - 12} y1={axisY} x2={width - MARGIN + 12} y2={axisY} stroke="var(--axis)" />
          <path
            d={`M${width - MARGIN + 4},${axisY - 4} L${width - MARGIN + 12},${axisY} L${width - MARGIN + 4},${axisY + 4}`}
            fill="none"
            stroke="var(--axis)"
          />

          {marks.map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={axisY - 5} x2={x(v)} y2={axisY + 5} stroke="var(--axis)" />
              <text x={x(v)} y={axisY + 20} textAnchor="middle" className="tick-text">
                {tickText(v)}
              </text>
            </g>
          ))}

          {segments.map((seg, i) => (
            <g key={`seg-${i}`}>
              <line
                x1={x(Math.max(min, seg.from))}
                y1={axisY}
                x2={x(Math.min(max, seg.to))}
                y2={axisY}
                stroke={seg.color}
                strokeWidth={5}
                strokeLinecap="butt"
              />
              {/* An end beyond the axis (a half-line, given as ±Infinity) is
                  clipped and gets no marker, so it cannot be read as a bound. */}
              {seg.from >= min && (
                <circle
                  cx={x(seg.from)}
                  cy={axisY}
                  r={5}
                  fill={seg.leftClosed ? seg.color : 'var(--surface)'}
                  stroke={seg.color}
                  strokeWidth={2}
                />
              )}
              {seg.to <= max && (
                <circle
                  cx={x(seg.to)}
                  cy={axisY}
                  r={5}
                  fill={seg.rightClosed ? seg.color : 'var(--surface)'}
                  stroke={seg.color}
                  strokeWidth={2}
                />
              )}
            </g>
          ))}

          {points.map((p) => {
            const row = rows.get(p.id) ?? 0
            return (
              <g key={p.id} opacity={p.muted ? 0.4 : 1}>
                <circle
                  cx={x(p.value)}
                  cy={axisY}
                  r={p.muted ? 3.5 : 5.5}
                  fill={p.hollow ? 'var(--surface)' : p.color}
                  stroke={p.color}
                  strokeWidth={2}
                />
                {p.label && (
                  <>
                    <line
                      x1={x(p.value)}
                      y1={axisY - 8}
                      x2={x(p.value)}
                      y2={axisY - 14 - row * 15}
                      stroke={p.color}
                      strokeOpacity={0.5}
                    />
                    <text
                      x={x(p.value)}
                      y={axisY - 18 - row * 15}
                      textAnchor="middle"
                      className="line-label"
                      fill={p.color}
                    >
                      {p.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {extra?.(x, axisY)}
        </svg>
      )}
    </div>
  )
}
