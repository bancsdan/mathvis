/** Round-numbered axis ticks covering [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return []
  if (min === max) {
    const pad = Math.abs(min) > 1e-12 ? Math.abs(min) * 0.5 : 1
    min -= pad
    max += pad
  }
  const span = max - min
  const rawStep = span / count
  const mag = 10 ** Math.floor(Math.log10(rawStep))
  const norm = rawStep / mag
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  }
  return ticks
}

export function tickLabel(v: number): string {
  if (v === 0) return '0'
  const abs = Math.abs(v)
  if (abs >= 1000 || abs < 0.001) return v.toExponential(1)
  const s = v.toPrecision(3)
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s
}
