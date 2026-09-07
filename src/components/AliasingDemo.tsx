import { useMemo, useState, type ReactNode } from 'react'
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
        <svg width={width} height={height} role="img" aria-label="True wave, alias wave and shared samples" onMouseLeave={() => setHover(null)}>
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
            sample n = {hn} · x = {(hn / DEMO_N).toFixed(4)}
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
        <svg width={width} height={height} role="img" aria-label="Folding map from true frequency to observed bin">
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
            measured bin
          </text>
          <text x={sx(NYQ)} y={FM.top - 3} textAnchor="middle" className="axis-label">
            N/2 (Nyquist)
          </text>
          <text x={sx(DEMO_N)} y={FM.top - 3} textAnchor="middle" className="axis-label">
            N
          </text>
          <text x={FM.left + plotW + 22} y={FM.top + plotH + 16} textAnchor="start" className="axis-label">
            true cycles
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
  const [kTrue, setKTrue] = useState(60)
  const a = aliasOf(kTrue)
  const turns = Math.round((kTrue - a.r) / DEMO_N)
  const trueLabel = `sin(2π·${kTrue}·x)`
  const aliasLabel =
    a.r === NYQ ? '0 (a flat line)' : `${a.flipped ? '−' : ''}sin(2π·${a.k}·x)`
  const coincide = kTrue === a.k

  let verdict: ReactNode
  if (a.r === NYQ) {
    verdict = (
      <>
        {kTrue} cycles is exactly N/2. A sine at this frequency crosses zero at every single
        sample point — all 64 measurements read 0, and the wave vanishes without a trace.
      </>
    )
  } else if (kTrue === a.k) {
    verdict = (
      <>
        {kTrue} cycles stays at or below N/2 = 32, so every cycle gets at least 2 samples. The
        measurements describe the wave truthfully, and the energy lands in bin {a.k}. The two
        curves are one and the same.
      </>
    )
  } else if (a.flipped) {
    verdict = (
      <>
        <Tex tex={`${kTrue} \\equiv -${a.k} \\pmod{64}`} /> — {turns > 0 ? `${turns} whole turn${turns === 1 ? '' : 's'} between consecutive samples ${turns === 1 ? 'is' : 'are'} invisible, and ` : ''}
        what's left over looks like {a.k} cycles running <em>backwards</em>. The measurements
        are identical to <Tex tex={`-\\sin(2\\pi\\cdot ${a.k}\\,x)`} />, so the energy lands
        in bin {a.k}.
      </>
    )
  } else {
    verdict = (
      <>
        <Tex tex={`${kTrue} \\equiv ${a.k} \\pmod{64}`} /> — the {turns} whole turn
        {turns === 1 ? '' : 's'} between consecutive samples {turns === 1 ? 'is' : 'are'}{' '}
        invisible, so the measurements are identical to a {a.k}-cycle wave. The energy lands in
        bin {a.k}.
      </>
    )
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Aliasing: when sampling lies</h2>
        <div className="legend">
          <span className="legend-item">
            <span className="chip chip-dashed" style={{ background: 'var(--series-1)', height: 3 }} /> true: {trueLabel}
          </span>
          <span className="legend-item">
            <span className="chip chip-dashed" style={{ background: 'var(--series-2)' }} /> samples claim:{' '}
            {coincide ? 'the same wave' : aliasLabel}
          </span>
          <span className="legend-item">
            <span className="chip" style={{ background: 'var(--series-3)', borderRadius: '50%' }} /> the N = 64 samples
          </span>
        </div>
      </div>

      <p className="card-note lesson-text">
        Everything above rests on one quiet assumption: that N samples are enough to know which
        wave produced them. This demo is where the assumption breaks. A computer cannot store a
        smooth curve, only samples of it — here a sine with a frequency you control, sampled at
        the same 64 evenly spaced points (green dots) no matter how fast it oscillates. To
        capture a wiggle you need at least 2 samples per cycle: one near a crest, one near a
        trough. With 64 samples that caps honest measurement at 32 cycles per window. Push
        beyond it and the samples do not go blank — they lie.
      </p>

      <label className="field field-wide">
        <span className="field-label">
          True frequency: <strong>{kTrue}</strong> cycle{kTrue === 1 ? '' : 's'} per window
          (Nyquist limit is 32)
        </span>
        <input type="range" min={0} max={96} value={kTrue} onChange={(e) => setKTrue(Number(e.target.value))} />
      </label>
      <p className="alias-verdict">{verdict}</p>

      <p className="mini-title">
        The whole window — every green dot is an overlap point where the two curves cross, and
        the dots are all the computer ever sees
      </p>
      <WavePanel x0={0} x1={1} kTrue={kTrue} height={200} trueLabel={trueLabel} aliasLabel={aliasLabel} />

      <p className="mini-title">
        Zoomed to x = 0 … ⅛ — watch {trueLabel} thread through the same overlap points that{' '}
        {coincide ? 'it' : aliasLabel} passes through
      </p>
      <WavePanel x0={0} x1={1 / 8} kTrue={kTrue} height={180} trueLabel={trueLabel} aliasLabel={aliasLabel} />

      <p className="mini-title">The folding map — where every true frequency ends up</p>
      <p className="card-note">
        Frequencies fold back and forth like an accordion: up to Nyquist they map to
        themselves, from 32 to 64 they come back mirrored, past 64 the pattern repeats. The
        marker is the slider's current position.
      </p>
      <FoldingMap kTrue={kTrue} />

      <div className="lesson-text">
        <p className="card-note">
          <strong>Why this matters.</strong> Between the dots the two curves disagree
          completely, but sampling never looks between the dots, so no algorithm can recover
          which wave was real: the evidence is destroyed at the moment of sampling, not by the
          FFT. That has a physical picture — film a wheel spinning 60 times a second with a
          64-frames-per-second camera and it appears to roll slowly backwards, which is why
          helicopter rotors do impossible things on video. It also has an engineering
          consequence: since no computation can undo aliasing, real systems prevent it before
          sampling, with an analog filter that deletes everything above Nyquist. That is why
          44.1 kHz audio can only represent tones up to about 22 kHz, and why every
          analog-to-digital converter ships with an anti-aliasing filter in front of it.
        </p>
        <p className="card-note">
          <strong>Try it:</strong> drag to 4 (faithful — the curves coincide), 31 (barely
          legal, 2 samples per cycle), 32 (a Nyquist sine vanishes), 60 (the classic: reads as
          4 backwards), 64 (one full turn per step — looks like standing still, bin 0), and 92
          (wraps past N and reads as 28 backwards).
        </p>
      </div>
    </section>
  )
}
