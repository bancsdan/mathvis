import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  add,
  angleAt,
  centroid,
  circumcenter,
  dist,
  fmt,
  foot,
  incenter,
  inradius,
  mid,
  orthocenter,
  perp,
  sub,
  type Pt,
} from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const WORLD = { minX: -0.5, maxX: 11.5, minY: -0.5, maxY: 7.5 }
const INSET = 0.6

const START: Record<string, Pt> = {
  A: { x: 1.5, y: 1.2 },
  B: { x: 9.5, y: 1.2 },
  C: { x: 7, y: 5.8 },
}

type Mode = 'circum' | 'incircle' | 'altitude' | 'median' | 'midline'
const MODES: Mode[] = ['circum', 'incircle', 'altitude', 'median', 'midline']

const PLACES = ['inside', 'side', 'outside'] as const
const PLACE_ANSWER = 'outside'

/**
 * Miért egy pontban metszik egymást a nevezetes vonalak?
 *
 * Each triple is drawn on the same draggable triangle, so the meeting point is
 * watched rather than believed. For the two circle centres the result line is
 * the proof itself: the point is the same distance from all three vertices, or
 * from all three sides, and that is what forces the third line through it.
 */
export function TriLinesCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [pts, setPts] = useState<Record<string, Pt>>(START)
  const [mode, setMode] = useState<Mode>('circum')
  const [answer, setAnswer] = useState('')

  const { A, B, C } = pts
  const clamp = (_id: string, p: Pt): Pt => ({
    x: Math.min(WORLD.maxX - INSET, Math.max(WORLD.minX + INSET, p.x)),
    y: Math.min(WORLD.maxY - INSET, Math.max(WORLD.minY + INSET, p.y)),
  })

  const O = circumcenter(A, B, C)
  const I = incenter(A, B, C)
  const H = orthocenter(A, B, C)
  const S = centroid(A, B, C)
  const r = inradius(A, B, C)
  const biggest = Math.max(angleAt(B, A, C), angleAt(C, B, A), angleAt(A, C, B))

  const sides: Array<[Pt, Pt]> = [
    [A, B],
    [B, C],
    [C, A],
  ]
  const feet = [foot(I, A, B), foot(I, B, C), foot(I, C, A)]
  const midAB = mid(A, B)
  const midBC = mid(B, C)
  const midCA = mid(C, A)

  const values: Record<Mode, Record<string, string>> = {
    circum: { d: fmt(O ? dist(O, A) : NaN, sep) },
    incircle: { d: fmt(r, sep) },
    altitude: {
      ang: fmt(biggest, sep),
      where: t(biggest > 90 ? 'tri.linesOutside' : 'tri.linesInside'),
    },
    median: {
      far: fmt(dist(A, S), sep),
      near: fmt(dist(S, midBC), sep),
      ratio: fmt(dist(S, midBC) > 0 ? dist(A, S) / dist(S, midBC) : NaN, sep),
    },
    midline: { m: fmt(dist(midCA, midBC), sep), s: fmt(dist(A, B), sep) },
  }

  const marker: Record<Mode, { p: Pt | null; label: string }> = {
    circum: { p: O, label: 'O' },
    incircle: { p: I, label: 'I' },
    altitude: { p: H, label: 'M' },
    median: { p: S, label: 'S' },
    midline: { p: null, label: '' },
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('tri.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="tri.linesIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['tri.linesDef1', 'tri.linesDef2']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('tri.linesModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`tri.linesMode_${m}`)}
          </button>
        ))}
      </div>

      <GeoFigure
        world={WORLD}
        height={320}
        ariaLabel={t(`tri.linesAria_${mode}`)}
        points={[
          { id: 'A', p: A, label: 'A', draggable: true },
          { id: 'B', p: B, label: 'B', draggable: true },
          { id: 'C', p: C, label: 'C', draggable: true },
          ...(marker[mode].p
            ? [
                {
                  id: 'centre',
                  p: marker[mode].p as Pt,
                  label: marker[mode].label,
                  color: 'var(--accent-select)',
                },
              ]
            : []),
        ]}
        clamp={clamp}
        onDrag={(pid, p) => setPts((old) => ({ ...old, [pid]: p }))}
      >
        {(g) => (
          <>
            {g.polygon([A, B, C], { color: 'var(--series-1)' })}

            {mode === 'circum' && (
              <>
                {sides.map(([P, Q], i) => {
                  const M = mid(P, Q)
                  return (
                    <g key={i}>{g.line(M, add(M, perp(sub(Q, P))), { color: 'var(--series-2)' })}</g>
                  )
                })}
                {O && g.circle(O, dist(O, A), { color: 'var(--accent-select)', dashed: true })}
                {O &&
                  [A, B, C].map((P, i) => (
                    <g key={i}>
                      {g.segment(O, P, { color: 'var(--accent-select)', width: 1.5, muted: true })}
                    </g>
                  ))}
              </>
            )}

            {mode === 'incircle' && (
              <>
                {[A, B, C].map((P, i) => (
                  <g key={i}>{g.ray(P, I, { color: 'var(--series-2)' })}</g>
                ))}
                {g.circle(I, r, { color: 'var(--accent-select)', dashed: true })}
                {feet.map((F, i) => (
                  <g key={i}>
                    {g.segment(I, F, { color: 'var(--accent-select)', width: 1.5, muted: true })}
                    {g.angle(sides[i][0], F, I, { right: true, radius: 9 })}
                  </g>
                ))}
              </>
            )}

            {mode === 'altitude' && (
              <>
                {([
                  [A, B, C],
                  [B, C, A],
                  [C, A, B],
                ] as Array<[Pt, Pt, Pt]>).map(([P, Q, R], i) => {
                  const F = foot(P, Q, R)
                  return (
                    <g key={i}>
                      {g.line(Q, R, { color: 'var(--axis)', dashed: true, width: 1.5 })}
                      {g.line(P, F, { color: 'var(--series-2)' })}
                      {g.angle(Q, F, P, { right: true, radius: 9 })}
                    </g>
                  )
                })}
              </>
            )}

            {mode === 'median' && (
              <>
                {g.segment(A, midBC, { color: 'var(--series-2)' })}
                {g.segment(B, midCA, { color: 'var(--series-2)' })}
                {g.segment(C, midAB, { color: 'var(--series-2)' })}
                {g.length(A, S, fmt(dist(A, S), sep), { color: 'var(--accent-select)' })}
                {g.length(S, midBC, fmt(dist(S, midBC), sep), { color: 'var(--accent-select)' })}
              </>
            )}

            {mode === 'midline' && (
              <>
                {g.segment(midCA, midBC, { color: 'var(--series-2)', width: 3 })}
                {g.segment(midAB, midBC, { color: 'var(--series-3)' })}
                {g.segment(midAB, midCA, { color: 'var(--series-3)' })}
                {g.length(midCA, midBC, fmt(dist(midCA, midBC), sep), { color: 'var(--series-2)' })}
                {g.length(A, B, fmt(dist(A, B), sep), { side: -1 })}
              </>
            )}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`tri.linesResult_${mode}`}
          values={values[mode]}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="tri.linesNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="tri.linesTask"
        isCorrect={answer === PLACE_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={PLACE_ANSWER}
        onReveal={() => setAnswer(PLACE_ANSWER)}
        hintKey="tri.linesHint"
      >
        <div className="pill-row" role="group" aria-label={t('tri.linesOptAria')}>
          {PLACES.map((place) => (
            <button
              key={place}
              type="button"
              className={answer === place ? 'pill active' : 'pill'}
              aria-pressed={answer === place}
              onClick={() => setAnswer(place)}
            >
              {t(`tri.linesOpt_${place}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
