import { useTranslation } from 'react-i18next'
import { UNIVERSE, type Elem } from '../lib/sets'

const COLOR_VAR: Record<Elem['color'], string> = {
  blue: 'var(--series-1)',
  orange: 'var(--series-2)',
  green: 'var(--series-3)',
}

/** One element drawn as a small glyph: shape carries meaning, so does size. */
function Glyph({ elem }: { elem: Elem }) {
  const fill = COLOR_VAR[elem.color]
  const s = elem.size === 'large' ? 20 : 13
  const o = (24 - s) / 2
  return (
    <svg width={24} height={24} aria-hidden="true" focusable="false">
      {elem.shape === 'circle' && <circle cx={12} cy={12} r={s / 2} fill={fill} />}
      {elem.shape === 'square' && <rect x={o} y={o} width={s} height={s} rx={2} fill={fill} />}
      {elem.shape === 'triangle' && (
        <polygon points={`12,${o} ${o + s},${o + s} ${o},${o + s}`} fill={fill} />
      )}
    </svg>
  )
}

interface Props {
  /** Ids currently selected. */
  selected: ReadonlySet<number>
  onToggle: (id: number) => void
  /** Ids the student should have picked but did not, outlined after a check. */
  missing?: ReadonlySet<number>
  /** Ids the student picked but should not have. */
  extra?: ReadonlySet<number>
  /** Only these elements are shown. Defaults to the whole universe. */
  only?: readonly number[]
  /** Frames the grid as the universal set, with its label. */
  framed?: boolean
}

/**
 * The twelve elements as a row of buttons. HTML rather than SVG, so focus,
 * pressed state and keyboard operation come for free.
 */
export function SetsElementGrid({ selected, onToggle, missing, extra, only, framed = false }: Props) {
  const { t } = useTranslation()
  const shown = only ? UNIVERSE.filter((e) => only.includes(e.id)) : UNIVERSE

  const grid = (
    <div className="elem-grid">
      {shown.map((elem) => {
        const classes = ['elem-btn']
        if (selected.has(elem.id)) classes.push('selected')
        if (missing?.has(elem.id)) classes.push('missing')
        if (extra?.has(elem.id)) classes.push('extra')
        return (
          <button
            key={elem.id}
            type="button"
            className={classes.join(' ')}
            aria-pressed={selected.has(elem.id)}
            aria-label={t('sets.elemAria', {
              num: elem.id,
              shape: t(`sets.shape_${elem.shape}`),
              color: t(`sets.color_${elem.color}`),
              size: t(`sets.size_${elem.size}`),
            })}
            onClick={() => onToggle(elem.id)}
          >
            <Glyph elem={elem} />
            {elem.id}
          </button>
        )
      })}
    </div>
  )

  if (!framed) return grid
  return (
    <div className="elem-universe">
      <span className="elem-universe-label">{t('sets.universeLabel')}</span>
      {grid}
    </div>
  )
}
