import { useId } from 'react'
import { useWidth } from './useWidth'

export interface ArrowNode {
  id: string
  label: string
}

interface Props {
  left: readonly ArrowNode[]
  right: readonly ArrowNode[]
  /** `arrows[leftId]` lists the right ids that node points to. */
  arrows: Readonly<Record<string, readonly string[]>>
  /** One node to tint, usually the one that spoils the property being tested. */
  lit?: { leftId?: string; rightId?: string }
  ariaLabel: string
}

const ROW = 46
const PAD_Y = 18

/**
 * Two columns of labelled nodes with arrows between them.
 *
 * Purely presentational: it draws the arrows it is given and never edits them,
 * so the card can keep the editing in ordinary form controls and the picture
 * stays operable from the keyboard.
 */
export function ArrowDiagram({ left, right, arrows, lit, ariaLabel }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const rawId = useId()
  const headId = `arrowhead-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const rows = Math.max(left.length, right.length)
  const height = rows * ROW + 2 * PAD_Y
  const longest = Math.max(...[...left, ...right].map((n) => n.label.length), 3)
  const nodeW = Math.min(Math.max(56, 8 * longest + 20), Math.max(width / 2 - 30, 56))
  const nodeH = 30
  const leftX = 10
  const rightX = Math.max(width - nodeW - 10, leftX + nodeW + 20)

  /** The middle of the i-th node of a column, that column's own spacing. */
  const centerY = (i: number, count: number) =>
    PAD_Y + ((rows * ROW) / count) * (i + 0.5)

  const nodeAt = (col: readonly ArrowNode[], id: string) => col.findIndex((n) => n.id === id)

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          <defs>
            <marker
              id={headId}
              markerWidth={7}
              markerHeight={7}
              refX={6}
              refY={2.5}
              orient="auto"
            >
              <path d="M0,0 L6,2.5 L0,5 Z" className="fn-arrow-head" />
            </marker>
          </defs>

          {left.map((from, i) =>
            (arrows[from.id] ?? []).map((toId) => {
              const j = nodeAt(right, toId)
              if (j < 0) return null
              return (
                <line
                  key={`${from.id}-${toId}`}
                  x1={leftX + nodeW + 2}
                  y1={centerY(i, left.length)}
                  x2={rightX - 9}
                  y2={centerY(j, right.length)}
                  className="fn-arrow"
                  markerEnd={`url(#${headId})`}
                />
              )
            })
          )}

          {[
            { col: left, x: leftX, side: 'left' as const },
            { col: right, x: rightX, side: 'right' as const },
          ].map(({ col, x, side }) =>
            col.map((node, i) => {
              const isLit = side === 'left' ? lit?.leftId === node.id : lit?.rightId === node.id
              const y = centerY(i, col.length)
              return (
                <g key={`${side}-${node.id}`}>
                  <rect
                    x={x}
                    y={y - nodeH / 2}
                    width={nodeW}
                    height={nodeH}
                    rx={9}
                    className={`fn-node fn-node-${side}${isLit ? ' lit' : ''}`}
                  />
                  <text x={x + nodeW / 2} y={y + 4} textAnchor="middle" className="fn-node-label">
                    {node.label}
                  </text>
                </g>
              )
            })
          )}
        </svg>
      )}
    </div>
  )
}
