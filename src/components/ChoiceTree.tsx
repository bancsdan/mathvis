import { useMemo } from 'react'
import type { TreeNode } from '../lib/combinatorics'
import { useWidth } from './useWidth'

interface Props {
  /** Root first; every other node names an existing parent. */
  nodes: readonly TreeNode[]
  /** Depth a finished possibility sits at, so leaves can be told apart. */
  maxDepth: number
  ariaLabel: string
  /** Above this many rows the tree is unreadable and the note is shown instead. */
  maxRows?: number
  /** Translated stand-in for a tree with too many branches to draw. */
  tooManyLabel: string
  rowHeight?: number
}

/**
 * A choice drawn as a tree: one column per step, one row per possibility.
 *
 * Rows are handed out to the terminal nodes in reading order and every parent
 * is centred over its children, so the leaves line up as a list and the student
 * can count them — which is the whole point of the picture.
 */
export function ChoiceTree({ nodes, maxDepth, ariaLabel, maxRows = 36, tooManyLabel, rowHeight = 20 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()

  const layout = useMemo(() => {
    const children = new Map<string, TreeNode[]>()
    for (const node of nodes) {
      if (node.parent === null) continue
      const list = children.get(node.parent)
      if (list) list.push(node)
      else children.set(node.parent, [node])
    }
    const rows = new Map<string, number>()
    let next = 0
    const walk = (node: TreeNode) => {
      const kids = children.get(node.id) ?? []
      if (kids.length === 0) {
        rows.set(node.id, next)
        next += 1
        return
      }
      for (const kid of kids) walk(kid)
      const ys = kids.map((k) => rows.get(k.id) ?? 0)
      rows.set(node.id, (Math.min(...ys) + Math.max(...ys)) / 2)
    }
    const root = nodes.find((node) => node.parent === null)
    if (root) walk(root)
    return { rows, terminals: next }
  }, [nodes])

  if (layout.terminals === 0 || layout.terminals > maxRows) {
    return <p className="card-note">{tooManyLabel}</p>
  }

  const padX = 10
  const padY = 12
  // Labels hang to the right of their node, so the last column needs room for
  // the widest label or the leaves run off the edge of the drawing.
  const longest = nodes.reduce((max, node) => Math.max(max, node.label.length), 0)
  const labelRoom = 7 + Math.ceil(longest * 6.5)
  const height = layout.terminals * rowHeight + padY * 2
  const col = (Math.max(width, 1) - padX * 2 - labelRoom) / Math.max(maxDepth, 1)
  const x = (depth: number) => padX + depth * col
  const y = (row: number) => padY + row * rowHeight + rowHeight / 2

  const byId = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {nodes.map((node) => {
            if (node.parent === null) return null
            const parent = byId.get(node.parent)
            if (!parent) return null
            return (
              <line
                key={`e-${node.id}`}
                x1={x(parent.depth) + 4}
                y1={y(layout.rows.get(parent.id) ?? 0)}
                x2={x(node.depth) - 2}
                y2={y(layout.rows.get(node.id) ?? 0)}
                stroke="var(--axis)"
                strokeWidth={1.5}
              />
            )
          })}
          {nodes.map((node) => {
            const row = layout.rows.get(node.id) ?? 0
            const isLeaf = node.depth === maxDepth
            const fill = isLeaf ? 'var(--series-1)' : 'var(--axis)'
            return (
              <g key={node.id}>
                <circle cx={x(node.depth)} cy={y(row)} r={node.depth === 0 ? 4 : 3.5} fill={fill} />
                {node.label !== '' && (
                  <text
                    x={x(node.depth) + 7}
                    y={y(row) + 4}
                    fontSize={11}
                    fill="var(--text-primary)"
                  >
                    {node.label}
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
