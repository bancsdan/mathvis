import i18n from 'i18next'
import { renderToStaticMarkup } from 'react-dom/server'
import { initReactI18next } from 'react-i18next'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Pt } from '../lib/geometry'
import hu from '../i18n/locales/hu.json'
import { GeoFigure } from './GeoFigure'

// The real hook measures the container with a ResizeObserver and there is no
// DOM here, so the figure is handed a width instead. Everything else — the
// world-to-pixel map, the drawing kit, the handles — is the real thing.
vi.mock('./useWidth', () => ({ useWidth: () => [{ current: null }, 480] }))

const A: Pt = { x: 1, y: 1 }
const B: Pt = { x: 5, y: 4 }

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    resources: { hu: { translation: hu } },
    lng: 'hu',
    interpolation: { escapeValue: false },
  })
})

/**
 * The one figure component of the geometry lessons, rendered to markup. It
 * cannot check what a drag does without a browser, but it does pin the shape
 * every card relies on: a labelled `role="img"` svg, the drawing the card
 * asked for, and one focusable handle per draggable point.
 */
describe('GeoFigure', () => {
  const html = () =>
    renderToStaticMarkup(
      <GeoFigure
        world={{ minX: 0, maxX: 8, minY: 0, maxY: 6 }}
        ariaLabel="Két pont és a szakaszuk"
        points={[
          { id: 'A', p: A, label: 'A', draggable: true },
          { id: 'B', p: B, label: 'B', draggable: true, color: 'var(--series-2)' },
          { id: 'M', p: { x: 3, y: 2.5 } },
        ]}
        onDrag={() => {}}
      >
        {(g) => g.segment(A, B)}
      </GeoFigure>
    )

  it('draws a labelled figure inside a .chart-box', () => {
    const out = html()
    expect(out).toContain('class="chart-box"')
    expect(out).toContain('role="img"')
    expect(out).toContain('aria-label="Két pont és a szakaszuk"')
  })

  it('draws what the card asked for, mapped into pixels', () => {
    const out = html()
    // The segment runs from A up to B: to the right and, on the screen, up.
    const line = out.match(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/)
    expect(line).not.toBeNull()
    const [x1, y1, x2, y2] = line!.slice(1).map(Number)
    expect(x2).toBeGreaterThan(x1)
    expect(y2).toBeLessThan(y1)
  })

  it('gives every draggable point a handle the keyboard can reach', () => {
    const out = html()
    expect(out.match(/class="geo-point"/g)).toHaveLength(2)
    expect(out.match(/tabindex="0"/g)).toHaveLength(2)
    expect(out).toContain('aria-label="A: húzd az egérrel vagy mozgasd a nyilakkal"')
  })

  it('leaves a point that is not draggable without a handle', () => {
    expect(html()).not.toContain('aria-label="M:')
  })
})
