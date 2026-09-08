import { describe, expect, it } from 'vitest'
import { dotSlots, outsideCirclePath, regionAnchors, signatureAt, vennConfig } from './venn'

const W = 420
const H = 300

describe('circle layout', () => {
  it('lays out two overlapping circles side by side', () => {
    const cfg = vennConfig(2, W, H)
    expect(cfg.circles).toHaveLength(2)
    const [a, b] = cfg.circles
    expect(a.cy).toBe(b.cy)
    expect(a.cx).toBeLessThan(b.cx)
    // Overlapping means the centres are closer together than two radii.
    expect(b.cx - a.cx).toBeLessThan(a.r + b.r)
  })

  it('lays out three circles with A above B and C', () => {
    const cfg = vennConfig(3, W, H)
    expect(cfg.circles).toHaveLength(3)
    const [a, b, c] = cfg.circles
    expect(a.cy).toBeLessThan(b.cy)
    expect(b.cy).toBeCloseTo(c.cy, 6)
    expect(b.cx).toBeLessThan(c.cx)
  })

  it('keeps every circle inside the box it is drawn in', () => {
    for (const n of [2, 3] as const) {
      const cfg = vennConfig(n, W, H)
      for (const c of cfg.circles) {
        expect(c.cx - c.r).toBeGreaterThanOrEqual(0)
        expect(c.cy - c.r).toBeGreaterThanOrEqual(0)
        expect(c.cx + c.r).toBeLessThanOrEqual(W)
        expect(c.cy + c.r).toBeLessThanOrEqual(H)
      }
    }
  })

  it('stays inside the box at awkward aspect ratios', () => {
    for (const [w, h] of [[200, 400], [800, 120], [300, 300]]) {
      for (const n of [2, 3] as const) {
        for (const c of vennConfig(n, w, h).circles) {
          expect(c.r).toBeGreaterThan(0)
          expect(c.cx - c.r).toBeGreaterThanOrEqual(0)
          expect(c.cy - c.r).toBeGreaterThanOrEqual(0)
          expect(c.cx + c.r).toBeLessThanOrEqual(w)
          expect(c.cy + c.r).toBeLessThanOrEqual(h)
        }
      }
    }
  })
})

describe('signatureAt', () => {
  it('puts a circle centre inside that circle and no other', () => {
    const cfg = vennConfig(3, W, H)
    cfg.circles.forEach((c, i) => {
      expect(signatureAt(cfg, c.cx, c.cy)).toBe(1 << i)
    })
  })

  it('puts the diagram centre inside all three circles', () => {
    const cfg = vennConfig(3, W, H)
    expect(signatureAt(cfg, W / 2, H / 2)).toBe(0b111)
  })

  it('puts a far corner outside every circle', () => {
    for (const n of [2, 3] as const) {
      expect(signatureAt(vennConfig(n, W, H), 1, 1)).toBe(0)
    }
  })

  it('never reports a circle that does not exist', () => {
    const cfg = vennConfig(2, W, H)
    for (let y = 0; y < H; y += 7) {
      for (let x = 0; x < W; x += 7) expect(signatureAt(cfg, x, y)).toBeLessThanOrEqual(0b11)
    }
  })
})

describe('region anchors', () => {
  it('finds every region of a three-circle diagram', () => {
    const cfg = vennConfig(3, W, H)
    const anchors = regionAnchors(cfg)
    expect(anchors).toHaveLength(8)
    anchors.forEach((a, sig) => {
      expect(a.rIn, `region ${sig} was never found`).toBeGreaterThan(0)
    })
  })

  it('finds every region of a two-circle diagram', () => {
    const anchors = regionAnchors(vennConfig(2, W, H))
    expect(anchors).toHaveLength(4)
    for (const a of anchors) expect(a.rIn).toBeGreaterThan(0)
  })

  it('places each anchor in the region it belongs to', () => {
    const cfg = vennConfig(3, W, H)
    regionAnchors(cfg).forEach((a, sig) => {
      expect(signatureAt(cfg, a.x, a.y), `anchor for region ${sig} landed elsewhere`).toBe(sig)
    })
  })

  it('leaves the three-way region room enough for a label', () => {
    const cfg = vennConfig(3, W, H)
    expect(regionAnchors(cfg)[0b111].rIn).toBeGreaterThan(10)
  })
})

describe('dot slots', () => {
  it('centres a lone dot on the anchor', () => {
    const [[x, y]] = dotSlots({ x: 50, y: 60, rIn: 30 }, 1)
    expect(x).toBe(50)
    expect(y).toBe(60)
  })

  it('keeps every dot within the clearance', () => {
    const anchor = { x: 100, y: 100, rIn: 30 }
    for (const k of [1, 2, 5, 12]) {
      for (const [x, y] of dotSlots(anchor, k)) {
        expect(Math.hypot(x - anchor.x, y - anchor.y)).toBeLessThanOrEqual(anchor.rIn)
      }
    }
  })

  it('produces one slot per dot and never collapses them onto each other', () => {
    const slots = dotSlots({ x: 0, y: 0, rIn: 40 }, 8)
    expect(slots).toHaveLength(8)
    const seen = new Set(slots.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`))
    expect(seen.size).toBe(8)
  })

  it('degrades to the anchor rather than escaping a cramped region', () => {
    for (const [x, y] of dotSlots({ x: 10, y: 10, rIn: 2 }, 4)) {
      expect(x).toBeCloseTo(10, 6)
      expect(y).toBeCloseTo(10, 6)
    }
  })
})

describe('outsideCirclePath', () => {
  it('draws the box first and the circle as a second subpath', () => {
    const d = outsideCirclePath({ cx: 50, cy: 50, r: 20 }, 100, 80)
    expect(d.startsWith('M0,0 H100 V80 H0 Z')).toBe(true)
    // Two arc commands close the circle, which is what the even-odd rule needs
    // in order to punch it out of the box.
    expect(d.match(/a/g)).toHaveLength(2)
  })
})
