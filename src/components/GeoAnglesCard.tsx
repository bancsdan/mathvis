import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { add, deg, fmt, rad, scale, type Pt } from '../lib/geometry'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

/** Half the gap between the two parallels, in world units. */
const H = 1.8
/** How far the transversal runs past the crossing it is drawn to. */
const OVERHANG = 0.9
/** Kept well away from parallel, so both crossings stay on the picture. */
const MIN_DEG = 30
const MAX_DEG = 150

const EAST: Pt = { x: 1, y: 0 }
const WEST: Pt = { x: -1, y: 0 }

const MODES = ['vertical', 'linear', 'corresponding', 'alternate', 'complement'] as const
type Mode = (typeof MODES)[number]

/** Which of the eight angle marks a pill lights up. */
const PAIRS: Record<Mode, readonly string[]> = {
  vertical: ['a1', 'a3'],
  linear: ['a1', 'a2'],
  corresponding: ['a1', 'b1'],
  alternate: ['a3', 'b1'],
  complement: [],
}

const dirOf = (degrees: number): Pt => ({ x: Math.cos(rad(degrees)), y: Math.sin(rad(degrees)) })

/** The direction of the dragged end, turned into a legal transversal angle. */
function angleOf(p: Pt): number {
  let a = deg(Math.atan2(p.y, p.x))
  if (a < 0) a += 360
  if (a > 270) a = MIN_DEG
  else if (a > MAX_DEG) a = MAX_DEG
  else if (a < MIN_DEG) a = MIN_DEG
  return Math.round(a)
}

const ALT_ANSWER = 38
const ADJ_ANSWER = 142
const ANGLES_SOLUTION = `${ALT_ANSWER}|${ADJ_ANSWER}`

/**
 * Szögpárok két párhuzamos és egy metsző egyenesnél.
 *
 * Only two numbers ever appear among the eight angles, and the pills say which
 * pairs carry which: turning the transversal changes both numbers at once and
 * never breaks a single pair.
 */
