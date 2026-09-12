import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { angleAt, cross, dist, fmt, segmentsParallel, sub, type Pt } from '../lib/geometry'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

/** The corners, in order around the outline. */
const LETTERS = ['A', 'B', 'C', 'D']

/**
 * Everything is measured on a dragged figure, so nothing is ever exact. The
 * sine tolerance of the parallel test and the relative tolerance of the length
 * test are both about a degree's worth of slack — close enough that a reader
 * can land on a rhombus by hand, tight enough that it is not handed out.
 */
const PAR_TOL = 0.02
const LEN_TOL = 0.02
const RIGHT_TOL = 1.2

/** From the loosest name to the strictest: the order the result line reads. */
const NAMES = [
  'trapez',
  'huurtrapez',
  'parallelogram',
  'deltoid',
  'rectangle',
  'rhombus',
  'square',
] as const

type Name = (typeof NAMES)[number]

const PRESETS: Array<{ id: string; pts: Pt[] }> = [
  {
    id: 'general',
    pts: [
      { x: -4, y: -2.4 },
      { x: 4.4, y: -3 },
      { x: 3, y: 2.6 },
      { x: -2.6, y: 1.6 },
    ],
  },
  {
    id: 'trapez',
    pts: [
      { x: -4, y: -2.5 },
      { x: 4, y: -2.5 },
      { x: 2.5, y: 2.5 },
      { x: -1.5, y: 2.5 },
    ],
  },
  {
    id: 'huurtrapez',
    pts: [
      { x: -4, y: -2.5 },
      { x: 4, y: -2.5 },
      { x: 2, y: 2.5 },
      { x: -2, y: 2.5 },
    ],
  },
  {
    id: 'parallelogram',
    pts: [
      { x: -4, y: -2.5 },
      { x: 2, y: -2.5 },
      { x: 4, y: 2.5 },
      { x: -2, y: 2.5 },
    ],
  },
  {
    id: 'deltoid',
    pts: [
      { x: 0, y: -3.2 },
      { x: 2.2, y: 0 },
      { x: 0, y: 2.6 },
      { x: -2.2, y: 0 },
    ],
  },
  {
    id: 'square',
    pts: [
      { x: -2.5, y: -2.5 },
      { x: 2.5, y: -2.5 },
      { x: 2.5, y: 2.5 },
      { x: -2.5, y: 2.5 },
    ],
  },
]

/** Two measured lengths that count as the same on a hand-dragged figure. */
const sameLength = (a: number, b: number) => Math.abs(a - b) <= LEN_TOL * Math.max(a, b, 1e-9)

/**
 * Whether the open segments AB and CD cross. `geometry.ts` intersects lines,
 * not segments, and the classification needs to know whether the outline is a
 * quadrilateral at all before it starts naming it.
 */
function segmentsCross(A: Pt, B: Pt, C: Pt, D: Pt): boolean {
  const d1 = cross(sub(B, A), sub(C, A))
  const d2 = cross(sub(B, A), sub(D, A))
  const d3 = cross(sub(D, C), sub(A, C))
  const d4 = cross(sub(D, C), sub(B, C))
  return d1 * d2 < 0 && d3 * d4 < 0
}

/** An outline whose opposite sides cross is not a quadrilateral. */
const isSimple = (p: Pt[]) =>
  !segmentsCross(p[0], p[1], p[2], p[3]) && !segmentsCross(p[1], p[2], p[3], p[0])

/**
 * Every name the shape earns, from the loosest to the strictest. A square
 * collects all seven, which is the whole point of the explorer.
 */
function classify(p: Pt[]): Name[] {
  const [A, B, C, D] = p
  const ab = dist(A, B)
  const bc = dist(B, C)
  const cd = dist(C, D)
  const da = dist(D, A)
  // AB against DC and BC against AD: the two pairs of opposite sides.
  const par1 = segmentsParallel(A, B, D, C, PAR_TOL)
  const par2 = segmentsParallel(B, C, A, D, PAR_TOL)
  const para = par1 && par2
  const rhombus = sameLength(ab, bc) && sameLength(bc, cd) && sameLength(cd, da)
  const rectangle = para && Math.abs(angleAt(D, A, B) - 90) <= RIGHT_TOL

  const out: Name[] = []
  if (par1 || par2) out.push('trapez')
  // A trapezoid with equal diagonals is the one with a circumscribed circle.
  if ((par1 || par2) && sameLength(dist(A, C), dist(B, D))) out.push('huurtrapez')
  if (para) out.push('parallelogram')
  if ((sameLength(ab, bc) && sameLength(cd, da)) || (sameLength(bc, cd) && sameLength(da, ab)))
    out.push('deltoid')
  if (rectangle) out.push('rectangle')
  if (rhombus) out.push('rhombus')
  if (rectangle && rhombus) out.push('square')
  return out
}

