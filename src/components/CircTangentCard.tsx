import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  angleAt,
  dist,
  fmt,
  normalize,
  scale,
  snapAngle,
  tangentPoints,
  type Pt,
} from '../lib/geometry'
import { parseDecimal, texSeparator } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'
import { Tex } from './Tex'

const O: Pt = { x: 0, y: 0 }
const R = 3
const WORLD = { minX: -6.5, maxX: 9.5, minY: -6, maxY: 6 }
/** P has to stay outside the circle, and far enough out to read the figure. */
const MIN_OP = 4.2

type Mode = 'two' | 'secant'
const MODES: Mode[] = ['two', 'secant']

/** The exercise: a 6-8-10 right triangle, so the tangent segment is exactly 8. */
const TASK_OP = 10
const TASK_R = 6
const TASK_ANSWER = Math.sqrt(TASK_OP * TASK_OP - TASK_R * TASK_R)

/**
 * Az érintő és az érintőszakasz.
 *
 * Two questions, one figure each. Dragging P shows the two tangent segments
 * staying equal however far out it goes — the figure is its own proof, being
 * symmetric about OP. Sliding the line towards the circle shows where the
 * right angle comes from: the radius meets the line at 90° exactly when the
 * two intersection points have merged into one.
 */
export function CircTangentCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [mode, setMode] = useState<Mode>('two')
  const [P, setP] = useState<Pt>({ x: 7, y: 2.5 })
  const [d, setD] = useState(1.5)
  const [axis, setAxis] = useState(false)
  const [answer, setAnswer] = useState('')

  const num = (x: number) => fmt(x, sep, 2)
  const tn = (x: number) => fmt(x, '.', 2)

  const clamp = (pid: string, p: Pt): Pt => {
    if (pid === 'F') {
      // The foot slides up the y axis, and snaps onto the rim so the tangent
      // case is a place the reader can actually stop.
      const y = Math.min(5.2, Math.max(0, p.y))
      return { x: 0, y: Math.abs(y - R) < 0.15 ? R : y }
    }
    const q = { x: Math.min(9, Math.max(-6, p.x)), y: Math.min(5.5, Math.max(-5.5, p.y)) }
    const op = dist(O, q)
    if (op < 1e-6) return { x: MIN_OP, y: 0 }
    return op < MIN_OP ? scale(normalize(q), MIN_OP) : q
  }

  const op = dist(O, P)
  const touch = tangentPoints(O, R, P)
  const E1 = touch ? touch[0] : O
  const E2 = touch ? touch[1] : O
  const tangentLen = Math.sqrt(Math.max(op * op - R * R, 0))
  // Measured rather than asserted: the card claims a right angle, so it reads
  // one off the figure instead of printing 90 into the copy.
  const rightAngle = touch ? angleAt(O, E1, P) : 90

  const F: Pt = { x: 0, y: d }
  const half = Math.sqrt(Math.max(R * R - d * d, 0))
  const I1: Pt = { x: half, y: d }
  const I2: Pt = { x: -half, y: d }
  const onLine: Pt = { x: I1.x + 2, y: d }
  const hits = d < R - 1e-6 ? 2 : d > R + 1e-6 ? 0 : 1
  // A degree snap keeps the reading at the tangent position from wobbling
  // around 90 because of floating point.
  const lineAngle = snapAngle(angleAt(O, I1, onLine), [90], 0.05)

  const resultKey =
    mode === 'two' ? 'circ.tangentResult_two' : `circ.tangentResult_secant${hits}`

  const typed = parseDecimal(answer)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('circ.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="circ.tangentIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['circ.tangentDef1', 'circ.tangentDef2']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('circ.tangentModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`circ.tangentMode_${m}`)}
          </button>
        ))}
        {mode === 'two' && (
          <button
            type="button"
            className={axis ? 'pill active' : 'pill'}
            aria-pressed={axis}
            onClick={() => setAxis(!axis)}
          >
            {t('circ.tangentShowAxis')}
          </button>
        )}
      </div>

      {mode === 'two' ? (
        <>
          <GeoFigure
            world={WORLD}
            height={320}
            ariaLabel={t('circ.tangentAria', { len: num(tangentLen) })}
            points={[
              { id: 'O', p: O, label: 'O', color: 'var(--axis)' },
              { id: 'P', p: P, label: 'P', color: 'var(--series-2)', draggable: true },
              { id: 'E1', p: E1, label: 'E₁', color: 'var(--series-3)', hidden: !touch },
              { id: 'E2', p: E2, label: 'E₂', color: 'var(--series-3)', hidden: !touch },
            ]}
            onDrag={(_id, p) => setP(p)}
            clamp={clamp}
          >
            {(g) => (
              <>
                {axis && g.polygon([O, E1, P], { color: 'var(--series-3)', width: 0 })}
                {axis && g.polygon([O, E2, P], { color: 'var(--series-3)', width: 0 })}
                {g.circle(O, R, { color: 'var(--series-1)' })}
                {g.segment(O, E1, { color: 'var(--series-1)' })}
                {g.segment(O, E2, { color: 'var(--series-1)' })}
                {g.segment(P, E1, { color: 'var(--series-2)' })}
                {g.segment(P, E2, { color: 'var(--series-2)' })}
                {axis && g.segment(O, P, { color: 'var(--axis)', dashed: true })}
                {g.angle(O, E1, P, { right: true, radius: 12 })}
                {g.angle(O, E2, P, { right: true, radius: 12 })}
                {g.length(P, E1, num(tangentLen), { color: 'var(--series-2)' })}
                {g.length(P, E2, num(tangentLen), { color: 'var(--series-2)', side: -1 })}
                {g.length(O, E1, `r = ${R}`, { side: -1 })}
              </>
            )}
          </GeoFigure>

          <Tex
            block
            tex={texSeparator(
              `e = \\sqrt{OP^2 - r^2} = \\sqrt{${tn(op)}^2 - ${R}^2} = ${tn(tangentLen)}`,
              sep
            )}
          />
        </>
      ) : (
        <GeoFigure
          world={WORLD}
          height={320}
          ariaLabel={t('circ.tangentSecantAria', { d: num(d) })}
          points={[
            { id: 'O', p: O, label: 'O', color: 'var(--axis)' },
            { id: 'F', p: F, label: 'F', color: 'var(--series-2)', draggable: true },
            { id: 'I1', p: I1, label: 'M₁', color: 'var(--series-3)', hidden: hits === 0 },
            { id: 'I2', p: I2, label: 'M₂', color: 'var(--series-3)', hidden: hits !== 2 },
          ]}
          onDrag={(_id, p) => setD(p.y)}
          clamp={clamp}
        >
          {(g) => (
            <>
              {g.circle(O, R, { color: 'var(--series-1)' })}
              {g.line({ x: -1, y: d }, { x: 1, y: d }, { color: 'var(--series-2)' })}
              {d > 0.05 && g.segment(O, F, { color: 'var(--axis)' })}
              {d > 0.05 && g.length(O, F, `d = ${num(d)}`, { side: -1 })}
              {d > 0.05 && g.angle(O, F, { x: 1.5, y: d }, { right: true, radius: 10 })}
              {hits > 0 && g.segment(O, I1, { color: 'var(--series-3)' })}
              {hits === 2 && g.segment(O, I2, { color: 'var(--series-3)' })}
              {hits > 0 && g.angle(O, I1, onLine, { label: `${num(lineAngle)}°`, radius: 20 })}
            </>
          )}
        </GeoFigure>
      )}

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={resultKey}
          values={{
            e1: num(dist(P, E1)),
            e2: num(dist(P, E2)),
            ang: num(rightAngle),
            d: num(d),
            r: R,
            lineAng: num(lineAngle),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="circ.tangentNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="circ.tangentTask"
        promptValues={{ op: TASK_OP, r: TASK_R }}
        isCorrect={typed !== null && Math.abs(typed - TASK_ANSWER) < 0.05}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={num(TASK_ANSWER)}
        onReveal={() => setAnswer(num(TASK_ANSWER))}
        hintKey="circ.tangentHint"
      >
        <label className="field">
          <span className="field-label">{t('circ.tangentAnswer')}</span>
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
