import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { dist, fmt, foot, triangleArea, type Pt } from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const WORLD = { minX: -0.5, maxX: 11.5, minY: -1.5, maxY: 7.5 }
const INSET = 0.6

/** C starts out beyond B, so the foot of the height is outside AB from the off. */
const START: Record<string, Pt> = {
  A: { x: 1.5, y: 0 },
  B: { x: 6.5, y: 0 },
  C: { x: 10, y: 4.5 },
}

const TASK = { base: 8, height: 5 }
const TASK_ANSWER = String((TASK.base * TASK.height) / 2)

/**
 * Hol van a magasság, ha a háromszög tompaszögű?
 *
 * The base stays on its line and C wanders. Pull C past B and the foot of the
 * height leaves the segment — the height belongs to the *line* of the base,
 * not to the piece of it you drew. The faint rectangle of the same base and
 * height stands behind the triangle, so the halving in a · m / 2 is visible.
 */
export function TriAreaCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [pts, setPts] = useState<Record<string, Pt>>(START)
  const [answer, setAnswer] = useState('')

  const { A, B, C } = pts
  const F = foot(C, A, B)
  const base = dist(A, B)
  const height = dist(C, F)
  const area = triangleArea(A, B, C)
  const inside = F.x >= Math.min(A.x, B.x) && F.x <= Math.max(A.x, B.x)

  // A and B slide along their line; C may go anywhere above it, so the height
  // is always drawn downwards and the rectangle never turns inside out.
  const clamp = (pid: string, p: Pt): Pt => {
    const x = Math.min(WORLD.maxX - INSET, Math.max(WORLD.minX + INSET, p.x))
    if (pid === 'C') return { x, y: Math.min(WORLD.maxY - INSET, Math.max(0.8, p.y)) }
    return { x, y: 0 }
  }

  const rect: Pt[] = [A, B, { x: B.x, y: height }, { x: A.x, y: height }]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('tri.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="tri.areaIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="tri.areaDef" />
      </div>

      <GeoFigure
        world={WORLD}
        height={300}
        ariaLabel={t('tri.areaAria')}
        points={[
          { id: 'A', p: A, label: 'A', draggable: true },
          { id: 'B', p: B, label: 'B', draggable: true },
          { id: 'C', p: C, label: 'C', draggable: true },
          { id: 'F', p: F, label: t('tri.areaFootLabel'), color: 'var(--accent-select)' },
        ]}
        clamp={clamp}
        onDrag={(pid, p) => setPts((old) => ({ ...old, [pid]: p }))}
      >
        {(g) => (
          <>
            {g.polygon(rect, { color: 'var(--series-3)', muted: true, dashed: true })}
            {g.line(A, B, { color: 'var(--axis)', dashed: true, width: 1.5 })}
            {g.polygon([A, B, C], { color: 'var(--series-1)' })}
            {g.segment(C, F, { color: 'var(--accent-select)', width: 2.5 })}
            {g.angle(A, F, C, { right: true, radius: 10, color: 'var(--accent-select)' })}
            {g.length(C, F, `m = ${fmt(height, sep)}`, { color: 'var(--accent-select)' })}
            {g.length(A, B, `a = ${fmt(base, sep)}`, { side: -1 })}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="tri.areaResult"
          values={{
            a: fmt(base, sep),
            m: fmt(height, sep),
            area: fmt(area, sep),
            rect: fmt(base * height, sep),
            where: t(inside ? 'tri.areaFootInside' : 'tri.areaFootOutside'),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="tri.areaTask"
        promptValues={TASK}
        isCorrect={answer.trim() === TASK_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer.trim()}
        solutionKey={TASK_ANSWER}
        onReveal={() => setAnswer(TASK_ANSWER)}
        hintKey="tri.areaHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('tri.areaAnswer')}</span>
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
