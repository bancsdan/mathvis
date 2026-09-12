import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  add,
  dist,
  dot,
  fmt,
  foot,
  mid,
  normalize,
  perp,
  rad,
  scale,
  sub,
  type Pt,
} from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const MODES = ['points', 'angle'] as const
type Mode = (typeof MODES)[number]

const WORLD = { minX: -5.6, maxX: 5.6, minY: -3.2, maxY: 3.4 }

/** The two points to stay equally far from. */
const A: Pt = { x: -2.6, y: -1.2 }
const B: Pt = { x: 2.6, y: -1.2 }

/** The vertex of the angle and the two points its arms run through. */
const V: Pt = { x: -2.8, y: -1.9 }
const dirOf = (degrees: number): Pt => ({ x: Math.cos(rad(degrees)), y: Math.sin(rad(degrees)) })
const U: Pt = add(V, scale(dirOf(12), 7.4))
const W: Pt = add(V, scale(dirOf(62), 5.6))

/** Inside this gap the two distances count as equal and the point is caught. */
const SNAP = 0.3

const OPTIONS = ['a', 'b', 'c'] as const
const BISECTOR_ANSWER = 'b'

const inWorld = (p: Pt): Pt => ({
  x: Math.min(WORLD.maxX - 0.3, Math.max(WORLD.minX + 0.3, p.x)),
  y: Math.min(WORLD.maxY - 0.3, Math.max(WORLD.minY + 0.3, p.y)),
})

/**
 * A két távolságot egyenlővé tevő pontok.
 *
 * Both modes ask the same question — where is "equally far" — and both answer
 * it with a whole line rather than a point: the reader finds one such place,
 * and the moment the two numbers agree the line it belongs to appears.
 */
export function GeoBisectorCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [mode, setMode] = useState<Mode>('points')
  const [X, setX] = useState<Pt>({ x: 1.2, y: 1.4 })
  const [Y, setY] = useState<Pt>(add(V, scale(dirOf(30), 3.2)))
  const [answer, setAnswer] = useState('')

  // Mode one: the distances to the two points, and the line of the equal ones.
  const dA = dist(X, A)
  const dB = dist(X, B)
  const equal = Math.abs(dA - dB) <= SNAP
  const M = mid(A, B)
  const MTop = add(M, normalize(perp(sub(B, A))))

  // Mode two: the distances to the two arms, measured along the perpendiculars.
  const F1 = foot(Y, V, U)
  const F2 = foot(Y, V, W)
  const d1 = dist(Y, F1)
  const d2 = dist(Y, F2)
  const equalArms = Math.abs(d1 - d2) <= SNAP
  const bis = normalize(add(normalize(sub(U, V)), normalize(sub(W, V))))

  const clamp = (_id: string, p: Pt): Pt => {
    if (mode === 'points') {
      const near = Math.abs(dist(p, A) - dist(p, B)) <= SNAP
      return inWorld(near ? foot(p, M, MTop) : p)
    }
    const near = Math.abs(dist(p, foot(p, V, U)) - dist(p, foot(p, V, W))) <= SNAP
    if (!near) return inWorld(p)
    const along = Math.min(5.4, Math.max(0.9, dot(sub(p, V), bis)))
    return inWorld(add(V, scale(bis, along)))
  }

  const resultKey =
    mode === 'points'
      ? equal
        ? 'geo.bisectorResEq'
        : 'geo.bisectorResNo'
      : equalArms
        ? 'geo.bisectorResAngEq'
        : 'geo.bisectorResAngNo'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('geo.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="geo.bisectorIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['geo.bisectorDef1', 'geo.bisectorDef2']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('geo.bisectorModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`geo.bisectorMode_${m}`)}
          </button>
        ))}
      </div>

      <GeoFigure
        world={WORLD}
        height={300}
        ariaLabel={t(mode === 'points' ? 'geo.bisectorAriaPoints' : 'geo.bisectorAriaAngle')}
        points={
          mode === 'points'
            ? [
                { id: 'A', p: A, label: 'A', color: 'var(--series-2)' },
                { id: 'B', p: B, label: 'B', color: 'var(--series-3)' },
                { id: 'X', p: X, label: 'X', draggable: true },
              ]
            : [
                { id: 'V', p: V, label: 'V', color: 'var(--axis)' },
                { id: 'F1', p: F1, color: 'var(--series-2)' },
                { id: 'F2', p: F2, color: 'var(--series-3)' },
                { id: 'X', p: Y, label: 'X', draggable: true },
              ]
        }
        clamp={clamp}
        onDrag={(_id, p) => (mode === 'points' ? setX(p) : setY(p))}
      >
        {(g) =>
          mode === 'points' ? (
            <>
              {g.segment(A, B, { color: 'var(--axis)', muted: true })}
              {equal && (
                <>
                  {g.line(M, MTop, { color: 'var(--accent-select)' })}
                  {g.angle(A, M, MTop, { right: true, color: 'var(--accent-select)', radius: 12 })}
                </>
              )}
              {g.segment(X, A, { color: 'var(--series-2)' })}
              {g.length(X, A, fmt(dA, sep), { color: 'var(--series-2)' })}
              {g.segment(X, B, { color: 'var(--series-3)' })}
              {g.length(X, B, fmt(dB, sep), { color: 'var(--series-3)', side: -1 })}
            </>
          ) : (
            <>
              {g.ray(V, U, { color: 'var(--axis)' })}
              {g.ray(V, W, { color: 'var(--axis)' })}
              {equalArms && g.ray(V, add(V, bis), { color: 'var(--accent-select)' })}
              {g.segment(Y, F1, { color: 'var(--series-2)', dashed: true })}
              {g.angle(Y, F1, U, { right: true, color: 'var(--series-2)', radius: 12 })}
              {g.length(Y, F1, fmt(d1, sep), { color: 'var(--series-2)' })}
              {g.segment(Y, F2, { color: 'var(--series-3)', dashed: true })}
              {g.angle(Y, F2, W, { right: true, color: 'var(--series-3)', radius: 12 })}
              {g.length(Y, F2, fmt(d2, sep), { color: 'var(--series-3)', side: -1 })}
            </>
          )
        }
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={resultKey}
          values={{
            a: fmt(mode === 'points' ? dA : d1, sep),
            b: fmt(mode === 'points' ? dB : d2, sep),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="geo.bisectorTask"
        isCorrect={answer === BISECTOR_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={BISECTOR_ANSWER}
        onReveal={() => setAnswer(BISECTOR_ANSWER)}
        hintKey="geo.bisectorHint"
      >
        <div className="pill-row" role="group" aria-label={t('geo.bisectorOptAria')}>
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={answer === option ? 'pill active' : 'pill'}
              aria-pressed={answer === option}
              onClick={() => setAnswer(option)}
            >
              {t(`geo.bisectorOpt_${option}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
