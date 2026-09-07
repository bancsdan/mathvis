import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Bin } from '../lib/analysis'
import { niceTicks, tickLabel } from '../lib/ticks'
import { useWidth } from './useWidth'

interface Props {
  bins: Bin[]
  kept: Set<number>
  height?: number
  /** Bin currently inspected in the explainer. */
  selected?: number
  onSelect?: (k: number) => void
}

const M = { top: 12, right: 30, bottom: 30, left: 52 }

/** One-sided magnitude spectrum as a bar chart. Kept bins are colored, discarded bins muted. */
export function SpectrumChart({ bins, kept, height = 220, selected, onSelect }: Props) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const plotW = Math.max(width - M.left - M.right, 10)
  const plotH = height - M.top - M.bottom

  const maxAmp = Math.max(...bins.map((b) => b.amplitude), 1e-12)
  const yMax = maxAmp * 1.08
  const yTicks = niceTicks(0, yMax, 4)

  const slot = plotW / bins.length
  const gap = slot > 4 ? 2 : slot > 2 ? 1 : 0
  const barW = Math.max(slot - gap, 1)
  const sy = (v: number) => M.top + (1 - v / yMax) * plotH
  const bx = (i: number) => M.left + i * slot

  const fTicks = niceTicks(0, bins[bins.length - 1]?.freq ?? 1, 6)
  const fToX = (f: number) =>
    M.left + (f / (bins[bins.length - 1]?.freq || 1)) * (plotW - slot) + barW / 2

  const b = hover !== null ? bins[hover] : null

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={t('chart.spectrumAria')}
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
                {tickLabel(t)}
              </text>
            </g>
          ))}
          {fTicks.map((t) => (
            <text key={`f${t}`} x={fToX(t)} y={M.top + plotH + 18} textAnchor="middle" className="tick-text">
              {tickLabel(t)}
            </text>
          ))}
          <text x={M.left + plotW + 8} y={M.top + plotH + 18} textAnchor="start" className="axis-label">
            f
          </text>
          {bins.map((bin, i) => {
            const h = Math.max(((bin.amplitude / yMax) * plotH), bin.amplitude > 1e-9 ? 1 : 0)
            return (
              <rect
                key={bin.k}
                x={bx(i)}
                y={M.top + plotH - h}
                width={barW}
                height={h}
                rx={Math.min(2, barW / 2)}
                fill={kept.has(bin.k) ? 'var(--series-1)' : 'var(--mark-muted)'}
              />
            )
          })}
          {/* full-height hit targets, larger than the marks */}
          {bins.map((bin, i) => (
            <rect
              key={`hit${bin.k}`}
              x={bx(i) - gap / 2}
              y={M.top}
              width={slot}
              height={plotH}
              fill="transparent"
              style={onSelect ? { cursor: 'pointer' } : undefined}
              onMouseEnter={() => setHover(i)}
              onClick={onSelect ? () => onSelect(bin.k) : undefined}
            />
          ))}
          {selected !== undefined && selected >= 0 && selected < bins.length && (
            <rect
              x={bx(selected) - 2}
              y={M.top - 2}
              width={barW + 4}
              height={plotH + 4}
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth={1.5}
              rx={3}
              pointerEvents="none"
            />
          )}
          {b !== null && (
            <rect
              x={bx(hover!)}
              y={M.top}
              width={barW}
              height={plotH}
              fill="var(--hover-wash)"
              pointerEvents="none"
            />
          )}
        </svg>
      )}
      {b !== null && width > 0 && (
        <div
          className="tooltip"
          style={{ left: Math.min(bx(hover!) + 12, width - 190), top: M.top + 4 }}
        >
          <div className="tooltip-title">
            f = {b.freq.toPrecision(4)} · bin k = {b.k}
          </div>
          <div className="tooltip-row">
            <span className="chip" style={{ background: kept.has(b.k) ? 'var(--series-1)' : 'var(--mark-muted)' }} />
            <span className="tooltip-name">{t('chart.amplitude')}</span>
            <span className="tooltip-value">{b.amplitude.toPrecision(4)}</span>
          </div>
          <div className="tooltip-row">
            <span className="chip" style={{ visibility: 'hidden' }} />
            <span className="tooltip-name">{t('chart.phase')}</span>
            <span className="tooltip-value">{((b.phase * 180) / Math.PI).toFixed(1)}°</span>
          </div>
          <div className="tooltip-row">
            <span className="chip" style={{ visibility: 'hidden' }} />
            <span className="tooltip-name">{t('chart.status')}</span>
            <span className="tooltip-value">{kept.has(b.k) ? t('chart.kept') : t('chart.discarded')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
