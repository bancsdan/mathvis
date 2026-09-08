import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { inR, type RegionSet } from '../lib/sets'
import { dotSlots, outsideCirclePath, regionAnchors, signatureAt, vennConfig } from '../lib/venn'
import { useWidth } from './useWidth'

const SET_LABELS = ['A', 'B', 'C']

interface Props {
  n: 2 | 3
  /** Regions to shade as the result. */
  shaded: RegionSet
  height?: number
  /** Click a region. Supplying this also makes the diagram look clickable. */
  onToggleRegion?: (sig: number) => void
  /** Element ids per region signature, drawn as numbered dots. */
  elements?: number[][]
  /** Per-region counts, drawn as a big number at the region's anchor. */
  counts?: number[]
  /** Small badge per region, used for "counted N times" during the sieve. */
  badges?: Array<string | null>
  /** Region highlighted from outside, e.g. by hovering a truth table row. */
  highlight?: number | null
  onHoverRegion?: (sig: number | null) => void
  labelKey?: string
}

/**
 * Two or three circles with an arbitrary set of regions shaded.
 *
 * Shading uses one SVG mask per region rather than computed arc paths, so no
 * circle-intersection geometry is needed and the same code serves both two and
 * three circles. Hit-testing ignores the drawn shapes entirely and asks the
 * geometry which circles contain the pointer.
 */
export function VennDiagram({
  n,
  shaded,
  height = 300,
  onToggleRegion,
  elements,
  counts,
  badges,
  highlight = null,
  onHoverRegion,
  labelKey = 'venn.aria',
}: Props) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  // React's useId contains characters that are awkward inside url(#…).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const cfg = useMemo(() => vennConfig(n, Math.max(width, 1), height), [n, width, height])
  const anchors = useMemo(() => regionAnchors(cfg), [cfg])

  const regions = Array.from({ length: 1 << n }, (_, sig) => sig)
  const maskId = (sig: number) => `venn-${uid}-r${sig}`
  const shownHighlight = highlight ?? hover

  const setHovered = (sig: number | null) => {
    setHover(sig)
    onHoverRegion?.(sig)
  }

  const sigFromEvent = (e: React.MouseEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    return signatureAt(cfg, e.clientX - box.left, e.clientY - box.top)
  }

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={t(labelKey, { n })}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            {regions.map((sig) => (
              <mask key={sig} id={maskId(sig)} maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
                {/* White and black here are mask luminance, not visible paint,
                    so they stay literal in both colour schemes. */}
                <rect x={0} y={0} width={width} height={height} fill="#fff" />
                {cfg.circles.map((c, i) =>
                  (sig >> i) & 1 ? (
                    // Keep only what is inside circle i: black out everything else.
                    <path key={i} d={outsideCirclePath(c, width, height)} fill="#000" fillRule="evenodd" />
                  ) : (
                    // Remove circle i entirely.
                    <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#000" />
                  ),
                )}
              </mask>
            ))}
          </defs>

          <rect
            x={0.5}
            y={0.5}
            width={width - 1}
            height={height - 1}
            rx={8}
            fill="none"
            stroke="var(--axis)"
          />
          <text x={8} y={16} className="tick-text">
            {t('venn.universe')}
          </text>

          {regions
            .filter((sig) => inR(shaded, sig))
            .map((sig) => (
              <rect
                key={sig}
                x={0}
                y={0}
                width={width}
                height={height}
                fill="var(--accent-select)"
                opacity={0.28}
                mask={`url(#${maskId(sig)})`}
                pointerEvents="none"
              />
            ))}

          {shownHighlight !== null && (
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="var(--hover-wash)"
              mask={`url(#${maskId(shownHighlight)})`}
              pointerEvents="none"
            />
          )}

          {cfg.circles.map((c, i) => (
            <circle
              key={i}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill="none"
              stroke={`var(--series-${i + 1})`}
              strokeWidth={2}
              pointerEvents="none"
            />
          ))}

          {cfg.circles.map((c, i) => {
            // Push the label out from the diagram centre so it clears the circles.
            const ux = c.cx - width / 2
            const uy = c.cy - height / 2
            const len = Math.hypot(ux, uy) || 1
            return (
              <text
                key={i}
                x={c.cx + (ux / len) * (c.r - 14)}
                y={c.cy + (uy / len) * (c.r - 14) + 5}
                textAnchor="middle"
                className="point-label"
                fill={`var(--series-${i + 1})`}
                pointerEvents="none"
              >
                {SET_LABELS[i]}
              </text>
            )
          })}

          {/* One hit surface for the whole diagram, above the decoration. */}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            style={{ cursor: onToggleRegion ? 'pointer' : 'default' }}
            onMouseMove={(e) => setHovered(sigFromEvent(e))}
            onClick={onToggleRegion ? (e) => onToggleRegion(sigFromEvent(e)) : undefined}
          />

          {counts?.map((count, sig) =>
            anchors[sig] && anchors[sig].rIn > 8 ? (
              <text
                key={`c${sig}`}
                x={anchors[sig].x}
                y={anchors[sig].y + 5}
                textAnchor="middle"
                className="point-label"
                pointerEvents="none"
              >
                {count}
              </text>
            ) : null,
          )}

          {badges?.map((badge, sig) =>
            badge && anchors[sig] && anchors[sig].rIn > 8 ? (
              <text
                key={`b${sig}`}
                x={anchors[sig].x}
                y={anchors[sig].y + (counts ? 20 : 5)}
                textAnchor="middle"
                className="tick-text"
                pointerEvents="none"
              >
                {badge}
              </text>
            ) : null,
          )}

          {elements?.map((ids, sig) =>
            anchors[sig]
              ? dotSlots(anchors[sig], ids.length).map(([x, y], k) => (
                  <g key={`e${sig}-${ids[k]}`} pointerEvents="none">
                    <circle cx={x} cy={y} r={9} fill="var(--surface)" stroke="var(--axis)" />
                    <text x={x} y={y + 4} textAnchor="middle" className="tick-text">
                      {ids[k]}
                    </text>
                  </g>
                ))
              : null,
          )}
        </svg>
      )}
    </div>
  )
}