export function GeoAnglesCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [theta, setTheta] = useState(58)
  const [mode, setMode] = useState<Mode>('vertical')
  const [alt, setAlt] = useState('')
  const [adj, setAdj] = useState('')

  const d = dirOf(theta)
  const cot = Math.cos(rad(theta)) / Math.sin(rad(theta))
  const A: Pt = { x: H * cot, y: H }
  const B: Pt = { x: -H * cot, y: -H }
  const end = H / Math.sin(rad(theta)) + OVERHANG
  const P = scale(d, end)
  const backD = scale(d, -1)

  // The four angles at each crossing, in the order they go round the point.
  const marks = [
    { id: 'a1', at: A, from: add(A, EAST), to: add(A, d), value: theta },
    { id: 'a2', at: A, from: add(A, d), to: add(A, WEST), value: 180 - theta },
    { id: 'a3', at: A, from: add(A, WEST), to: add(A, backD), value: theta },
    { id: 'a4', at: A, from: add(A, backD), to: add(A, EAST), value: 180 - theta },
    { id: 'b1', at: B, from: add(B, EAST), to: add(B, d), value: theta },
    { id: 'b2', at: B, from: add(B, d), to: add(B, WEST), value: 180 - theta },
    { id: 'b3', at: B, from: add(B, WEST), to: add(B, backD), value: theta },
    { id: 'b4', at: B, from: add(B, backD), to: add(B, EAST), value: 180 - theta },
  ]

  // The acute one of the two values: only that has a complement to show.
  const alpha = Math.min(theta, 180 - theta)
  const selected =
    mode === 'complement' ? [theta <= 90 ? 'a1' : 'a2'] : PAIRS[mode]

  const values = {
    a: fmt(theta, sep, 0),
    b: fmt(mode === 'linear' ? 180 - theta : theta, sep, 0),
    alpha: fmt(alpha, sep, 0),
    c: fmt(90 - alpha, sep, 0),
    s: fmt(180 - alpha, sep, 0),
  }

  const answerKey = `${alt}|${adj}`
  const world = { minX: -6, maxX: 6, minY: mode === 'complement' ? -5.9 : -3.2, maxY: 3.2 }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('geo.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="geo.anglesIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('geo.anglesModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`geo.anglesMode_${m}`)}
          </button>
        ))}
      </div>

      <GeoFigure
        world={world}
        height={mode === 'complement' ? 380 : 280}
        ariaLabel={t('geo.anglesAria')}
        points={[{ id: 'P', p: P, label: 'P', color: 'var(--series-2)', draggable: true }]}
        clamp={(_id, p) => scale(dirOf(angleOf(p)), H / Math.sin(rad(angleOf(p))) + OVERHANG)}
        onDrag={(_id, p) => setTheta(angleOf(p))}
      >
        {(g) => (
          <>
            {g.line({ x: -1, y: H }, { x: 1, y: H }, { color: 'var(--series-1)' })}
            {g.line({ x: -1, y: -H }, { x: 1, y: -H }, { color: 'var(--series-1)' })}
            {g.segment(scale(d, -end), P, { color: 'var(--series-2)' })}
            {marks.map((m) => {
              const on = selected.includes(m.id)
              return (
                <g key={m.id}>
                  {g.angle(m.from, m.at, m.to, {
                    label: `${fmt(m.value, sep, 0)}°`,
                    color: on ? 'var(--accent-select)' : 'var(--axis)',
                    muted: !on,
                    radius: 18,
                    width: on ? 3 : 2,
                  })}
                </g>
              )
            })}
            {mode === 'complement' && (
              <>
                {/* A right angle and a straight angle, each split by the same α. */}
                {[
                  { V: { x: -3.2, y: -5.1 }, other: { x: 0, y: 1 }, rest: 90 - alpha, cap: 'Comp' },
                  { V: { x: 2.6, y: -5.1 }, other: { x: -1, y: 0 }, rest: 180 - alpha, cap: 'Supp' },
                ].map((s) => {
                  const arm = add(s.V, scale(EAST, 1.9))
                  const far = add(s.V, scale(s.other, 1.9))
                  const ray = add(s.V, scale(dirOf(alpha), 1.9))
                  return (
                    <g key={s.cap}>
                      {g.segment(s.V, arm, { color: 'var(--axis)' })}
                      {g.segment(s.V, far, { color: 'var(--axis)' })}
                      {g.segment(s.V, ray, { color: 'var(--series-2)' })}
                      {g.angle(arm, s.V, ray, {
                        label: `${fmt(alpha, sep, 0)}°`,
                        color: 'var(--accent-select)',
                        radius: 16,
                      })}
                      {g.angle(ray, s.V, far, {
                        label: `${fmt(s.rest, sep, 0)}°`,
                        color: 'var(--series-3)',
                        radius: 34,
                      })}
                      {g.label(add(s.V, { x: 0.2, y: -0.6 }), t(`geo.anglesCaption${s.cap}`), {
                        color: 'var(--text-secondary)',
                      })}
                    </g>
                  )
                })}
              </>
            )}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`geo.anglesRes_${mode}`}
          values={values}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="geo.anglesNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="geo.anglesTask"
        isCorrect={Number(alt) === ALT_ANSWER && Number(adj) === ADJ_ANSWER}
        canCheck={alt.trim() !== '' && adj.trim() !== ''}
        answerKey={answerKey}
        solutionKey={ANGLES_SOLUTION}
        onReveal={() => {
          setAlt(String(ALT_ANSWER))
          setAdj(String(ADJ_ANSWER))
        }}
        hintKey="geo.anglesHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('geo.anglesAnswerAlt')}</span>
            <input
              className="answer-input"
              type="number"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('geo.anglesAnswerAdj')}</span>
            <input
              className="answer-input"
              type="number"
              value={adj}
              onChange={(e) => setAdj(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
