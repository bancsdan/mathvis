import { useMemo, useState } from 'react'
import { AliasingDemo } from './AliasingDemo'
import { BinExplainer } from './BinExplainer'
import { LineChart } from './LineChart'
import { SpectrumChart } from './SpectrumChart'
import { componentSamples, fmt, formulaTex, oneSidedBins, rmsError, sampleFunction, termText } from '../lib/analysis'
import { Tex } from './Tex'
import { forwardFFT, inverseTopK } from '../lib/fft'

const PRESETS: Array<{ name: string; expr: string }> = [
  { name: 'Two sines + offset', expr: 'sin(2*pi*3*x) + 0.5*sin(2*pi*7*x) + 0.3' },
  { name: 'Square wave', expr: 'sign(sin(2*pi*2*x))' },
  { name: 'Sawtooth', expr: '2*(3*x - floor(3*x + 0.5))' },
  { name: 'Gaussian pulse', expr: 'exp(-(x - 0.5)^2 / 0.005)' },
  { name: 'Chirp', expr: 'sin(2*pi*(2 + 20*x)*x)' },
]

const SIZES = [64, 128, 256, 512, 1024]

const WINDOWS = [1, 2, 4, 8]

interface Result {
  xs: number[]
  samples: number[]
  recon: number[]
  bins: ReturnType<typeof oneSidedBins>
  kept: Set<number>
  error: number
  formula: string
}

