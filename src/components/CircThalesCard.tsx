import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { angleAt, deg, dist, fmt, rad, type Pt } from '../lib/geometry'
import { parseDecimal, texSeparator } from '../lib/numbers'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'
import { Tex } from './Tex'

const O: Pt = { x: 0, y: 0 }
const R = 3.5
const A: Pt = { x: -R, y: 0 }
const B: Pt = { x: R, y: 0 }
const WORLD = { minX: -5.5, maxX: 5.5, minY: -4.6, maxY: 4.6 }

type Mode = 'on' | 'free'
const MODES: Mode[] = ['on', 'free']

/** The exercise: the two acute angles of a right triangle add up to 90°. */
const TASK_ALPHA = 35
const TASK_ANSWER = 90 - TASK_ALPHA

/** The point of the circle at a given angle: `geometry.ts` has no polar form. */
const polar = (r: number, degrees: number): Pt => ({
  x: r * Math.cos(rad(degrees)),
  y: r * Math.sin(rad(degrees)),
})

/**
 * Straight onto the rim, and never so close to A or B that the angle at C has
 * nothing left to measure.
 */
function onRim(p: Pt): Pt {
  const theta = Math.abs(p.x) < 1e-9 && Math.abs(p.y) < 1e-9 ? 90 : deg(Math.atan2(p.y, p.x))
  const sign = theta < 0 ? -1 : 1
  return polar(R, sign * Math.min(176, Math.max(4, Math.abs(theta))))
}

/**
 * Thalész tétele.
 *
 * C is dragged around the circle and the angle at C refuses to move off 90°.
 * The proof toggle says why in one picture: OC is a radius too, so both halves
 * are isosceles, and the four base angles that make up a straight angle are
 * α, α, β, β. Letting C off the circle gives the converse for free — inside
 * the angle opens past 90°, outside it closes.
 */
export function CircThalesCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [mode, setMode] = useState<Mode>('on')
  const [C, setC] = useState<Pt>(polar(R, 115))
  const [proof, setProof] = useState(false)
  const [answer, setAnswer] = useState('')

  const num = (x: number) => fmt(x, sep, 1)
  const tn = (x: number) => fmt(x, '.', 1)

  const clamp = (_id: string, p: Pt): Pt => {
    if (mode === 'on') return onRim(p)
    const x = Math.min(5, Math.max(-5, p.x))
    const y = Math.min(4.2, Math.max(-4.2, p.y))
    // Off the line AB: on it there is no triangle to read an angle from.
    return { x, y: Math.abs(y) < 0.4 ? (y < 0 ? -0.4 : 0.4) : y }
  }

  const oc = dist(O, C)
  const angle = angleAt(A, C, B)
  const alpha = angleAt(O, A, C)
  const beta = angleAt(O, B, C)
  const onCircle = Math.abs(oc - R) < 0.05
  const resultKey = onCircle ? 'circ.thalesResult_on' : oc < R ? 'circ.thalesResult_in' : 'circ.thalesResult_out'
  const showProof = proof && mode === 'on'

  const typed = parseDecimal(answer)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('circ.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="circ.thalesIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('circ.thalesModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => {
              setMode(m)
              // `clamp` still sees the old mode on this render, so the rim is
              // asked for directly.
              if (m === 'on') setC(onRim(C))
            }}
          >
            {t(`circ.thalesMode_${m}`)}
          </button>
        ))}
        {mode === 'on' && (
          <button
            type="button"
            className={proof ? 'pill active' : 'pill'}
            aria-pressed={proof}
            onClick={() => setProof(!proof)}
          >
            {t('circ.thalesShowProof')}
          </button>
        )}
      </div>

      <GeoFigure
        world={WORLD}
        height={300}
        ariaLabel={t('circ.thalesAria', { angle: num(angle) })}
        points={[
          { id: 'A', p: A, label: 'A', color: 'var(--axis)' },
          { id: 'B', p: B, label: 'B', color: 'var(--axis)' },
          { id: 'O', p: O, label: 'O', color: 'var(--axis)' },
          { id: 'C', p: C, label: 'C', color: 'var(--series-2)', draggable: true },
        ]}
        onDrag={(_id, p) => setC(p)}
        clamp={clamp}
      >
        {(g) => (
          <>
            {g.circle(O, R, { color: 'var(--series-1)', muted: true })}
            {g.segment(A, B, { color: 'var(--series-1)' })}
            {g.segment(A, C, { color: 'var(--series-2)' })}
            {g.segment(B, C, { color: 'var(--series-2)' })}
            {showProof && g.segment(O, C, { color: 'var(--series-3)', dashed: true })}
            {showProof && g.length(O, A, `r = ${num(R)}`, { side: -1 })}
            {showProof && g.length(O, B, `r = ${num(R)}`, { side: -1 })}
            {showProof && g.length(O, C, `r = ${num(R)}`)}
            {showProof && g.angle(C, A, O, { label: 'α', radius: 24 })}
            {showProof && g.angle(A, C, O, { label: 'α', radius: 24 })}
            {showProof && g.angle(C, B, O, { label: 'β', radius: 24 })}
            {showProof && g.angle(O, C, B, { label: 'β', radius: 24 })}
            {showProof
              ? g.angle(A, C, B, { right: true, radius: 46, color: 'var(--accent-select)' })
              : g.angle(A, C, B, {
                  label: `${num(angle)}°`,
                  radius: 26,
                  color: 'var(--accent-select)',
                })}
          </>
        )}
      </GeoFigure>

      {showProof && (
        <Tex
          block
          tex={texSeparator(
            `\\alpha + \\alpha + \\beta + \\beta = 180^\\circ \\;\\Rightarrow\\; \\alpha + \\beta = ${tn(alpha)} + ${tn(beta)} = 90^\\circ`,
            sep
          )}
        />
      )}

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={resultKey}
          values={{
            angle: num(angle),
            alpha: num(alpha),
            beta: num(beta),
            oc: num(oc),
            r: num(R),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="circ.thalesNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="circ.thalesTask"
        promptValues={{ alpha: TASK_ALPHA }}
        isCorrect={typed === TASK_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(TASK_ANSWER)}
        onReveal={() => setAnswer(String(TASK_ANSWER))}
        hintKey="circ.thalesHint"
      >
        <label className="field">
          <span className="field-label">{t('circ.thalesAnswer')}</span>
          <input
            className="answer-input"
            type="text"
            inputMode="decimal"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
