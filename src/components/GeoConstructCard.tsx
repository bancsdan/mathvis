import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  add,
  angleAt,
  deg,
  dist,
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
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const KINDS = ['bisect', 'angle', 'perp'] as const
type Kind = (typeof KINDS)[number]

const LAST_STEP = 4
const WORLD = { minX: -6, maxX: 6, minY: -3.4, maxY: 3.4 }

/** The line the perpendicular is dropped onto. */
const LA: Pt = { x: -5.2, y: -1.8 }
const LB: Pt = { x: 5.2, y: -0.4 }
/** The vertex of the angle to be halved. */
const V: Pt = { x: -2.6, y: -1.8 }
/** The compass opening of the first arc of the angle bisection. */
const ARM_R = 2.2

const dirOf = (degrees: number): Pt => ({ x: Math.cos(rad(degrees)), y: Math.sin(rad(degrees)) })

/**
 * The two ends of the arc that a compass set to `O` has to sweep to reach both
 * `X1` and `X2`, with a little drawn past each — a real construction leaves an
 * arc, not a full circle.
 */
function arcSpan(O: Pt, X1: Pt, X2: Pt, pad = 16): [number, number] {
  const a1 = deg(Math.atan2(X1.y - O.y, X1.x - O.x))
  const a2 = deg(Math.atan2(X2.y - O.y, X2.x - O.x))
  const diff = ((a2 - a1 + 540) % 360) - 180
  const s = diff >= 0 ? 1 : -1
  return [a1 - s * pad, a1 + diff + s * pad]
}

/**
 * Where two circles of radius `r1` and `r2` about `O1` and `O2` meet, on the
 * `side` given as a sign along the normal of O1O2; null if they miss.
 */
function meet(O1: Pt, r1: number, O2: Pt, r2: number, side: number): Pt | null {
  const d = dist(O1, O2)
  if (d < 1e-9 || d > r1 + r2 || d < Math.abs(r1 - r2)) return null
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a))
  const base = add(O1, scale(normalize(sub(O2, O1)), a))
  return add(base, scale(normalize(perp(sub(O2, O1))), side * h))
}

const ORDER = ['marks', 'circleA', 'line', 'circleB'] as const
const ORDER_SOLUTION = 'circleA|circleB|marks|line'

/**
 * Szerkesztés körzővel és vonalzóval.
 *
 * Three classic constructions, one step at a time, with the base points still
 * draggable: the figure follows, so the steps are a recipe that works on every
 * segment and every angle, not a picture memorised in one position. The last
 * step of each says which equal distances force the result.
 */
