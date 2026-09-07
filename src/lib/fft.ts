/** Iterative radix-2 Cooley-Tukey FFT. Operates in place; length must be a power of two. */
export function fftInPlace(re: Float64Array, im: Float64Array, invert: boolean): void {
  const n = re.length
  if (n === 0 || (n & (n - 1)) !== 0) throw new Error('FFT size must be a power of two')

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr
      const ti = im[i]; im[i] = im[j]; im[j] = ti
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((2 * Math.PI) / len) * (invert ? 1 : -1)
    const wRe = Math.cos(ang)
    const wIm = Math.sin(ang)
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      let curRe = 1
      let curIm = 0
      for (let j = 0; j < half; j++) {
        const a = i + j
        const b = i + j + half
        const vRe = re[b] * curRe - im[b] * curIm
        const vIm = re[b] * curIm + im[b] * curRe
        re[b] = re[a] - vRe
        im[b] = im[a] - vIm
        re[a] += vRe
        im[a] += vIm
        const nextRe = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe
        curRe = nextRe
      }
    }
  }

  if (invert) {
    for (let i = 0; i < n; i++) {
      re[i] /= n
      im[i] /= n
    }
  }
}

export interface Spectrum {
  re: Float64Array
  im: Float64Array
}

/** Forward FFT of a real signal. */
export function forwardFFT(samples: readonly number[]): Spectrum {
  const re = Float64Array.from(samples)
  const im = new Float64Array(samples.length)
  fftInPlace(re, im, false)
  return { re, im }
}

export interface Reconstruction {
  samples: number[]
  kept: Set<number>
}

/**
 * Keep the `keep` strongest bins (k = 0..N/2, conjugate mirrors included),
 * zero the rest, and inverse-FFT back to the time domain.
 */
export function inverseTopK(spec: Spectrum, keep: number): Reconstruction {
  const n = spec.re.length
  const half = n >> 1
  const ranked: Array<{ k: number; mag: number }> = []
  for (let k = 0; k <= half; k++) {
    ranked.push({ k, mag: Math.hypot(spec.re[k], spec.im[k]) })
  }
  ranked.sort((a, b) => b.mag - a.mag)
  const kept = new Set<number>()
  for (const { k, mag } of ranked) {
    if (kept.size >= keep) break
    if (mag < 1e-12) break
    kept.add(k)
  }

  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (const k of kept) {
    re[k] = spec.re[k]
    im[k] = spec.im[k]
    if (k > 0 && k < half) {
      re[n - k] = spec.re[n - k]
      im[n - k] = spec.im[n - k]
    }
  }
  fftInPlace(re, im, true)
  return { samples: Array.from(re), kept }
}
