/**
 * Venn diagram geometry. Pure, no React.
 *
 * Regions are never described as shapes here. A point's region is found by
 * asking which circles contain it, which makes hit-testing three squared
 * distance comparisons instead of arc mathematics. Shading then happens in the
 * component with one SVG mask per region.
 */

export interface Circle {
  cx: number
  cy: number
  r: number
}

export interface VennConfig {
  n: number
  w: number
  h: number
  circles: Circle[]
}

/**
 * Centre offset as a fraction of the radius. Below 1 the circles overlap; this
 * value keeps all regions, including the three-way one, comfortably large
 * enough to hold a count label.
 */
const D_RATIO = 0.58

/** Circle layout for a diagram of the given pixel size. */
export function vennConfig(n: 2 | 3, w: number, h: number): VennConfig {
  if (n === 2) {
    const r = Math.min(w / (2 + 2 * D_RATIO), h / 2) * 0.86
    const d = D_RATIO * r
    return {
      n,
      w,
      h,
      circles: [
        { cx: w / 2 - d, cy: h / 2, r },
        { cx: w / 2 + d, cy: h / 2, r },
      ],
    }
  }
  const r = Math.min(w / (2 + 1.74 * D_RATIO), h / (2 + 1.5 * D_RATIO)) * 0.88
  const d = D_RATIO * r
  const at = (deg: number): Circle => ({
    cx: w / 2 + d * Math.cos((deg * Math.PI) / 180),
    cy: h / 2 - d * Math.sin((deg * Math.PI) / 180),
    r,
  })
  // A on top, then B lower left and C lower right.
  return { n, w, h, circles: [at(90), at(210), at(330)] }
}

/** Which region a point lies in: bit `i` set when circle `i` contains it. */
export function signatureAt(cfg: VennConfig, x: number, y: number): number {
  let sig = 0
  for (let i = 0; i < cfg.circles.length; i++) {
    const c = cfg.circles[i]
    const dx = x - c.cx
    const dy = y - c.cy
    if (dx * dx + dy * dy <= c.r * c.r) sig |= 1 << i
  }
  return sig
}

export interface Anchor {
  x: number
  y: number
  /** Distance to the nearest boundary, so callers know how much room they have. */
  rIn: number
}

/**
 * The deepest point of each region, found by scanning rather than derived. One
 * routine covers two circles, three circles and the outside region, and the
 * clearance it returns is what lets dots pack without escaping.
 */
export function regionAnchors(cfg: VennConfig, step = 4): Anchor[] {
  const out: Anchor[] = Array.from({ length: 1 << cfg.n }, () => ({ x: 0, y: 0, rIn: -1 }))
  for (let y = step / 2; y < cfg.h; y += step) {
    for (let x = step / 2; x < cfg.w; x += step) {
      const sig = signatureAt(cfg, x, y)
      let clear = Math.min(x, y, cfg.w - x, cfg.h - y)
      for (const c of cfg.circles) {
        clear = Math.min(clear, Math.abs(Math.hypot(x - c.cx, y - c.cy) - c.r))
      }
      if (clear > out[sig].rIn) out[sig] = { x, y, rIn: clear }
    }
  }
  return out
}

/**
 * Positions for `k` dots inside a region, spiralled out from its anchor so they
 * stay inside the clearance however many there are.
 */
export function dotSlots(a: Anchor, k: number, pad = 8): Array<[number, number]> {
  const radius = Math.max(a.rIn - pad, 0)
  const golden = 2.399963229728653
  return Array.from({ length: k }, (_, i) => {
    const rr = k === 1 ? 0 : radius * Math.sqrt((i + 0.5) / k) * 0.82
    const th = i * golden
    return [a.x + rr * Math.cos(th), a.y + rr * Math.sin(th)] as [number, number]
  })
}

/**
 * A path covering everything **except** the circle, as an outer rectangle plus
 * the circle as a second subpath under the even-odd rule. Painted black inside a
 * mask this is how a region intersects with one circle.
 */
export function outsideCirclePath(c: Circle, w: number, h: number): string {
  const { cx, cy, r } = c
  return (
    `M0,0 H${w} V${h} H0 Z ` +
    `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`
  )
}
