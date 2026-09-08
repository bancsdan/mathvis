import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { lcm, sieveCounts } from '../lib/combinatorics'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const LIMITS = [30, 50, 100]
const DIVISORS = [2, 3, 4, 5, 6, 7, 8, 9]
const PER_ROW = 10

const ANSWER = sieveCounts(100, 3, 5).neither

/** Which colour a number gets: both divisors win over either one alone. */
const colorOf = (x: number, a: number, b: number): string | null => {
  const inA = x % a === 0
  const inB = x % b === 0
  if (inA && inB) return 'var(--accent-select)'
  if (inA) return 'var(--series-1)'
  if (inB) return 'var(--series-2)'
  return null
}

function NumberGrid({ limit, a, b, ariaLabel }: { limit: number; a: number; b: number; ariaLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const cell = Math.min(34, Math.max(width, 1) / PER_ROW)
  const rows = Math.ceil(limit / PER_ROW)
  const height = rows * cell + 6

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {Array.from({ length: limit }, (_, i) => {
            const x = i % PER_ROW
            const y = Math.floor(i / PER_ROW)
            const color = colorOf(i + 1, a, b)
            return (
              <g key={i}>
                <rect
                  x={x * cell + 1}
                  y={y * cell + 1}
                  width={cell - 2}
                  height={cell - 2}
                  rx={4}
                  fill={color ?? 'var(--surface)'}
                  fillOpacity={color ? 0.28 : 1}
                  stroke={color ?? 'var(--border)'}
                />
                <text
                  x={x * cell + cell / 2}
                  y={y * cell + cell / 2 + 4}
                  fontSize={11}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                >
                  {i + 1}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export function CombiSieveCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [limit, setLimit] = useState(100)
  const [a, setA] = useState(2)
  const [b, setB] = useState(3)
  const [answer, setAnswer] = useState('')

  const counts = sieveCounts(limit, a, b)

  const rows: Array<[string, number]> = [
    ['combi.sieveRowA', counts.a],
    ['combi.sieveRowB', counts.b],
    ['combi.sieveRowBoth', counts.both],
    ['combi.sieveRowEither', counts.either],
    ['combi.sieveRowNeither', counts.neither],
  ]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.sieveTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          {/* The one link that may be an anchor: changing the topic is exactly
              what the URL hash is for. */}
          <Trans i18nKey="combi.sieveIntro1" components={{ b: <strong />, i: <em />, a: <a href="#sets" /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="combi.sieveIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('combi.sievePickLimit')}</span>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            {LIMITS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('combi.sievePickA')}</span>
          <select value={a} onChange={(e) => setA(Number(e.target.value))}>
            {DIVISORS.filter((d) => d !== b).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('combi.sievePickB')}</span>
          <select value={b} onChange={(e) => setB(Number(e.target.value))}>
            {DIVISORS.filter((d) => d !== a).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <NumberGrid limit={limit} a={a} b={b} ariaLabel={t('combi.sieveGridAria', { limit, a, b })} />

      <div className="legend">
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--series-1)' }} />
          {t('combi.sieveLegendA', { a })}
        </span>
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--series-2)' }} />
          {t('combi.sieveLegendB', { b })}
        </span>
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--accent-select)' }} />
          {t('combi.sieveLegendBoth', { both: lcm(a, b) })}
        </span>
      </div>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('combi.sieveThRow')}</th>
              <th>{t('combi.sieveThCount')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, value]) => (
              <tr key={key}>
                <td>{t(key, { a, b, limit })}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Tex
        block
        tex={`|A| + |B| - |A \\cap B| = ${counts.a} + ${counts.b} - ${counts.both} = ${counts.either}`}
      />
      <p className="card-note lesson-text">{t('combi.sieveNames', { a, b })}</p>
      <Tex block tex={`${limit} - ${counts.either} = ${counts.neither}`} />
      <p className="card-note lesson-text">
        <Trans i18nKey="combi.sieveNeitherNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="combi.sieveTask"
        isCorrect={Number(answer) === ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ANSWER)}
        onReveal={() => setAnswer(String(ANSWER))}
        hintKey="combi.sieveHint"
      >
        <label className="field">
          <span className="field-label">{t('combi.sieveAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
