import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  add,
  angleAt,
  cross,
  dist,
  fmt,
  lineIntersect,
  rad,
  reflectLine,
  scale,
  sub,
  type Pt,
} from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const WORLD = { minX: -7, maxX: 7, minY: -4.5, maxY: 4.5 }

/** The shape is deliberately lopsided: a symmetric one hides the turn. */
const SHAPE: Pt[] = [
  { x: -3.6, y: -0.2 },
  { x: -2.4, y: 0.2 },
  { x: -3, y: -1.6 },
]

/** The first axis is pinned here; the second one's anchor is the dragged point. */
const ANCHOR1: Pt = { x: 0, y: 0 }
const START2: Pt = { x: 1.2, y: 0.6 }

const ANSWER = '80'

const dirOf = (a: number): Pt => ({ x: Math.cos(rad(a)), y: Math.sin(rad(a)) })

/** The direction of B seen from A, in degrees, the way `g.arc` counts them. */
const bearing = (A: Pt, B: Pt): number => (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI

/** Brought into (−180, 180], so a turn is drawn the short way round. */
const signedTurn = (a: number): number => (((a + 180) % 360) + 360) % 360 - 180

/** Keeps the second axis's anchor where both axes still cross the picture. */
const hold = (p: Pt): Pt => ({
  x: Math.min(4, Math.max(-4, p.x)),
  y: Math.min(3, Math.max(-3, p.y)),
})

/**
 * Két tükrözés egymás után: forgatás vagy eltolás?
 *
 * The composite is never a third reflection: with the axes crossing it is a
 * rotation about their meeting point, with the axes parallel a translation —
 * and in both cases the amount is exactly twice what the axes themselves show.
 * Both numbers are measured off the finished picture rather than quoted, so
 * setting the sliders equal really does turn one sentence into the other.
 */
export function TransComposeCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [alpha, setAlpha] = useState(90)
  const [beta, setBeta] = useState(120)
  const [anchor2, setAnchor2] = useState<Pt>(START2)
  const [answer, setAnswer] = useState('')

  const d1 = dirOf(alpha)
  const d2 = dirOf(beta)
  const far1 = add(ANCHOR1, d1)
  const far2 = add(anchor2, d2)

  const once = SHAPE.map((p) => reflectLine(p, ANCHOR1, far1))
  const twice = once.map((p) => reflectLine(p, anchor2, far2))
  const V = SHAPE[0]
  const V2 = twice[0]

  const parallel = alpha === beta
  const centre = parallel ? null : lineIntersect(ANCHOR1, far1, anchor2, far2)

  // The mark has to sit in the acute corner: the obtuse one is 180° − φ, and
  // twice that is not what the picture turns by.
  const gap = Math.abs(beta - alpha)
  const acute = gap <= 90 ? d2 : scale(d2, -1)
  const phi = centre ? angleAt(add(centre, d1), centre, add(centre, acute)) : 0
  const rot = centre ? angleAt(V, centre, V2) : 0
  // The distance of two parallel lines: the anchor's offset across the direction.
  const gapDist = Math.abs(cross(d1, sub(anchor2, ANCHOR1)))

  const values = parallel
    ? { d: fmt(gapDist, sep), s: fmt(dist(V, V2), sep) }
    : { phi: fmt(phi, sep), rot: fmt(rot, sep) }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('trans.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="trans.composeIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['trans.composeDef1', 'trans.composeDef2']} />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('trans.composeAlpha')} <strong>{fmt(alpha, sep)}°</strong>
          </span>
          <input
            type="range"
            min={0}
            max={170}
            step={10}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('trans.composeBeta')} <strong>{fmt(beta, sep)}°</strong>
          </span>
          <input
            type="range"
            min={0}
            max={170}
            step={10}
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
          />
        </label>
      </div>

      <GeoFigure
        world={WORLD}
        height={320}
        ariaLabel={t('trans.composeAria')}
        clamp={(_, p) => hold(p)}
        onDrag={(_, p) => setAnchor2(p)}
        points={[
          { id: 'a1', p: ANCHOR1, label: 'A₁', color: 'var(--series-3)' },
          { id: 'a2', p: anchor2, label: 'A₂', color: 'var(--series-3)', draggable: true },
          { id: 'v', p: V, label: 'P', color: 'var(--series-1)' },
          { id: 'v1', p: once[0], label: 'P′', color: 'var(--axis)' },
          { id: 'v2', p: V2, label: 'P″', color: 'var(--series-2)' },
          ...(centre ? [{ id: 'o', p: centre, label: 'O', color: 'var(--accent-select)' }] : []),
        ]}
      >
        {(g) => (
          <>
            {g.line(ANCHOR1, far1, { color: 'var(--series-3)', dashed: true })}
            {g.line(anchor2, far2, { color: 'var(--series-3)', dashed: true })}
            {g.label(add(ANCHOR1, scale(d1, 2.2)), 't₁', { color: 'var(--series-3)', dy: -12 })}
            {g.label(add(anchor2, scale(d2, 2.2)), 't₂', { color: 'var(--series-3)', dy: -12 })}
            {g.polygon(SHAPE, { color: 'var(--series-1)' })}
            {g.polygon(once, { color: 'var(--axis)', dashed: true, muted: true, fill: false })}
            {g.polygon(twice, { color: 'var(--series-2)' })}
            {centre && g.angle(add(centre, d1), centre, add(centre, acute), {
              label: `${fmt(phi, sep)}°`,
              color: 'var(--accent-select)',
            })}
            {centre &&
              g.arc(
                centre,
                dist(centre, V),
                bearing(centre, V),
                bearing(centre, V) + signedTurn(2 * (beta - alpha)),
                { color: 'var(--accent-select)', dashed: true, muted: true, width: 1.5 }
              )}
            {parallel && g.vector(V, V2, { color: 'var(--series-2)' })}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={parallel ? 'trans.composeLineShift' : 'trans.composeLineTurn'}
          values={values}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="trans.composeNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="trans.composeTask"
        isCorrect={Number(answer) === Number(ANSWER)}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={ANSWER}
        onReveal={() => setAnswer(ANSWER)}
        hintKey="trans.composeHint"
      >
        <label className="field">
          <span className="field-label">{t('trans.composeAnswer')}</span>
          <input
            className="answer-input"
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
