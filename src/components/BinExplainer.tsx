import { useMemo } from 'react'
import { fmt } from '../lib/analysis'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

interface Props {
  xs: number[]
  samples: number[]
  period: number
  k: number
  maxK: number
  onChangeK: (k: number) => void
}

const SHOWN_ROWS = 8

/**
 * The DFT of one bin worked out the way you would on paper: the formula,
 * a table of terms, the sums, and the amplitude/phase assembly. A collapsible
 * graphical view shows why the sums single out the bin's frequency.
 */
export function BinExplainer({ xs, samples, period, k, maxK, onChangeK }: Props) {
  const n = samples.length

  const { cosRef, sinRef, prodCos, prodSin, sumCos, sumSin } = useMemo(() => {
    const cosRef = new Array<number>(n)
    const sinRef = new Array<number>(n)
    const prodCos = new Array<number>(n)
    const prodSin = new Array<number>(n)
    let sumCos = 0
    let sumSin = 0
    for (let i = 0; i < n; i++) {
      const theta = (2 * Math.PI * k * i) / n
      cosRef[i] = Math.cos(theta)
      sinRef[i] = Math.sin(theta)
      prodCos[i] = samples[i] * cosRef[i]
      prodSin[i] = samples[i] * sinRef[i]
      sumCos += prodCos[i]
      sumSin += prodSin[i]
    }
    return { cosRef, sinRef, prodCos, prodSin, sumCos, sumSin }
  }, [samples, k, n])

  // DFT bin: X_k = sum f[n] * (cos(theta) - i*sin(theta))
  const re = sumCos
  const im = -sumSin
  const mag = Math.hypot(re, im)
  const twoSided = k === 0 || k === n / 2
  const amplitude = (mag * (twoSided ? 1 : 2)) / n
  const phase = Math.atan2(im, re)
  const phaseDeg = (phase * 180) / Math.PI
  const freq = k / period

  const f3 = (v: number) => (Object.is(v, -0) ? 0 : v).toFixed(3)

  const prodDomain: [number, number] = useMemo(() => {
    let m = 0
    for (let i = 0; i < n; i++) {
      const a = Math.abs(prodCos[i])
      const b = Math.abs(prodSin[i])
      if (a > m) m = a
      if (b > m) m = b
    }
    return [-(m * 1.1 || 1), m * 1.1 || 1]
  }, [prodCos, prodSin, n])

  const column = (which: 'cosine' | 'sine', ref: number[], prod: number[], sum: number) => (
    <div className="explainer-col">
      <p className="mini-title">
        signal × {which} reference ({k} cycle{k === 1 ? '' : 's'} per window)
      </p>
      <LineChart
        xs={xs}
        compact
        height={110}
        xLabel="x"
        yLabel={`signal and ${which} reference`}
        series={[
          { name: 'f(x)', color: 'var(--series-1)', values: samples },
          { name: `${which} ref`, color: 'var(--series-3)', values: ref, dashed: true },
        ]}
      />
      <p className="mini-title">their product — the shaded area is the sum</p>
      <LineChart
        xs={xs}
        compact
        height={110}
        xLabel="x"
        yLabel={`product with ${which}`}
        yDomain={prodDomain}
        series={[{ name: `f·${which}`, color: 'var(--series-2)', values: prod, area: true }]}
      />
      <p className="sum-line">
        Σ f·{which} = <strong>{fmt(sum, 4)}</strong>
      </p>
    </div>
  )

  return (
    <>
      <div className="bin-picker">
        <button onClick={() => onChangeK(Math.max(0, k - 1))} disabled={k === 0} aria-label="previous bin">
          −
        </button>
        <span className="bin-picker-label">
          bin k = <strong>{k}</strong> · the wave with {k} cycle{k === 1 ? '' : 's'} per window
          (f = {fmt(freq, 3)})
        </span>
        <button onClick={() => onChangeK(Math.min(maxK, k + 1))} disabled={k === maxK} aria-label="next bin">
          +
        </button>
      </div>

      <div className="paper">
        <p className="card-note lesson-text">
          A "bin" is one slot of the transform's output. Bin k asks a single question:{' '}
          <strong>how much of the signal is a wave that repeats exactly {k} time{k === 1 ? '' : 's'} across
          the window?</strong> To answer it, the DFT compares the signal against that wave,
          sample by sample: multiply them together and add everything up. Where the signal moves
          in step with the reference wave the products pile up; where it doesn't, they cancel.
          The whole definition is one line (the e-power is just shorthand for a cosine and sine
          pair):
        </p>
        <Tex
          block
          tex={
            'X_k = \\sum_{n=0}^{N-1} f[n]\\,e^{-i\\,2\\pi k n/N} = \\sum_{n=0}^{N-1} f[n]\\left(\\cos\\tfrac{2\\pi k n}{N} - i\\,\\sin\\tfrac{2\\pi k n}{N}\\right)'
          }
        />
        <p className="card-note">With this bin's numbers plugged in:</p>
        <Tex
          block
          tex={`k = ${k},\\; N = ${n}: \\qquad X_{${k}} = \\sum_{n=0}^{${n - 1}} f[n]\\left(\\cos\\tfrac{2\\pi\\cdot ${k}\\,n}{${n}} - i\\,\\sin\\tfrac{2\\pi\\cdot ${k}\\,n}{${n}}\\right)`}
        />

        <p className="mini-title">One row per sample — first {SHOWN_ROWS} of {n} rows:</p>
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>n</th>
                <th>f[n]</th>
                <th>θ = 2π·{k}·n/{n}</th>
                <th>cos θ</th>
                <th>sin θ</th>
                <th>f[n]·cos θ</th>
                <th>f[n]·sin θ</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: SHOWN_ROWS }, (_, i) => (
                <tr key={i}>
                  <td>{i}</td>
                  <td>{f3(samples[i])}</td>
                  <td>{f3((2 * Math.PI * k * i) / n)}</td>
                  <td>{f3(cosRef[i])}</td>
                  <td>{f3(sinRef[i])}</td>
                  <td>{f3(prodCos[i])}</td>
                  <td>{f3(prodSin[i])}</td>
                </tr>
              ))}
              <tr className="ellipsis-row">
                <td>⋮</td>
                <td>⋮</td>
                <td>⋮</td>
                <td>⋮</td>
                <td>⋮</td>
                <td>⋮</td>
                <td>⋮</td>
              </tr>
              <tr className="total-row">
                <td colSpan={5}>Σ over all {n} rows</td>
                <td>{f3(sumCos)}</td>
                <td>{f3(sumSin)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="card-note lesson-text">
          Now assemble the answer from the two column totals. The cosine total becomes the real
          part, the sine total (with its sign flipped, from the −i in the definition) becomes
          the imaginary part:
        </p>
        <Tex
          block
          tex={`X_{${k}} = \\sum f\\cos\\theta \\;-\\; i\\sum f\\sin\\theta = ${f3(re)} ${im < 0 ? '-' : '+'} ${f3(Math.abs(im))}\\,i`}
        />
        <p className="card-note lesson-text">
          Those two numbers hold the wave's strength and its shift. The strength (amplitude) is
          the length of the pair, read off with Pythagoras{twoSided ? '' : ', doubled because a real signal splits its energy between this bin and its mirror twin'}:
        </p>
        <Tex
          block
          tex={`|X_{${k}}| = \\sqrt{(${f3(re)})^2 + (${f3(im)})^2} = ${f3(mag)} \\qquad A = \\frac{${twoSided ? '' : '2\\cdot'}|X_{${k}}|}{N} = \\frac{${twoSided ? '' : '2\\cdot'}${f3(mag)}}{${n}} = \\mathbf{${fmt(amplitude, 4)}}`}
        />
        <p className="card-note lesson-text">The shift (phase) is the pair's angle:</p>
        <Tex
          block
          tex={`\\varphi = \\operatorname{atan2}(${f3(im)},\\, ${f3(re)}) = \\mathbf{${fmt(phase, 4)}\\text{ rad}} \\;\\; (${phaseDeg.toFixed(1)}^\\circ)`}
        />
        <p className="card-note lesson-text">So this bin contributes one wave to the signal:</p>
        <Tex
          block
          tex={
            twoSided && k === 0
              ? `\\mathbf{${fmt(amplitude * Math.cos(phase), 4)}} \\;\\text{(a constant — the average level)}`
              : `\\mathbf{${fmt(amplitude, 4)}\\,\\cos(2\\pi\\cdot ${fmt(freq, 3)}\\,x ${phase < 0 ? '-' : '+'} ${fmt(Math.abs(phase), 3)})}`
          }
        />
      </div>

      <details className="explainer-details">
        <summary>Why the sums single out this frequency (graphical view)</summary>
        <div className="explainer-grid">
          {column('cosine', cosRef, prodCos, sumCos)}
          {column('sine', sinRef, prodSin, sumSin)}
        </div>
        <p className="card-note">
          If the signal contains this frequency it stays in step with the reference, the products
          pile up on one side of zero, and the sum is large. Any other frequency drifts in and
          out of step, so the shaded area cancels toward 0.
        </p>
      </details>
    </>
  )
}