export function GeoConstructCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [kind, setKind] = useState<Kind>('bisect')
  const [step, setStep] = useState(0)
  const [A, setA] = useState<Pt>({ x: -2.1, y: -0.9 })
  const [B, setB] = useState<Pt>({ x: 2, y: 0.5 })
  const [U, setU] = useState<Pt>(add(V, scale(dirOf(8), 4.8)))
  const [W, setW] = useState<Pt>(add(V, scale(dirOf(64), 4.4)))
  const [P, setP] = useState<Pt>({ x: 0.6, y: 2.2 })
  const [order, setOrder] = useState<string[]>([])

  const show = (n: number) => step >= n

  // --- the perpendicular bisector of AB -------------------------------
  const c = dist(A, B)
  const rAB = c * 0.72
  const M = mid(A, B)
  const nAB = normalize(perp(sub(B, A)))
  const hAB = Math.sqrt(Math.max(0, rAB * rAB - (c / 2) * (c / 2)))
  const P1 = add(M, scale(nAB, hAB))
  const Q1 = sub(M, scale(nAB, hAB))

  // --- the bisector of the angle at V ---------------------------------
  const armA = add(V, scale(normalize(sub(U, V)), ARM_R))
  const armB = add(V, scale(normalize(sub(W, V)), ARM_R))
  const sArm = dist(armA, armB) * 0.85
  const R0 = meet(armA, sArm, armB, sArm, -1)
  // Of the two meeting points, the one away from the vertex is the useful one.
  const R = R0 && dist(R0, V) > ARM_R ? R0 : meet(armA, sArm, armB, sArm, 1)
  const ray = R ?? add(V, { x: 1, y: 0 })

  // --- the perpendicular from P to the line ---------------------------
  const F = foot(P, LA, LB)
  const dPF = dist(P, F)
  const rP = dPF * 1.1
  const uL = normalize(sub(LB, LA))
  const halfCD = Math.sqrt(Math.max(0, rP * rP - dPF * dPF))
  const C = sub(F, scale(uL, halfCD))
  const D = add(F, scale(uL, halfCD))
  const sCD = 2 * halfCD * 0.7
  const toP = normalize(sub(P, F))
  const S = sub(F, scale(toP, Math.sqrt(Math.max(0, sCD * sCD - halfCD * halfCD))))

  const clamp = (id2: string, p: Pt): Pt => {
    if (kind === 'bisect') {
      const q = {
        x: Math.min(2.6, Math.max(-2.6, p.x)),
        y: Math.min(1.6, Math.max(-1.6, p.y)),
      }
      const other = id2 === 'A' ? B : A
      return dist(q, other) < 2.2 ? (id2 === 'A' ? A : B) : q
    }
    if (kind === 'angle') {
      const a = deg(Math.atan2(p.y - V.y, p.x - V.x))
      const lo = id2 === 'U' ? -6 : 46
      const hi = id2 === 'U' ? 34 : 96
      const len = id2 === 'U' ? 4.8 : 4.4
      return add(V, scale(dirOf(Math.min(hi, Math.max(lo, a))), len))
    }
    return { x: Math.min(3.2, Math.max(-3.2, p.x)), y: Math.min(2.8, Math.max(0.9, p.y)) }
  }

  const onDrag = (id2: string, p: Pt) => {
    if (id2 === 'A') setA(p)
    else if (id2 === 'B') setB(p)
    else if (id2 === 'U') setU(p)
    else if (id2 === 'W') setW(p)
    else setP(p)
  }

  const points =
    kind === 'bisect'
      ? [
          { id: 'A', p: A, label: 'A', draggable: true },
          { id: 'B', p: B, label: 'B', draggable: true },
          ...(show(3)
            ? [
                { id: 'P', p: P1, label: 'P', color: 'var(--series-3)' },
                { id: 'Q', p: Q1, label: 'Q', color: 'var(--series-3)' },
              ]
            : []),
        ]
      : kind === 'angle'
        ? [
            { id: 'V', p: V, label: 'V', color: 'var(--axis)' },
            { id: 'U', p: U, draggable: true },
            { id: 'W', p: W, draggable: true },
            ...(show(1)
              ? [
                  { id: 'aA', p: armA, label: 'P', color: 'var(--series-2)' },
                  { id: 'aB', p: armB, label: 'Q', color: 'var(--series-2)' },
                ]
              : []),
            ...(show(3) ? [{ id: 'R', p: ray, label: 'R', color: 'var(--series-3)' }] : []),
          ]
        : [
            { id: 'P', p: P, label: 'P', draggable: true },
            ...(show(1)
              ? [
                  { id: 'C', p: C, label: 'C', color: 'var(--series-2)' },
                  { id: 'D', p: D, label: 'D', color: 'var(--series-2)' },
                ]
              : []),
            ...(show(3) ? [{ id: 'S', p: S, label: 'S', color: 'var(--series-3)' }] : []),
          ]

  const values = {
    r: fmt(kind === 'bisect' ? rAB : kind === 'angle' ? ARM_R : rP, sep),
    s: fmt(kind === 'angle' ? sArm : sCD, sep),
    a: fmt(kind === 'angle' ? angleAt(U, V, ray) : angleAt(P, F, D), sep, 0),
    b: fmt(angleAt(ray, V, W), sep, 0),
  }

  const answerKey = order.join('|')
  const toggle = (o: string) =>
    setOrder(order.includes(o) ? order.filter((x) => x !== o) : [...order, o])

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('geo.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="geo.constructIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('geo.constructPickAria')}>
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            className={kind === k ? 'pill active' : 'pill'}
            aria-pressed={kind === k}
            onClick={() => {
              setKind(k)
              setStep(0)
            }}
          >
            {t(`geo.constructKind_${k}`)}
          </button>
        ))}
      </div>

      <GeoFigure
        world={WORLD}
        height={320}
        ariaLabel={t(`geo.constructAria_${kind}`)}
        points={points}
        clamp={clamp}
        onDrag={onDrag}
      >
        {(g) =>
          kind === 'bisect' ? (
            <>
              {g.segment(A, B, { color: 'var(--axis)' })}
              {show(1) && g.arc(A, rAB, ...arcSpan(A, P1, Q1), { color: 'var(--series-2)' })}
              {show(2) && g.arc(B, rAB, ...arcSpan(B, P1, Q1), { color: 'var(--series-2)' })}
              {show(4) && (
                <>
                  {[A, B].map((O, i) => (
                    <g key={i}>
                      {g.segment(O, P1, { color: 'var(--series-3)', dashed: true, muted: true })}
                      {g.segment(O, Q1, { color: 'var(--series-3)', dashed: true, muted: true })}
                    </g>
                  ))}
                  {g.line(P1, Q1, { color: 'var(--accent-select)' })}
                  {g.angle(A, M, P1, { right: true, color: 'var(--accent-select)', radius: 12 })}
                </>
              )}
            </>
          ) : kind === 'angle' ? (
            <>
              {g.ray(V, U, { color: 'var(--axis)' })}
              {g.ray(V, W, { color: 'var(--axis)' })}
              {show(1) && g.arc(V, ARM_R, ...arcSpan(V, armA, armB), { color: 'var(--series-2)' })}
              {show(2) && g.arc(armA, sArm, ...arcSpan(armA, ray, ray, 26), { color: 'var(--series-2)' })}
              {show(3) && g.arc(armB, sArm, ...arcSpan(armB, ray, ray, 26), { color: 'var(--series-2)' })}
              {show(4) && (
                <>
                  {g.ray(V, ray, { color: 'var(--accent-select)' })}
                  {g.angle(U, V, ray, {
                    label: `${values.a}°`,
                    color: 'var(--accent-select)',
                    radius: 40,
                  })}
                  {g.angle(ray, V, W, {
                    label: `${values.b}°`,
                    color: 'var(--accent-select)',
                    radius: 64,
                  })}
                </>
              )}
            </>
          ) : (
            <>
              {g.line(LA, LB, { color: 'var(--axis)' })}
              {g.label(add(LB, { x: -0.4, y: 0.45 }), 'e', { color: 'var(--axis)' })}
              {show(1) && g.arc(P, rP, ...arcSpan(P, C, D), { color: 'var(--series-2)' })}
              {show(2) && g.arc(C, sCD, ...arcSpan(C, S, S, 26), { color: 'var(--series-2)' })}
              {show(3) && g.arc(D, sCD, ...arcSpan(D, S, S, 26), { color: 'var(--series-2)' })}
              {show(4) && (
                <>
                  {g.segment(P, S, { color: 'var(--accent-select)' })}
                  {g.angle(P, F, D, { right: true, color: 'var(--accent-select)', radius: 12 })}
                </>
              )}
            </>
          )
        }
      </GeoFigure>

      <div className="pill-row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={step >= LAST_STEP}
          onClick={() => setStep(Math.min(LAST_STEP, step + 1))}
        >
          {t('geo.constructNext')}
        </button>
        <button type="button" className="btn" onClick={() => setStep(0)}>
          {t('geo.constructReset')}
        </button>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`geo.constructStep_${kind}${step}`}
          values={values}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="geo.constructNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="geo.constructTask"
        isCorrect={answerKey === ORDER_SOLUTION}
        canCheck={order.length === ORDER.length}
        answerKey={answerKey}
        solutionKey={ORDER_SOLUTION}
        onReveal={() => setOrder(ORDER_SOLUTION.split('|'))}
        hintKey="geo.constructHint"
      >
        <div className="pill-row" role="group" aria-label={t('geo.constructOptAria')}>
          {ORDER.map((o) => {
            const at = order.indexOf(o)
            return (
              <button
                key={o}
                type="button"
                className={at >= 0 ? 'pill active' : 'pill'}
                aria-pressed={at >= 0}
                onClick={() => toggle(o)}
              >
                {at >= 0 && (
                  <span className="geo-order-num" aria-hidden="true">
                    {at + 1}
                  </span>
                )}
                {t(`geo.constructOpt_${o}`)}
              </button>
            )
          })}
        </div>
      </Exercise>
    </section>
  )
}
