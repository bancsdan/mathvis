import { useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { add, len, mid, normalize, perp, scale, sub, type Pt } from '../lib/geometry'
import { useWidth } from './useWidth'

/** The piece of the plane the figure shows, in math units with **y up**. */
export interface GeoWorld {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * A named point of the figure. The card owns the coordinates: `GeoFigure` only
 * draws them and reports where a drag would take them.
 */
export interface GeoPoint {
  id: string
  p: Pt
  /** Plain Unicode, drawn next to the dot. KaTeX cannot live inside an SVG. */
  label?: string
  /** A CSS variable, as everywhere else. Defaults to `var(--series-1)`. */
  color?: string
  /** Give it a handle, a cursor and the arrow keys. */
  draggable?: boolean
  /** Part of the geometry but not of the picture (a construction centre). */
  hidden?: boolean
}

/** What every drawing helper accepts. Colours are CSS variables, never hex. */
export interface GeoOpts {
  color?: string
  dashed?: boolean
  /** Push it into the background: scaffolding behind the subject. */
  muted?: boolean
  width?: number
}

export interface GeoPolygonOpts extends GeoOpts {
  /** Outline only. Otherwise the polygon is washed with its colour at 25%. */
  fill?: boolean
}

export interface GeoAngleOpts extends GeoOpts {
  /** Plain Unicode written on the bisector, outside the arc. */
  label?: string
  /** Draw the square corner instead of the arc. */
  right?: boolean
  /** Pixels, not world units: a mark keeps its size as the figure moves. */
  radius?: number
}

export interface GeoLabelOpts extends GeoOpts {
  /** Pixel offsets from the point, positive dy being down the screen. */
  dx?: number
  dy?: number
  anchor?: 'start' | 'middle' | 'end'
}

export interface GeoLengthOpts extends GeoOpts {
  /** Which side of the segment the text sits on. */
  side?: 1 | -1
  /** How far off the segment, in pixels. */
  offset?: number
}

/**
 * The drawing kit a card is handed. Every helper returns SVG, so a card writes
 * `{(g) => <>{g.segment(A, B)}{g.angle(A, B, C, { label: 'α' })}</>}` and never
 * converts a coordinate itself.
 */
export interface Draw {
  segment(A: Pt, B: Pt, opts?: GeoOpts): ReactNode
  /** The whole line AB, drawn to the edges of the world box. */
  line(A: Pt, B: Pt, opts?: GeoOpts): ReactNode
  /** From A through B and on to the edge of the world box. */
  ray(A: Pt, B: Pt, opts?: GeoOpts): ReactNode
  polygon(pts: readonly Pt[], opts?: GeoPolygonOpts): ReactNode
  circle(O: Pt, r: number, opts?: GeoOpts): ReactNode
  /** Counter-clockwise from `fromDeg` to `toDeg`, measured as in maths. */
  arc(O: Pt, r: number, fromDeg: number, toDeg: number, opts?: GeoAngleOpts): ReactNode
  /** The mark of the angle ∠ABC, at B. */
  angle(A: Pt, B: Pt, C: Pt, opts?: GeoAngleOpts): ReactNode
  label(P: Pt, text: string, opts?: GeoLabelOpts): ReactNode
  /** A measurement written across the middle of AB, with its tick. */
  length(A: Pt, B: Pt, text: string, opts?: GeoLengthOpts): ReactNode
  vector(A: Pt, B: Pt, opts?: GeoOpts): ReactNode
  /** World → pixel, for the rare figure that places raw SVG of its own. */
  x(v: number): number
  y(v: number): number
  /** A world length in pixels, for sizing something by the figure's scale. */
  u(d: number): number
}

interface Props {
  world: GeoWorld
  height?: number
  ariaLabel: string
  points?: readonly GeoPoint[]
  /** Where the reader dragged the point to, already clamped. */
  onDrag?: (id: string, p: Pt) => void
  /** Constrain a dragged point — to a circle, a line, a grid. */
  clamp?: (id: string, p: Pt) => Pt
  children: (g: Draw) => ReactNode
}

const PAD = 14
const HANDLE_R = 7
const DOT_R = 4.5
const ANGLE_R = 24
const DEFAULT_COLOR = 'var(--series-1)'
/** One arrowhead per colour a vector may take: a marker cannot inherit one. */
const ARROW_COLORS = [
  DEFAULT_COLOR,
  'var(--series-2)',
  'var(--series-3)',
  'var(--accent-select)',
  'var(--axis)',
]

const stroke = (opts?: GeoOpts) => ({
  stroke: opts?.color ?? DEFAULT_COLOR,
  strokeWidth: opts?.width ?? 2,
  strokeDasharray: opts?.dashed ? '6 4' : undefined,
  className: opts?.muted ? 'geo-muted' : undefined,
})

/**
 * The stretch of the line `A + t·d` that stays inside the world box, clipped
 * against the four edges (Liang–Barsky). `tMin` 0 makes it a ray from A.
 */
function clipToWorld(A: Pt, d: Pt, w: GeoWorld, tMin: number, tMax: number): [Pt, Pt] | null {
  if (len(d) < 1e-12) return null
  let lo = tMin
  let hi = tMax
  const edges: Array<[number, number]> = [
    [-d.x, A.x - w.minX],
    [d.x, w.maxX - A.x],
    [-d.y, A.y - w.minY],
    [d.y, w.maxY - A.y],
  ]
  for (const [p, q] of edges) {
    if (Math.abs(p) < 1e-12) {
      if (q < 0) return null
      continue
    }
    const t = q / p
    if (p < 0) lo = Math.max(lo, t)
    else hi = Math.min(hi, t)
  }
  if (lo > hi) return null
  return [add(A, scale(d, lo)), add(A, scale(d, hi))]
}

/**
 * One geometric figure: a world box in math coordinates, whatever the card
 * draws in it, and the points the reader can move.
 *
 * The scale is the same on both axes — a circle has to stay a circle and a
 * right angle has to look right — so the world box is centred in whatever
 * width the column gives and the leftover is margin.
 *
 * Dragging works with the mouse, with a finger and with the arrow keys. The
 * handles sit inside an SVG that is `role="img"`, so assistive technology does
 * not see them: pair every figure with ordinary controls, the way the rest of
 * the site does.
 */
export function GeoFigure({
  world,
  height = 300,
  ariaLabel,
  points = [],
  onDrag,
  clamp,
  children,
}: Props) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<string | null>(null)
  // React's useId contains characters that are awkward inside url(#…).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const worldW = world.maxX - world.minX || 1
  const worldH = world.maxY - world.minY || 1
  const boxW = Math.max(width - 2 * PAD, 10)
  const boxH = Math.max(height - 2 * PAD, 10)
  const k = Math.min(boxW / worldW, boxH / worldH)
  const ox = PAD + (boxW - k * worldW) / 2
  const oy = PAD + (boxH - k * worldH) / 2

  const X = (v: number) => ox + (v - world.minX) * k
  const Y = (v: number) => oy + (world.maxY - v) * k
  const U = (d: number) => d * k
  /** Pixel → world, for a pointer position measured against the svg box. */
  const toWorld = (px: number, py: number): Pt => ({
    x: world.minX + (px - ox) / k,
    y: world.maxY - (py - oy) / k,
  })

  const move = (id: string, p: Pt) => onDrag?.(id, clamp ? clamp(id, p) : p)

  const onPointerDown = (e: React.PointerEvent<SVGGElement>, id: string) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.focus({ preventScroll: true })
    dragging.current = id
  }

  const onPointerMove = (e: React.PointerEvent<SVGGElement>, id: string) => {
    if (dragging.current !== id) return
    const box = svgRef.current?.getBoundingClientRect()
    if (!box) return
    move(id, toWorld(e.clientX - box.left, e.clientY - box.top))
  }

  const onPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragging.current = null
  }

  // A fortieth of the world for a nudge, an eighth with Shift: fine enough to
  // land on a value, coarse enough to cross the figure in a few presses.
  const onKeyDown = (e: React.KeyboardEvent<SVGGElement>, pt: GeoPoint) => {
    const step = worldW / (e.shiftKey ? 8 : 40)
    const by: Record<string, Pt> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    }
    const delta = by[e.key]
    if (!delta) return
    e.preventDefault()
    move(pt.id, add(pt.p, delta))
  }

  const g: Draw = {
    x: X,
    y: Y,
    u: U,

    segment: (A, B, opts) => (
      <line x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)} strokeLinecap="round" {...stroke(opts)} />
    ),

    line: (A, B, opts) => {
      const seg = clipToWorld(A, sub(B, A), world, -Infinity, Infinity)
      return seg && g.segment(seg[0], seg[1], opts)
    },

    ray: (A, B, opts) => {
      const seg = clipToWorld(A, sub(B, A), world, 0, Infinity)
      return seg && g.segment(seg[0], seg[1], opts)
    },

    polygon: (pts, opts) => {
      const color = opts?.color ?? DEFAULT_COLOR
      return (
        <polygon
          points={pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}
          fill={opts?.fill === false ? 'none' : color}
          fillOpacity={opts?.fill === false ? undefined : 0.25}
          strokeLinejoin="round"
          {...stroke(opts)}
        />
      )
    },

    circle: (O, r, opts) => (
      <circle cx={X(O.x)} cy={Y(O.y)} r={Math.max(U(r), 0)} fill="none" {...stroke(opts)} />
    ),

    arc: (O, r, fromDeg, toDeg, opts) => {
      const at = (a: number) => ({
        x: X(O.x + r * Math.cos((a * Math.PI) / 180)),
        y: Y(O.y + r * Math.sin((a * Math.PI) / 180)),
      })
      const sweep = toDeg >= fromDeg ? 0 : 1 // y grows downwards on the screen
      const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
      const s = at(fromDeg)
      const e = at(toDeg)
      const rr = Math.max(U(r), 0)
      return (
        <path
          d={`M${s.x},${s.y} A${rr},${rr} 0 ${large} ${sweep} ${e.x},${e.y}`}
          fill="none"
          strokeLinecap="round"
          {...stroke(opts)}
        />
      )
    },

    // Worked in pixels: the mark keeps its size however the figure is scaled.
    angle: (A, B, C, opts) => {
      const b = { x: X(B.x), y: Y(B.y) }
      const u = normalize({ x: X(A.x) - b.x, y: Y(A.y) - b.y })
      const v = normalize({ x: X(C.x) - b.x, y: Y(C.y) - b.y })
      if (len(u) === 0 || len(v) === 0) return null
      const r = opts?.radius ?? ANGLE_R
      const color = opts?.color ?? 'var(--axis)'
      const bisector = normalize(add(u, v))
      const text = opts?.label && (
        <text
          x={b.x + bisector.x * (r + 14)}
          y={b.y + bisector.y * (r + 14)}
          textAnchor="middle"
          dominantBaseline="middle"
          className={opts?.muted ? 'geo-label geo-muted' : 'geo-label'}
          fill={color}
        >
          {opts.label}
        </text>
      )
      const marks = opts?.right ? (
        // The square corner: along one arm, across, back along the other.
        <path
          d={`M${b.x + u.x * r},${b.y + u.y * r} L${b.x + (u.x + v.x) * r},${b.y + (u.y + v.y) * r} L${b.x + v.x * r},${b.y + v.y * r}`}
          fill="none"
          {...stroke({ ...opts, color })}
        />
      ) : (
        <path
          d={`M${b.x + u.x * r},${b.y + u.y * r} A${r},${r} 0 0 ${u.x * v.y - u.y * v.x > 0 ? 1 : 0} ${b.x + v.x * r},${b.y + v.y * r}`}
          fill="none"
          {...stroke({ ...opts, color })}
        />
      )
      return (
        <>
          {marks}
          {text}
        </>
      )
    },

    label: (P, text, opts) => (
      <text
        x={X(P.x) + (opts?.dx ?? 0)}
        y={Y(P.y) + (opts?.dy ?? 0)}
        textAnchor={opts?.anchor ?? 'middle'}
        dominantBaseline="middle"
        className={opts?.muted ? 'geo-label geo-muted' : 'geo-label'}
        fill={opts?.color ?? 'var(--text-primary)'}
      >
        {text}
      </text>
    ),

    length: (A, B, text, opts) => {
      const m = mid(A, B)
      const d = normalize({ x: X(B.x) - X(A.x), y: Y(B.y) - Y(A.y) })
      const n = perp(d)
      const side = opts?.side ?? 1
      const off = (opts?.offset ?? 14) * side
      const color = opts?.color ?? 'var(--text-secondary)'
      const cx = X(m.x)
      const cy = Y(m.y)
      return (
        <>
          <line
            x1={cx - n.x * 5}
            y1={cy - n.y * 5}
            x2={cx + n.x * 5}
            y2={cy + n.y * 5}
            {...stroke({ ...opts, color, width: opts?.width ?? 1.5, dashed: false })}
          />
          <text
            x={cx + n.x * off}
            y={cy + n.y * off}
            textAnchor="middle"
            dominantBaseline="middle"
            className={opts?.muted ? 'geo-label geo-muted' : 'geo-label'}
            fill={color}
          >
            {text}
          </text>
        </>
      )
    },

    // One marker per colour: a marker cannot inherit the stroke it hangs on.
    // An unlisted colour falls back to the first arrowhead.
    vector: (A, B, opts) => {
      const color = opts?.color ?? DEFAULT_COLOR
      const i = Math.max(ARROW_COLORS.indexOf(color), 0)
      return (
        <line
          x1={X(A.x)}
          y1={Y(A.y)}
          x2={X(B.x)}
          y2={Y(B.y)}
          markerEnd={`url(#geo-arrow-${i}-${uid})`}
          {...stroke({ ...opts, color })}
        />
      )
    },
  }

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg ref={svgRef} width={width} height={height} role="img" aria-label={ariaLabel}>
          <defs>
            {ARROW_COLORS.map((color, i) => (
              <marker
                key={color}
                id={`geo-arrow-${i}-${uid}`}
                markerWidth={7}
                markerHeight={7}
                refX={6}
                refY={3}
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill={color} />
              </marker>
            ))}
          </defs>

          {children(g)}

          {points
            .filter((pt) => !pt.hidden)
            .map((pt) => {
              const color = pt.color ?? DEFAULT_COLOR
              const dot = (
                <>
                  <circle
                    cx={X(pt.p.x)}
                    cy={Y(pt.p.y)}
                    r={pt.draggable ? HANDLE_R : DOT_R}
                    fill={color}
                    fillOpacity={pt.draggable ? 0.85 : 1}
                    stroke="var(--surface)"
                    strokeWidth={pt.draggable ? 2 : 1}
                  />
                  {pt.label && (
                    <text
                      x={X(pt.p.x) + 12}
                      y={Y(pt.p.y) - 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="geo-label"
                      fill={color}
                    >
                      {pt.label}
                    </text>
                  )}
                </>
              )
              if (!pt.draggable) return <g key={pt.id}>{dot}</g>
              return (
                <g
                  key={pt.id}
                  className="geo-point"
                  tabIndex={0}
                  role="button"
                  aria-label={`${pt.label ?? pt.id}: ${t('geo.dragHint')}`}
                  onPointerDown={(e) => onPointerDown(e, pt.id)}
                  onPointerMove={(e) => onPointerMove(e, pt.id)}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onKeyDown={(e) => onKeyDown(e, pt)}
                >
                  {/* A finger needs more than seven pixels to hold on to. */}
                  <circle cx={X(pt.p.x)} cy={Y(pt.p.y)} r={HANDLE_R + 9} fill="transparent" />
                  {dot}
                </g>
              )
            })}
        </svg>
      )}
    </div>
  )
}
