import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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

  const column = (which: 'cosine' | 'sine', ref: number[], prod: number[], sum: number) => {
    const whichName = t(which === 'cosine' ? 'bin.cosine' : 'bin.sine')
    return (
      <div className="explainer-col">
        <p className="mini-title">{t('bin.colRef', { which: whichName, k })}</p>
        <LineChart
          xs={xs}
          compact
          height={110}
          xLabel="x"
          yLabel={t('bin.yRef', { which: whichName })}
          series={[
            { name: 'f(x)', color: 'var(--series-1)', values: samples },
            { name: `${whichName} ref.`, color: 'var(--series-3)', values: ref, dashed: true },
          ]}
        />
        <p className="mini-title">{t('bin.colProd')}</p>
        <LineChart
          xs={xs}
          compact
          height={110}
          xLabel="x"
          yLabel={t('bin.yProd', { which: whichName })}
          yDomain={prodDomain}
          series={[{ name: `f·${whichName}`, color: 'var(--series-2)', values: prod, area: true }]}
        />
        <p className="sum-line">
          Σ f·{whichName} = <strong>{fmt(sum, 4)}</strong>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bin-picker">
        <button onClick={() => onChangeK(Math.max(0, k - 1))} disabled={k === 0} aria-label={t('bin.ariaPrev')}>
          −
        </button>
        <span className="bin-picker-label">
          <Trans i18nKey="bin.picker" components={{ b: <strong /> }} values={{ k, f: fmt(freq, 3) }} />
        </span>
        <button onClick={() => onChangeK(Math.min(maxK, k + 1))} disabled={k === maxK} aria-label={t('bin.ariaNext')}>
          +
        </button>
      </div>

      <div className="paper">
        <p className="card-note lesson-text">
          <Trans i18nKey="bin.intro" components={{ b: <strong /> }} values={{ k }} />
        </p>
        <Tex
          block
          tex={
            'X_k = \\sum_{n=0}^{N-1} f[n]\\,e^{-i\\,2\\pi k n/N} = \\sum_{n=0}^{N-1} f[n]\\left(\\cos\\tfrac{2\\pi k n}{N} - i\\,\\sin\\tfrac{2\\pi k n}{N}\\right)'
          }
        />
        <p className="card-note">{t('bin.plugged')}</p>
        <Tex
          block
          tex={`k = ${k},\\; N = ${n}: \\qquad X_{${k}} = \\sum_{n=0}^{${n - 1}} f[n]\\left(\\cos\\tfrac{2\\pi\\cdot ${k}\\,n}{${n}} - i\\,\\sin\\tfrac{2\\pi\\cdot ${k}\\,n}{${n}}\\right)`}
        />

        <p className="mini-title">{t('bin.rowsTitle', { shown: SHOWN_ROWS, n })}</p>
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
                <td colSpan={5}>{t('bin.sumRow', { n })}</td>
                <td>{f3(sumCos)}</td>
                <td>{f3(sumSin)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="card-note lesson-text">
          {t('bin.assemble')}
        </p>
        <Tex
          block
          tex={`X_{${k}} = \\sum f\\cos\\theta \\;-\\; i\\sum f\\sin\\theta = ${f3(re)} ${im < 0 ? '-' : '+'} ${f3(Math.abs(im))}\\,i`}
        />
        <p className="card-note lesson-text">
          {t('bin.strength', { doubled: twoSided ? '' : t('bin.strengthDoubled') })}
        </p>
        <Tex
          block
          tex={`|X_{${k}}| = \\sqrt{(${f3(re)})^2 + (${f3(im)})^2} = ${f3(mag)} \\qquad A = \\frac{${twoSided ? '' : '2\\cdot'}|X_{${k}}|}{N} = \\frac{${twoSided ? '' : '2\\cdot'}${f3(mag)}}{${n}} = \\mathbf{${fmt(amplitude, 4)}}`}
        />
        <p className="card-note lesson-text">{t('bin.phaseIntro')}</p>
        <Tex
          block
          tex={`\\varphi = \\operatorname{atan2}(${f3(im)},\\, ${f3(re)}) = \\mathbf{${fmt(phase, 4)}\\text{ rad}} \\;\\; (${phaseDeg.toFixed(1)}^\\circ)`}
        />
        <p className="card-note lesson-text">{t('bin.contribIntro')}</p>
        <Tex
          block
          tex={
            twoSided && k === 0
              ? `\\mathbf{${fmt(amplitude * Math.cos(phase), 4)}} \\;\\text{${t('bin.texConstant')}}`
              : `\\mathbf{${fmt(amplitude, 4)}\\,\\cos(2\\pi\\cdot ${fmt(freq, 3)}\\,x ${phase < 0 ? '-' : '+'} ${fmt(Math.abs(phase), 3)})}`
          }
        />
      </div>

      <details className="explainer-details">
        <summary>{t('bin.detailsSummary')}</summary>
        <div className="explainer-grid">
          {column('cosine', cosRef, prodCos, sumCos)}
          {column('sine', sinRef, prodSin, sumSin)}
        </div>
        <p className="card-note">
          {t('bin.whyNote')}
        </p>
      </details>
    </>
  )
}
