import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { MAPPINGS } from '../lib/sets'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const M = { top: 30, right: 24, bottom: 30, left: 24 }

interface LinesProps {
  count: number
  apply: (n: number) => number
  /** Space the images by their value rather than pairing them column by column. */
  truePositions: boolean
  selected: number | null
  onSelect: (n: number | null) => void
}

/** Two rows of numbers with an arrow from every n to its partner. */
function BijectionLines({ count, apply, truePositions, selected, onSelect }: LinesProps) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const height = 190
  const plotW = Math.max(width - M.left - M.right, 10)
  const topY = M.top + 12
  const botY = height - M.bottom - 12

  const maxImage = apply(count)
  const xTop = (n: number) => M.left + (plotW * (n - 0.5)) / count
  const xBot = (n: number) =>
    truePositions ? M.left + (plotW * (apply(n) - 0.5)) / maxImage : xTop(n)

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={t('sets.infLineAria', { n: count })} onMouseLeave={() => onSelect(null)}>
          <line x1={M.left} y1={topY} x2={width - M.right} y2={topY} stroke="var(--axis)" />
          <line x1={M.left} y1={botY} x2={width - M.right} y2={botY} stroke="var(--axis)" />
          <text x={M.left} y={topY - 14} className="axis-label">
            {t('sets.infTopLabel')}
          </text>
          <text x={M.left} y={botY + 22} className="axis-label">
            {t('sets.infBottomLabel')}
          </text>

          {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
            const x1 = xTop(n)
            const x2 = xBot(n)
            const dim = selected !== null && selected !== n
            return (
              <g key={n} opacity={dim ? 0.22 : 1}>
                <path
                  d={`M${x1},${topY + 9} C${x1},${(topY + botY) / 2} ${x2},${(topY + botY) / 2} ${x2},${botY - 9}`}
                  fill="none"
                  stroke={selected === n ? 'var(--accent-select)' : 'var(--series-1)'}
                  strokeWidth={selected === n ? 2 : 1}
                  pointerEvents="none"
                />
                <circle cx={x1} cy={topY} r={9} fill="var(--surface)" stroke="var(--series-1)" />
                <text x={x1} y={topY + 4} textAnchor="middle" className="tick-text">
                  {n}
                </text>
                <circle cx={x2} cy={botY} r={9} fill="var(--surface)" stroke="var(--series-2)" />
                <text x={x2} y={botY + 4} textAnchor="middle" className="tick-text">
                  {apply(n)}
                </text>
                <rect
                  x={Math.min(x1, x2) - 10}
                  y={topY - 12}
                  width={Math.abs(x2 - x1) + 20}
                  height={botY - topY + 24}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => onSelect(n)}
                />
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export function SetsInfinityCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [mappingId, setMappingId] = useState('double')
  const [count, setCount] = useState(8)
  const [truePositions, setTruePositions] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')

  const mapping = MAPPINGS.find((m) => m.id === mappingId) ?? MAPPINGS[0]
  // The task always asks about the tripling map, whichever one is on display.
  const triple = MAPPINGS.find((m) => m.id === 'triple')!
  const solution = triple.apply(7)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.infTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.infIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="sets.infIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('sets.infMapping')}</span>
          <select value={mappingId} onChange={(e) => setMappingId(e.target.value)}>
            {MAPPINGS.map((m) => (
              <option key={m.id} value={m.id}>
                {t(m.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">
            {t('sets.infNLabel')} <strong>{count}</strong>
          </span>
          <input type="range" min={4} max={16} step={1} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <label className="field checkbox-field">
          <span className="field-label">{t('sets.infTruePositions')}</span>
          <input type="checkbox" checked={truePositions} onChange={(e) => setTruePositions(e.target.checked)} />
        </label>
      </div>

      <Tex block tex={mapping.tex} />

      <BijectionLines
        count={count}
        apply={mapping.apply}
        truePositions={truePositions}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('sets.infStatPairs')}</span>
          <span className="stat-value">{count}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('sets.infStatLeftOver')}</span>
          <span className="stat-value">0</span>
        </div>
      </div>

      <p className="alias-verdict">
        <Trans i18nKey="sets.infParadox" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="sets.infTask"
        isCorrect={Number(answer) === solution}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(solution)}
        onReveal={() => setAnswer(String(solution))}
        hintKey="sets.infHint"
      >
        <label className="field">
          <span className="field-label">{t('sets.infAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
