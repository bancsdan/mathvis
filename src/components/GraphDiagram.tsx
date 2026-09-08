import type { Edge } from '../lib/combinatorics'
import { degrees } from '../lib/combinatorics'
import { useWidth } from './useWidth'

interface Props {
  n: number
  edges: readonly Edge[]
  /** Vertex captions; defaults to 1…n. */
  labels?: readonly string[]
  /** Write each vertex's degree just outside the circle. */
  showDegrees?: boolean
  /** Vertex waiting for its partner, drawn in the accent colour. */
  selected?: number | null
  /** Supplying this makes the vertices clickable. Pair it with buttons. */
  onVertexClick?: (i: number) => void
  ariaLabel: string
  height?: number
}

/**
 * Vertices spread evenly on a circle, edges as straight chords.
 *
 * The circle layout means no edge is ever hidden behind a vertex and the
 * picture stays recognisable as the student adds and removes edges — the same
 * graph always looks the same way.
 */
export function GraphDiagram({
  n,
  edges,
  labels,
  showDegrees = false,
  selected = null,
  onVertexClick,
  ariaLabel,
  height = 300,
}: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()

  const cx = Math.max(width, 1) / 2
  const cy = height / 2
  // Vertices are wide enough for their caption, and the ring leaves room for
  // the degree written just outside it.
  const longest = Math.max(1, ...Array.from({ length: n }, (_, i) => String(labels?.[i] ?? i + 1).length))
  const vertexR = Math.max(17, 6 + 3.4 * longest)
  const radius = Math.max(40, Math.min(Math.max(width, 1), height) / 2 - vertexR - 16)
  const at = (i: number) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  const deg = degrees(n, edges)

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {edges.map(([a, b]) => {
            const pa = at(a)
            const pb = at(b)
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke="var(--series-1)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            )
          })}
          {Array.from({ length: n }, (_, i) => {
            const p = at(i)
            const isSelected = selected === i
            const dx = (p.x - cx) / radius
            const dy = (p.y - cy) / radius
            return (
              <g
                key={i}
                onClick={onVertexClick ? () => onVertexClick(i) : undefined}
                style={onVertexClick ? { cursor: 'pointer' } : undefined}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={vertexR}
                  fill="var(--surface)"
                  stroke={isSelected ? 'var(--accent-select)' : 'var(--text-primary)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  fontSize={11}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                >
                  {labels?.[i] ?? i + 1}
                </text>
                {showDegrees && (
                  <text
                    x={p.x + dx * (vertexR + 13)}
                    y={p.y + dy * (vertexR + 13) + 4}
                    fontSize={11}
                    textAnchor="middle"
                    fill="var(--series-2)"
                  >
                    {deg[i]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