export function FftPage() {
  const [expr, setExpr] = useState(PRESETS[0].expr)
  const [n, setN] = useState(256)
  const [period, setPeriod] = useState(1)
  const [keep, setKeep] = useState(6)
  const [inspectK, setInspectK] = useState<number | null>(null)

  const maxKeep = Math.min(64, n / 2 + 1)

  const result = useMemo<{ data?: Result; error?: string }>(() => {
    try {
      if (!(period > 0)) throw new Error('The period must be a positive number')
      const samples = sampleFunction(expr, n, period)
      const xs = samples.map((_, i) => (i / n) * period)
      const spec = forwardFFT(samples)
      const bins = oneSidedBins(spec, period)
      const { samples: recon, kept } = inverseTopK(spec, Math.min(keep, maxKeep))
      return {
        data: {
          xs,
          samples,
          recon,
          bins,
          kept,
          error: rmsError(samples, recon),
          formula: formulaTex(bins, kept),
        },
      }
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  }, [expr, n, period, keep, maxKeep])

  const d = result.data
  const keptBins = d
    ? d.bins.filter((b) => d.kept.has(b.k)).sort((a, b) => b.amplitude - a.amplitude)
    : []

  const MAX_PANELS = 8
  const shownComponents = keptBins.slice(0, MAX_PANELS).map((b) => ({
    bin: b,
    label: termText(b),
    values: componentSamples(b, n),
  }))
  let compMax = 0
  for (const c of shownComponents) {
    for (const v of c.values) {
      const a = Math.abs(v)
      if (a > compMax) compMax = a
    }
  }
  const compDomain: [number, number] = [-(compMax * 1.08 || 1), compMax * 1.08 || 1]

  const maxBin = n / 2
  const defaultK = keptBins.find((b) => b.k > 0)?.k ?? 1
  const inspected = Math.min(inspectK ?? defaultK, maxBin)

  return (
    <>
      <p className="subtitle lesson-text">
        The Fourier transform's claim: any repeating signal is secretly a sum of simple waves.
        This page lets you test the claim. Type a function, and the app measures it at N
        points, finds which waves hide inside (the FFT), throws away all but the strongest
        ones, and rebuilds the signal from what's left (the inverse FFT). If the rebuilt curve
        still matches, a few waves were enough to carry the whole signal.
      </p>

      <section className="controls card">
        <label className="field field-wide">
          <span className="field-label">f(x) over one period</span>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck={false}
            aria-invalid={result.error !== undefined}
          />
        </label>
        <label className="field">
          <span className="field-label">Preset</span>
          <select
            value={PRESETS.find((p) => p.expr === expr)?.name ?? ''}
            onChange={(e) => {
              const p = PRESETS.find((p) => p.name === e.target.value)
              if (p) setExpr(p.expr)
            }}
          >
            <option value="" disabled>
              Custom
            </option>
            {PRESETS.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Samples N</span>
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Window</span>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            {WINDOWS.map((w) => (
              <option key={w} value={w}>
                {w} period{w === 1 ? '' : 's'}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-wide">
          <span className="field-label">
            Strongest components to keep (zero-amplitude bins are skipped): <strong>{Math.min(keep, maxKeep)}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={maxKeep}
            value={Math.min(keep, maxKeep)}
            onChange={(e) => setKeep(Number(e.target.value))}
          />
        </label>
      </section>

      {result.error && (
        <p className="error" role="alert">
          Could not evaluate the function: {result.error}
        </p>
      )}

      {d && (
        <>
          <section className="card">
            <div className="card-head">
              <h2>Time domain</h2>
              <div className="legend">
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--series-1)' }} /> f(x) sampled
                </span>
                <span className="legend-item">
                  <span className="chip chip-dashed" style={{ background: 'var(--series-2)' }} />{' '}
                  inverse FFT of {d.kept.size} kept component{d.kept.size === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <p className="card-note lesson-text">
              The blue curve is your function, measured at N points. The dashed orange curve is
              the rebuilt version — the inverse FFT of only the kept components. Where the two
              hug each other, those few waves already tell the whole story; drag the
              "components" slider down and watch the orange curve lose detail first, then shape.
            </p>
            <LineChart
              xs={d.xs}
              xLabel="x"
              yLabel="f(x)"
              series={[
                { name: 'f(x)', color: 'var(--series-1)', values: d.samples },
                { name: 'inverse FFT', color: 'var(--series-2)', values: d.recon, dashed: true },
              ]}
            />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Wave components</h2>
              <div className="legend">
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--series-3)' }} /> kept
                  component
                </span>
              </div>
            </div>
            <p className="card-note lesson-text">
              Here are the hidden waves the FFT found, drawn one per row so you can see each
              ingredient on its own — strongest first, all on the same y-scale so heights are
              comparable. Each label gives the wave's recipe: strength × cos(speed × x + head
              start). Add every row together, point by point, and you get exactly the dashed
              orange curve above.
            </p>
            {shownComponents.map((c) => (
              <div className="component-row" key={c.bin.k}>
                <code className="component-label">{c.label}</code>
                <LineChart
                  xs={d.xs}
                  compact
                  height={84}
                  yDomain={compDomain}
                  xLabel="x"
                  yLabel={c.label}
                  series={[
                    {
                      name: c.bin.k === 0 ? 'constant' : `f = ${fmt(c.bin.freq, 4)}`,
                      color: 'var(--series-3)',
                      values: c.values,
                    },
                  ]}
                />
              </div>
            ))}
            {d.kept.size > MAX_PANELS && (
              <p className="card-note">
                Showing the strongest {MAX_PANELS} of {d.kept.size} components.
              </p>
            )}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Frequency domain</h2>
              <div className="legend">
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--series-1)' }} /> kept
                </span>
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--mark-muted)' }} /> discarded
                </span>
              </div>
            </div>
            <p className="card-note lesson-text">
              The same information as a bar chart — the signal's "recipe card". One bar per
              possible frequency (bin k = 0 … N/2): its position says how fast that wave
              repeats, its height says how strongly it is present. Most bars are near zero
              because most frequencies simply aren't in the signal. Hover a bar for its exact
              frequency, amplitude and phase; click one to see its value computed step by step
              below.
            </p>
            <SpectrumChart bins={d.bins} kept={d.kept} selected={inspected} onSelect={setInspectK} />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>How bin k is computed</h2>
            </div>
            <p className="card-note">
              Pick a bin with the +/− buttons, or click any bar in the spectrum above, and watch
              its value worked out by hand.
            </p>
            <BinExplainer
              xs={d.xs}
              samples={d.samples}
              period={period}
              k={inspected}
              maxK={maxBin}
              onChangeK={setInspectK}
            />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Result</h2>
            </div>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">Components kept</span>
                <span className="stat-value">{d.kept.size}</span>
              </div>
              <div className="stat">
                <span className="stat-label">RMS reconstruction error</span>
                <span className="stat-value">{fmt(d.error, 3)}</span>
              </div>
            </div>
            <p className="card-note lesson-text">
              The recipe in one line — this sum of simple waves is what the inverse FFT actually
              draws as the dashed curve. The RMS error above says how far that drawing is from
              your function, averaged over all sample points (0 means a perfect match).
            </p>
            <Tex block tex={d.formula} />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>bin k</th>
                    <th>frequency</th>
                    <th>amplitude</th>
                    <th>phase</th>
                  </tr>
                </thead>
                <tbody>
                  {keptBins.map((b) => (
                    <tr key={b.k}>
                      <td>{b.k}</td>
                      <td>{fmt(b.freq, 4)}</td>
                      <td>{fmt(b.amplitude, 4)}</td>
                      <td>{((b.phase * 180) / Math.PI).toFixed(1)}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <AliasingDemo />
    </>
  )
}
