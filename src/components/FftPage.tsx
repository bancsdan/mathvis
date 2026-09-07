import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AliasingDemo } from './AliasingDemo'
import { BinExplainer } from './BinExplainer'
import { LineChart } from './LineChart'
import { SpectrumChart } from './SpectrumChart'
import { componentSamples, fmt, formulaTex, oneSidedBins, rmsError, sampleFunction, termText } from '../lib/analysis'
import { Tex } from './Tex'
import { forwardFFT, inverseTopK } from '../lib/fft'

const PRESETS: Array<{ name: string; expr: string; labelKey: string }> = [
  { name: 'twoSines', expr: 'sin(2*pi*3*x) + 0.5*sin(2*pi*7*x) + 0.3', labelKey: 'fft.presetTwoSines' },
  { name: 'square', expr: 'sign(sin(2*pi*2*x))', labelKey: 'fft.presetSquare' },
  { name: 'saw', expr: '2*(3*x - floor(3*x + 0.5))', labelKey: 'fft.presetSaw' },
  { name: 'gauss', expr: 'exp(-(x - 0.5)^2 / 0.005)', labelKey: 'fft.presetGauss' },
  { name: 'chirp', expr: 'sin(2*pi*(2 + 20*x)*x)', labelKey: 'fft.presetChirp' },
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
  const { t } = useTranslation()
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
      <p className="subtitle lesson-text">{t('fft.subtitle')}</p>

      <section className="controls card">
        <label className="field field-wide">
          <span className="field-label">{t('fft.fxLabel')}</span>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck={false}
            aria-invalid={result.error !== undefined}
          />
        </label>
        <label className="field">
          <span className="field-label">{t('fft.presetLabel')}</span>
          <select
            value={PRESETS.find((p) => p.expr === expr)?.name ?? ''}
            onChange={(e) => {
              const p = PRESETS.find((p) => p.name === e.target.value)
              if (p) setExpr(p.expr)
            }}
          >
            <option value="" disabled>
              {t('fft.customOption')}
            </option>
            {PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {t(p.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('fft.samplesLabel')}</span>
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('fft.windowLabel')}</span>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            {WINDOWS.map((w) => (
              <option key={w} value={w}>
                {t('fft.windowOption', { count: w })}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-wide">
          <span className="field-label">
            <Trans i18nKey="fft.keepLabel" components={{ b: <strong /> }} values={{ n: Math.min(keep, maxKeep) }} />
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
          {t('fft.errorEval', { msg: result.error })}
        </p>
      )}

      {d && (
        <>
          <section className="card">
            <div className="card-head">
              <h2>{t('fft.timeTitle')}</h2>
              <div className="legend">
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--series-1)' }} /> {t('fft.legendSampled')}
                </span>
                <span className="legend-item">
                  <span className="chip chip-dashed" style={{ background: 'var(--series-2)' }} />{' '}
                  {t('fft.legendInverse', { count: d.kept.size })}
                </span>
              </div>
            </div>
            <p className="card-note lesson-text">
              {t('fft.timeNote')}
            </p>
            <LineChart
              xs={d.xs}
              xLabel="x"
              yLabel="f(x)"
              series={[
                { name: 'f(x)', color: 'var(--series-1)', values: d.samples },
                { name: t('fft.seriesInverse'), color: 'var(--series-2)', values: d.recon, dashed: true },
              ]}
            />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>{t('fft.waveTitle')}</h2>
              <div className="legend">
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--series-3)' }} /> {t('fft.waveLegend')}
                </span>
              </div>
            </div>
            <p className="card-note lesson-text">
              {t('fft.waveNote')}
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
                      name: c.bin.k === 0 ? t('fft.seriesConstant') : `f = ${fmt(c.bin.freq, 4)}`,
                      color: 'var(--series-3)',
                      values: c.values,
                    },
                  ]}
                />
              </div>
            ))}
            {d.kept.size > MAX_PANELS && (
              <p className="card-note">
                {t('fft.waveShowing', { shown: MAX_PANELS, total: d.kept.size })}
              </p>
            )}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>{t('fft.freqTitle')}</h2>
              <div className="legend">
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--series-1)' }} /> {t('fft.legendKept')}
                </span>
                <span className="legend-item">
                  <span className="chip" style={{ background: 'var(--mark-muted)' }} /> {t('fft.legendDiscarded')}
                </span>
              </div>
            </div>
            <p className="card-note lesson-text">
              {t('fft.freqNote')}
            </p>
            <SpectrumChart bins={d.bins} kept={d.kept} selected={inspected} onSelect={setInspectK} />
          </section>

          <section className="card">
            <div className="card-head">
              <h2>{t('fft.binTitle')}</h2>
            </div>
            <p className="card-note">
              {t('fft.binNote')}
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
              <h2>{t('fft.resultTitle')}</h2>
            </div>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">{t('fft.statKept')}</span>
                <span className="stat-value">{d.kept.size}</span>
              </div>
              <div className="stat">
                <span className="stat-label">{t('fft.statRms')}</span>
                <span className="stat-value">{fmt(d.error, 3)}</span>
              </div>
            </div>
            <p className="card-note lesson-text">
              {t('fft.resultNote')}
            </p>
            <Tex block tex={d.formula} />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('fft.thBin')}</th>
                    <th>{t('fft.thFreq')}</th>
                    <th>{t('fft.thAmp')}</th>
                    <th>{t('fft.thPhase')}</th>
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
