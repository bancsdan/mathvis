import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { add, dist, fmt, foot, normalize, perp, scale, sub, type Pt } from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const MODES = ['point', 'parallel'] as const
type Mode = (typeof MODES)[number]

const WORLD = { minX: -6, maxX: 6, minY: -3.4, maxY: 3.4 }

/** The line the point is measured against: gently tilted, so "perpendicular"
 * cannot be read off as "straight down". */
const LA: Pt = { x: -5.4, y: -1.08 }
const LB: Pt = { x: 5.4, y: 1.08 }
/** The point whose distance from the line is in question. */
const P: Pt = { x: -1, y: 2.4 }

/** The lower of the two parallels, and the shift that makes the upper one. */
const MA: Pt = { x: -5.4, y: -2.3 }
const MB: Pt = { x: 5.4, y: -0.14 }
const GAP = 2

/** How far along a line a dragged point may go, as a share of its half length. */
const REACH = 0.86

const OPTIONS = ['a', 'b', 'c'] as const
const DIST_ANSWER = 'b'

/** Keeps a dragged point on the segment of the line the figure shows. */
function onLine(p: Pt, A: Pt, B: Pt): Pt {
  const F = foot(p, A, B)
  const half = scale(sub(B, A), 0.5)
  const M = add(A, half)
  const off = sub(F, M)
  const k = (off.x * half.x + off.y * half.y) / (half.x * half.x + half.y * half.y)
  return add(M, scale(half, Math.max(-REACH, Math.min(REACH, k))))
}

/**
 * A pont és az egyenes távolsága.
 *
 * The reader slides Q along the line and watches |PQ| bottom out exactly where
 * the segment turns perpendicular; the second mode does the same for two
 * parallels, where the perpendicular piece never changes at all.
 */
export function GeoDistanceCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [mode, setMode] = useState<Mode>('point')
  const [Q, setQ] = useState<Pt>({ x: 2.6, y: 0.52 })
  const [R, setR] = useState<Pt>({ x: -2.2, y: -1.66 })
  const [answer, setAnswer] = useState('')

  // Mode one: the foot of the perpendicular from P, and the two lengths.
  const F = foot(P, LA, LB)
  const oblique = dist(P, Q)
  const shortest = dist(P, F)
  const atFoot = Math.abs(oblique - shortest) < 0.05

  // Mode two: the same gap measured from wherever R stands on the lower line.
  const n = normalize(perp(sub(MB, MA)))
  const NA = add(MA, scale(n, GAP))
  const NB = add(MB, scale(n, GAP))
  const S = foot(R, NA, NB)
  const slant: Pt = { x: 3.4, y: NA.y + ((3.4 - NA.x) * (NB.y - NA.y)) / (NB.x - NA.x) }

  const resultKey =
    mode === 'parallel' ? 'geo.distResPar' : atFoot ? 'geo.distResFoot' : 'geo.distResOther'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('geo.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="geo.distIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="geo.distDef" />
      </div>

      <div className="pill-row" role="group" aria-label={t('geo.distModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`geo.distMode_${m}`)}
          </button>
        ))}
      </div>

      <GeoFigure
        world={WORLD}
        height={300}
        ariaLabel={t(mode === 'point' ? 'geo.distAriaPoint' : 'geo.distAriaPar')}
        points={
          mode === 'point'
            ? [
                { id: 'P', p: P, label: 'P', color: 'var(--series-2)' },
                { id: 'T', p: F, label: 'T', color: 'var(--series-3)' },
                { id: 'Q', p: Q, label: 'Q', draggable: true },
              ]
            : [
                { id: 'R', p: R, label: 'Q', draggable: true },
                { id: 'S', p: S, label: 'T', color: 'var(--series-3)' },
              ]
        }
        clamp={(_id, p) => (mode === 'point' ? onLine(p, LA, LB) : onLine(p, MA, MB))}
        onDrag={(_id, p) => (mode === 'point' ? setQ(p) : setR(p))}
      >
        {(g) =>
          mode === 'point' ? (
            <>
              {g.line(LA, LB, { color: 'var(--axis)' })}
              {g.segment(P, F, { color: 'var(--series-3)', dashed: true })}
              {g.angle(P, F, LB, { right: true, color: 'var(--series-3)', radius: 12 })}
              {g.length(P, F, `${fmt(shortest, sep)}`, { color: 'var(--series-3)', side: -1 })}
              {g.segment(P, Q, { color: 'var(--series-1)' })}
              {g.length(P, Q, `${fmt(oblique, sep)}`, { color: 'var(--series-1)' })}
            </>
          ) : (
            <>
              {g.line(MA, MB, { color: 'var(--axis)' })}
              {g.line(NA, NB, { color: 'var(--axis)' })}
              {g.segment(R, slant, { color: 'var(--series-1)', dashed: true })}
              {g.length(R, slant, `${fmt(dist(R, slant), sep)}`, { color: 'var(--series-1)' })}
              {g.segment(R, S, { color: 'var(--series-3)' })}
              {g.angle(R, S, NB, { right: true, color: 'var(--series-3)', radius: 12 })}
              {g.length(R, S, `${fmt(dist(R, S), sep)}`, { color: 'var(--series-3)', side: -1 })}
            </>
          )
        }
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={resultKey}
          values={{
            d: fmt(mode === 'parallel' ? dist(R, slant) : oblique, sep),
            m: fmt(mode === 'parallel' ? dist(R, S) : shortest, sep),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="geo.distTask"
        isCorrect={answer === DIST_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={DIST_ANSWER}
        onReveal={() => setAnswer(DIST_ANSWER)}
        hintKey="geo.distHint"
      >
        <div className="pill-row" role="group" aria-label={t('geo.distOptAria')}>
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={answer === option ? 'pill active' : 'pill'}
              aria-pressed={answer === option}
              onClick={() => setAnswer(option)}
            >
              {t(`geo.distOpt_${option}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
