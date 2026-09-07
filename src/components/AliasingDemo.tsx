import { useMemo, useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const DEMO_N = 64
const NYQ = DEMO_N / 2

interface AliasInfo {
  /** Bin the energy lands in (0..N/2). */
  k: number
  /** Leftover after removing full N-cycle turns. */
  r: number
  /** True when the alias runs backwards (mirrored above N/2). */
  flipped: boolean
}

function aliasOf(kTrue: number): AliasInfo {
  const r = ((kTrue % DEMO_N) + DEMO_N) % DEMO_N
  return r <= NYQ ? { k: r, r, flipped: false } : { k: DEMO_N - r, r, flipped: true }
}

const M = { top: 10, right: 42, bottom: 24, left: 52 }

interface PanelProps {
  x0: number
  x1: number
  kTrue: number
  height: number
  trueLabel: string
  aliasLabel: string
}

/** One wave panel: continuous true wave, continuous alias wave, the shared samples. */
function WavePanel({ x0, x1, kTrue, height, trueLabel, aliasLabel }: PanelProps) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const plotW = Math.max(width - M.left - M.right, 10)
  const plotH = height - M.top - M.bottom
  const sx = (x: number) => M.left + ((x - x0) / (x1 - x0)) * plotW
  const sy = (y: number) => M.top + (1 - (y + 1.18) / 2.36) * plotH

  const a = aliasOf(kTrue)
  const trueFn = (x: number) => Math.sin(2 * Math.PI * kTrue * x)
  // What the inverse DFT reconstructs from the samples. A pure sine at exactly
  // N/2 samples to all zeros, so the reconstruction is flat.
  const aliasFn = (x: number) =>
    a.r === NYQ ? 0 : (a.flipped ? -1 : 1) * Math.sin(2 * Math.PI * a.k * x)

  const { truePath, aliasPath } = useMemo(() => {
    const steps = 2200
    const build = (fn: (x: number) => number) => {
      let d = ''
      for (let i = 0; i <= steps; i++) {
        const x = x0 + ((x1 - x0) * i) / steps
        d += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(2)},${sy(fn(x)).toFixed(2)}`
      }
      return d
    }
    return { truePath: build(trueFn), aliasPath: build(aliasFn) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kTrue, width, x0, x1, height])

  const dots: number[] = []
  for (let n = 0; n < DEMO_N; n++) {
    const x = n / DEMO_N
    if (x >= x0 - 1e-9 && x <= x1 + 1e-9) dots.push(n)
  }

  const xTicks = useMemo(() => {
    const t: number[] = []
    for (let i = 0; i <= 4; i++) t.push(x0 + ((x1 - x0) * i) / 4)
    return t
  }, [x0, x1])

  const hn = hover
  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={t('alias.panelAria')} onMouseLeave={() => setHover(null)}>
          {[-1, 0, 1].map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + plotW} y1={sy(t)} y2={sy(t)} stroke={t === 0 ? 'var(--axis)' : 'var(--grid)'} strokeWidth={1} />
              <text x={M.left - 8} y={sy(t) + 4} textAnchor="end" className="tick-text">
                {t}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={sx(t)} y={M.top + plotH + 16} textAnchor="middle" className="tick-text">
              {Number(t.toFixed(4))}
            </text>
          ))}
          <text x={M.left + plotW + 22} y={M.top + plotH + 16} textAnchor="start" className="axis-label">
            x
          </text>
          <path d={truePath} fill="none" stroke="var(--series-1)" strokeWidth={1.6} opacity={0.85} />
          <path d={aliasPath} fill="none" stroke="var(--series-2)" strokeWidth={2.4} strokeDasharray="7 5" />
          {dots.map((n) => (
            <circle
              key={n}
              cx={sx(n / DEMO_N)}
              cy={sy(trueFn(n / DEMO_N))}
              r={4.5}
              fill="var(--series-3)"
              stroke="var(--surface)"
              strokeWidth={2}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHover(n)}
            />
          ))}
        </svg>
      )}
      {hn !== null && width > 0 && (
        <div className="tooltip" style={{ left: Math.min(sx(hn / DEMO_N) + 12, width - 200), top: M.top + 4 }}>
          <div className="tooltip-title">
            {t('alias.tooltipSample', { n: hn, x: (hn / DEMO_N).toFixed(4) })}
          </div>
          <div className="tooltip-row">
            <span className="chip" style={{ background: 'var(--series-1)' }} />
            <span className="tooltip-name">{trueLabel}</span>
            <span className="tooltip-value">{trueFn(hn / DEMO_N).toFixed(4)}</span>
          </div>
          <div className="tooltip-row">
            <span className="chip" style={{ background: 'var(--series-2)' }} />
            <span className="tooltip-name">{aliasLabel}</span>
            <span className="tooltip-value">{aliasFn(hn / DEMO_N).toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Zigzag map: true cycles per window -> the bin the energy lands in. */
function FoldingMap({ kTrue }: { kTrue: number }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const height = 150
  const FM = { top: 14, right: 56, bottom: 30, left: 52 }
  const plotW = Math.max(width - FM.left - FM.right, 10)
  const plotH = height - FM.top - FM.bottom
  const kMax = 96
  const sx = (k: number) => FM.left + (k / kMax) * plotW
  const sy = (b: number) => FM.top + (1 - b / NYQ) * plotH
  const a = aliasOf(kTrue)

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={t('alias.foldAria')}>
          {[0, NYQ].map((b) => (
            <g key={b}>
              <line x1={FM.left} x2={FM.left + plotW} y1={sy(b)} y2={sy(b)} stroke={b === 0 ? 'var(--axis)' : 'var(--grid)'} strokeWidth={1} />
              <text x={FM.left - 8} y={sy(b) + 4} textAnchor="end" className="tick-text">
                {b}
              </text>
            </g>
          ))}
          {[NYQ, DEMO_N].map((k) => (
            <line key={k} x1={sx(k)} x2={sx(k)} y1={FM.top} y2={FM.top + plotH} stroke="var(--grid)" strokeWidth={1} strokeDasharray="3 3" />
          ))}
          {[0, NYQ, DEMO_N, kMax].map((k) => (
            <text key={k} x={sx(k)} y={FM.top + plotH + 16} textAnchor="middle" className="tick-text">
              {k}
            </text>
          ))}
          <text x={FM.left} y={FM.top - 3} textAnchor="start" className="axis-label">
            {t('alias.measuredBin')}
          </text>
          <text x={sx(NYQ)} y={FM.top - 3} textAnchor="middle" className="axis-label">
            N/2 (Nyquist)
          </text>
          <text x={sx(DEMO_N)} y={FM.top - 3} textAnchor="middle" className="axis-label">
            N
          </text>
          <text x={FM.left + plotW + 22} y={FM.top + plotH + 16} textAnchor="start" className="axis-label">
            {t('alias.trueCycles')}
          </text>
          <polyline
            points={`${sx(0)},${sy(0)} ${sx(NYQ)},${sy(NYQ)} ${sx(DEMO_N)},${sy(0)} ${sx(kMax)},${sy(NYQ)}`}
            fill="none"
            stroke="var(--series-1)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <circle cx={sx(kTrue)} cy={sy(a.k)} r={5.5} fill="var(--series-2)" stroke="var(--surface)" strokeWidth={2} />
        </svg>
      )}
    </div>
  )
}

/** Interactive aliasing lesson: fixed N = 64, adjustable true frequency. */
export function AliasingDemo() {
  const { t } = useTranslation()
  const [kTrue, setKTrue] = useState(60)
  const a = aliasOf(kTrue)
  const turns = Math.round((kTrue - a.r) / DEMO_N)
  const trueLabel = `sin(2π·${kTrue}·x)`
  const aliasLabel =
    a.r === NYQ ? t('alias.flatLine') : `${a.flipped ? '−' : ''}sin(2π·${a.k}·x)`
  const coincide = kTrue === a.k

  let verdict: ReactNode
  if (a.r === NYQ) {
    verdict = <>{t('alias.verdictNyquist', { k: kTrue })}</>
  } else if (kTrue === a.k) {
    verdict = <>{t('alias.verdictFaithful', { k: kTrue, bin: a.k })}</>
  } else if (a.flipped) {
    verdict = (
      <>
        <Tex tex={`${kTrue} \\equiv -${a.k} \\pmod{64}`} /> —{' '}
        {turns > 0 ? t('alias.turnsClause', { count: turns }) : ''}
        <Trans i18nKey="alias.verdictFlippedA" components={{ i: <em /> }} values={{ bin: a.k }} />{' '}
        <Tex tex={`-\\sin(2\\pi\\cdot ${a.k}\\,x)`} />
        {t('alias.verdictFlippedB', { bin: a.k })}
      </>
    )
  } else {
    verdict = (
      <>
        <Tex tex={`${kTrue} \\equiv ${a.k} \\pmod{64}`} /> —{' '}
        {t('alias.verdictWrapped', { count: turns, bin: a.k })}
      </>
    )
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>{t('alias.title')}</h2>
        <div className="legend">
          <span className="legend-item">
            <span className="chip chip-dashed" style={{ background: 'var(--series-1)', height: 3 }} /> {t('alias.legendTrue', { formula: trueLabel })}
          </span>
          <span className="legend-item">
            <span className="chip chip-dashed" style={{ background: 'var(--series-2)' }} />{' '}
            {t('alias.legendClaim', { formula: coincide ? t('alias.sameWave') : aliasLabel })}
          </span>
          <span className="legend-item">
            <span className="chip" style={{ background: 'var(--series-3)', borderRadius: '50%' }} /> {t('alias.legendSamples')}
          </span>
        </div>
      </div>

      <p className="card-note lesson-text">{t('alias.intro')}</p>

      <label className="field field-wide">
        <span className="field-label">
          <Trans i18nKey="alias.sliderLabel" components={{ b: <strong /> }} values={{ k: kTrue }} />
        </span>
        <input type="range" min={0} max={96} value={kTrue} onChange={(e) => setKTrue(Number(e.target.value))} />
      </label>
      <p className="alias-verdict">{verdict}</p>

      <p className="mini-title">{t('alias.wholeTitle')}</p>
      <WavePanel x0={0} x1={1} kTrue={kTrue} height={200} trueLabel={trueLabel} aliasLabel={aliasLabel} />

      <p className="mini-title">
        {t('alias.zoomTitle', { trueF: trueLabel, other: coincide ? t('alias.zoomIt') : aliasLabel })}
      </p>
      <WavePanel x0={0} x1={1 / 8} kTrue={kTrue} height={180} trueLabel={trueLabel} aliasLabel={aliasLabel} />

      <p className="mini-title">{t('alias.foldTitle')}</p>
      <p className="card-note">{t('alias.foldNote')}</p>
      <FoldingMap kTrue={kTrue} />

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alias.whyNote" components={{ b: <strong /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="alias.tryIt" components={{ b: <strong /> }} />
        </p>
      </div>
    </section>
  )
}
