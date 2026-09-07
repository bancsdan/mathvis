import { compile } from 'mathjs/number'
import type { Spectrum } from './fft'

/** Sample f(x) at n points over [0, period). Throws with a readable message on bad input. */
export function sampleFunction(expr: string, n: number, period: number): number[] {
  const code = compile(expr)
  const out = new Array<number>(n)
  for (let i = 0; i < n; i++) {
    const x = (i / n) * period
    const v: unknown = code.evaluate({ x, t: x })
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`f(${x.toPrecision(3)}) did not evaluate to a finite number`)
    }
    out[i] = v
  }
  return out
}

export interface Bin {
  k: number
  /** Frequency in cycles per period-unit (Hz when x is seconds). */
  freq: number
  /** Real-signal amplitude of this component. */
  amplitude: number
  /** Phase in radians of A*cos(2*pi*f*x + phi). */
  phase: number
}

/** Amplitude/phase view of the one-sided spectrum (k = 0..N/2). */
export function oneSidedBins(spec: Spectrum, period: number): Bin[] {
  const n = spec.re.length
  const half = n >> 1
  const bins: Bin[] = []
  for (let k = 0; k <= half; k++) {
    const scale = k === 0 || k === half ? 1 / n : 2 / n
    bins.push({
      k,
      freq: k / period,
      amplitude: Math.hypot(spec.re[k], spec.im[k]) * scale,
      phase: Math.atan2(spec.im[k], spec.re[k]),
    })
  }
  return bins
}

export function rmsError(a: readonly number[], b: readonly number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return Math.sqrt(sum / a.length)
}

const fmt = (v: number, digits = 3): string => {
  const s = v.toPrecision(digits)
  return s.includes('.') ? s.replace(/\.?0+$/, '').replace(/\.?0+e/, 'e') : s
}

/** One kept component rendered as text: a constant for DC, otherwise A*cos(2*pi*f*x + phi). */
export function termText(b: Bin): string {
  if (b.k === 0) return fmt(b.amplitude * Math.cos(b.phase))
  const sign = b.phase >= 0 ? '+' : '\u2212'
  return `${fmt(b.amplitude)}\u00b7cos(2\u03c0\u00b7${fmt(b.freq)}\u00b7x ${sign} ${fmt(Math.abs(b.phase))})`
}

/** Human-readable sum of the kept cosine components. */
export function formulaText(bins: Bin[], kept: Set<number>, maxTerms = 6): string {
  const keptBins = bins.filter((b) => kept.has(b.k)).sort((a, b) => a.k - b.k)
  const terms = keptBins.slice(0, maxTerms).map(termText)
  if (keptBins.length > maxTerms) terms.push('\u2026')
  return terms.length > 0 ? `f(x) \u2248 ${terms.join(' + ')}` : 'f(x) \u2248 0'
}

/** The kept components as a LaTeX sum for KaTeX rendering. */
export function formulaTex(bins: Bin[], kept: Set<number>, maxTerms = 6): string {
  const keptBins = bins.filter((b) => kept.has(b.k)).sort((a, b) => a.k - b.k)
  const terms: string[] = []
  for (const b of keptBins.slice(0, maxTerms)) {
    if (b.k === 0) {
      terms.push(fmt(b.amplitude * Math.cos(b.phase)))
    } else {
      const sign = b.phase >= 0 ? '+' : '-'
      terms.push(
        `${fmt(b.amplitude)}\\,\\cos(2\\pi\\cdot ${fmt(b.freq)}\\,x ${sign} ${fmt(Math.abs(b.phase))})`
      )
    }
  }
  if (keptBins.length > maxTerms) terms.push('\\dots')
  return `f(x) \\approx ${terms.length > 0 ? terms.join(' + ') : '0'}`
}

/** Time-domain samples of a single spectrum component: A*cos(2*pi*k*i/n + phi). */
export function componentSamples(b: Bin, n: number): number[] {
  const out = new Array<number>(n)
  for (let i = 0; i < n; i++) {
    out[i] = b.amplitude * Math.cos((2 * Math.PI * b.k * i) / n + b.phase)
  }
  return out
}

export { fmt }
