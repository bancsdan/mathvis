import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { add, angleAt, fmt, sub, type Pt } from '../lib/geometry'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const WORLD = { minX: -0.5, maxX: 11.5, minY: -0.5, maxY: 7.5 }
/** The vertices stay a little inside the box, so a label never falls off it. */
const INSET = 0.6

const START: Record<string, Pt> = {
  A: { x: 1.2, y: 1 },
  B: { x: 9.5, y: 1 },
  C: { x: 6.4, y: 5.4 },
}

/** 64° + 47° leaves 69°, the one number the exercise is after. */
const TASK = { alpha: 64, beta: 47 }
const TASK_ANSWER = String(180 - TASK.alpha - TASK.beta)

/**
 * Miért 180° a háromszög szögeinek összege?
 *
 * The three angles are live while the vertices move, so the sum is seen to be
 * stubborn rather than stated. The proof toggle draws the parallel through C:
 * the two váltószög pairs carry α and β up beside γ, and the three of them
 * fill the straight angle on that line.
 */
export function TriAnglesCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [pts, setPts] = useState<Record<string, Pt>>(START)
  const [proof, setProof] = useState(false)
  const [answer, setAnswer] = useState('')

  const { A, B, C } = pts
  const alpha = angleAt(B, A, C)
  const beta = angleAt(C, B, A)
  const gamma = angleAt(A, C, B)

  const clamp = (_id: string, p: Pt): Pt => ({
    x: Math.min(WORLD.maxX - INSET, Math.max(WORLD.minX + INSET, p.x)),
    y: Math.min(WORLD.maxY - INSET, Math.max(WORLD.minY + INSET, p.y)),
  })

  // The parallel through C, reached along AB in both directions: far enough
  // that the ends leave the figure, so it reads as a whole line.
  const dir = sub(B, A)
  const left = add(C, { x: -dir.x, y: -dir.y })
  const right = add(C, dir)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('tri.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="tri.anglesIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('tri.anglesProofAria')}>
        <button
          type="button"
          className={proof ? 'pill active' : 'pill'}
          aria-pressed={proof}
          onClick={() => setProof(!proof)}
        >
          {t('tri.anglesProof')}
        </button>
      </div>

      <GeoFigure
        world={WORLD}
        height={300}
        ariaLabel={t('tri.anglesAria')}
        points={[
          { id: 'A', p: A, label: 'A', draggable: true },
          { id: 'B', p: B, label: 'B', draggable: true },
          { id: 'C', p: C, label: 'C', draggable: true },
        ]}
        clamp={clamp}
        onDrag={(pid, p) => setPts((old) => ({ ...old, [pid]: p }))}
      >
        {(g) => (
          <>
            {g.polygon([A, B, C], { color: 'var(--series-1)' })}
            {proof && (
              <>
                {g.line(left, right, { color: 'var(--axis)', dashed: true })}
                {g.angle(left, C, A, { label: 'α', color: 'var(--series-2)' })}
                {g.angle(right, C, B, { label: 'β', color: 'var(--series-3)' })}
              </>
            )}
            {g.angle(B, A, C, { label: 'α', color: 'var(--series-2)' })}
            {g.angle(C, B, A, { label: 'β', color: 'var(--series-3)' })}
            {g.angle(A, C, B, { label: 'γ', color: 'var(--accent-select)' })}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={proof ? 'tri.anglesResultProof' : 'tri.anglesResult'}
          values={{
            a: fmt(alpha, sep),
            b: fmt(beta, sep),
            c: fmt(gamma, sep),
            sum: fmt(alpha + beta + gamma, sep),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="tri.anglesTask"
        promptValues={TASK}
        isCorrect={answer.trim() === TASK_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer.trim()}
        solutionKey={TASK_ANSWER}
        onReveal={() => setAnswer(TASK_ANSWER)}
        hintKey="tri.anglesHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('tri.anglesAnswer')}</span>
            <input
              className="answer-input"
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