/** The statements of the exercise; two of the three are true. */
const CLAIMS = ['rectPara', 'rhombusSquare', 'squareRhombus'] as const
const CLAIM_ANSWER = 'rectPara|squareRhombus'

/**
 * Minden négyzet téglalap?
 *
 * Four corners to drag and one classifier that names every family the shape
 * belongs to at once. Dragging a square out of true drops the names one by one,
 * which is the fastest way to see that the names nest rather than exclude.
 */
export function PolyFamilyCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [pts, setPts] = useState<Pt[]>(PRESETS[PRESETS.length - 1].pts)
  const [preset, setPreset] = useState('square')
  const [picked, setPicked] = useState<string[]>([])

  const simple = isSimple(pts)
  const names = simple ? classify(pts) : []
  const sides = pts.map((p, i) => dist(p, pts[(i + 1) % 4]))
  const angles = pts.map((p, i) => angleAt(pts[(i + 3) % 4], p, pts[(i + 1) % 4]))

  const move = (pid: string, p: Pt) => {
    const i = LETTERS.indexOf(pid)
    if (i < 0) return
    setPts(pts.map((old, j) => (j === i ? p : old)))
    setPreset('')
  }

  const toggleClaim = (claim: string) =>
    setPicked(picked.includes(claim) ? picked.filter((c) => c !== claim) : [...picked, claim])

  const answerKey = [...picked].sort().join('|')
  const values = {
    a: fmt(sides[0], sep),
    b: fmt(sides[1], sep),
    c: fmt(sides[2], sep),
    d: fmt(sides[3], sep),
    al: fmt(angles[0], sep, 0),
    be: fmt(angles[1], sep, 0),
    ga: fmt(angles[2], sep, 0),
    de: fmt(angles[3], sep, 0),
    names: names.map((n) => t(`poly.name_${n}`)).join(t('poly.familyJoin')),
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('poly.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="poly.familyIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('poly.familyPresetAria')}>
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={preset === item.id ? 'pill active' : 'pill'}
            aria-pressed={preset === item.id}
            onClick={() => {
              setPts(item.pts)
              setPreset(item.id)
            }}
          >
            {t(`poly.preset_${item.id}`)}
          </button>
        ))}
      </div>

      <GeoFigure
        world={{ minX: -6, maxX: 6, minY: -4, maxY: 4 }}
        height={320}
        ariaLabel={t('poly.familyAria')}
        points={pts.map((p, i) => ({
          id: LETTERS[i],
          p,
          label: LETTERS[i],
          draggable: true,
          color: 'var(--series-1)',
        }))}
        onDrag={move}
        clamp={(_pid, p) => ({
          x: Math.min(5.6, Math.max(-5.6, p.x)),
          y: Math.min(3.6, Math.max(-3.6, p.y)),
        })}
      >
        {(g) => (
          <>
            {g.polygon(pts, { color: 'var(--series-1)' })}
            {g.segment(pts[0], pts[2], { color: 'var(--axis)', dashed: true, muted: true, width: 1.5 })}
            {g.segment(pts[1], pts[3], { color: 'var(--axis)', dashed: true, muted: true, width: 1.5 })}
            {pts.map((p, i) => (
              <g key={LETTERS[i]}>
                {g.length(p, pts[(i + 1) % 4], fmt(sides[i], sep))}
                {Math.abs(angles[i] - 90) <= RIGHT_TOL &&
                  g.angle(pts[(i + 3) % 4], p, pts[(i + 1) % 4], {
                    right: true,
                    radius: 13,
                    color: 'var(--accent-select)',
                  })}
              </g>
            ))}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={
            !simple
              ? 'poly.familyResultCrossed'
              : names.length === 0
                ? 'poly.familyResultNone'
                : 'poly.familyResult'
          }
          values={values}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="poly.familyNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="poly.familyTask"
        isCorrect={answerKey === CLAIM_ANSWER}
        canCheck={picked.length > 0}
        answerKey={answerKey}
        solutionKey={CLAIM_ANSWER}
        onReveal={() => setPicked(CLAIM_ANSWER.split('|'))}
        hintKey="poly.familyHint"
      >
        <div className="pill-row" role="group" aria-label={t('poly.familyOptAria')}>
          {CLAIMS.map((claim) => (
            <button
              key={claim}
              type="button"
              className={picked.includes(claim) ? 'pill active' : 'pill'}
              aria-pressed={picked.includes(claim)}
              onClick={() => toggleClaim(claim)}
            >
              {t(`poly.opt_${claim}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
