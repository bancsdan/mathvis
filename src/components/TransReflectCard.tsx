import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  angleAt,
  cross,
  dist,
  fmt,
  mid,
  reflectLine,
  reflectPoint,
  sub,
  type Pt,
} from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const WORLD = { minX: -7, maxX: 7, minY: -4.5, maxY: 4.5 }

/** The triangle sits on the left, so its image lands on the right of either mirror. */
const START: Record<string, Pt> = {
  A: { x: -5.2, y: 2.6 },
  B: { x: -2.2, y: 3 },
  C: { x: -4, y: -0.6 },
  P: { x: -1, y: -3.5 },
  Q: { x: 1, y: 3.5 },
  O: { x: 0, y: 0 },
}

type Kind = 'axis' | 'point'
const KINDS: Kind[] = ['axis', 'point']

const OPTIONS = ['axis', 'point', 'shift'] as const
const ANSWER = 'axis'

/** Keeps a dragged point on the picture, a little inside the frame. */
const hold = (p: Pt): Pt => ({
  x: Math.min(WORLD.maxX - 0.4, Math.max(WORLD.minX + 0.4, p.x)),
  y: Math.min(WORLD.maxY - 0.4, Math.max(WORLD.minY + 0.4, p.y)),
})

/** True when A → B → C turns to the left, the way a positive cross product does. */
const ccw = (A: Pt, B: Pt, C: Pt): boolean => cross(sub(B, A), sub(C, A)) > 0

/**
 * Mi marad meg tükrözéskor, és mi fordul meg?
 *
 * Both mirrors keep every length and every angle, so the only thing left to
 * watch is the lettering: the axial image runs round the other way, the
 * central one does not. The triangle and the mirror are both draggable, so the
 * reader can try to find a position where that changes — there is none.
 */
export function TransReflectCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [kind, setKind] = useState<Kind>('axis')
  const [pts, setPts] = useState<Record<string, Pt>>(START)
  const [answer, setAnswer] = useState('')

  const { A, B, C, P, Q, O } = pts
  const axis = kind === 'axis'
  const image = (p: Pt) => (axis ? reflectLine(p, P, Q) : reflectPoint(p, O))
  const A2 = image(A)
  const B2 = image(B)
  const C2 = image(C)

  const turn = (yes: boolean) => t(yes ? 'trans.reflectCcw' : 'trans.reflectCw')
  const values = {
    ab: fmt(dist(A, B), sep),
    ab2: fmt(dist(A2, B2), sep),
    ang: fmt(angleAt(B, A, C), sep),
    ang2: fmt(angleAt(B2, A2, C2), sep),
    o1: turn(ccw(A, B, C)),
    o2: turn(ccw(A2, B2, C2)),
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('trans.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="trans.reflectIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['trans.reflectDef1', 'trans.reflectDef2']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('trans.reflectKindAria')}>
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            className={kind === k ? 'pill active' : 'pill'}
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {t(`trans.reflectKind_${k}`)}
          </button>
        ))}
      </div>

      <GeoFigure
        world={WORLD}
        height={320}
        ariaLabel={t('trans.reflectAria', { kind: t(`trans.reflectKind_${kind}`) })}
        clamp={(_, p) => hold(p)}
        onDrag={(pid, p) => setPts((old) => ({ ...old, [pid]: p }))}
        points={[
          { id: 'A', p: A, label: 'A', draggable: true },
          { id: 'B', p: B, label: 'B', draggable: true },
          { id: 'C', p: C, label: 'C', draggable: true },
          { id: 'A2', p: A2, label: 'A′', color: 'var(--series-2)' },
          { id: 'B2', p: B2, label: 'B′', color: 'var(--series-2)' },
          { id: 'C2', p: C2, label: 'C′', color: 'var(--series-2)' },
          ...(axis
            ? [
                { id: 'P', p: P, label: 'P', color: 'var(--series-3)', draggable: true },
                { id: 'Q', p: Q, label: 'Q', color: 'var(--series-3)', draggable: true },
              ]
            : [{ id: 'O', p: O, label: 'O', color: 'var(--accent-select)', draggable: true }]),
        ]}
      >
        {(g) => (
          <>
            {axis && g.line(P, Q, { color: 'var(--series-3)', dashed: true })}
            {axis && g.label(mid(P, Q), 't', { color: 'var(--series-3)', dx: 14, dy: -10 })}
            {g.polygon([A, B, C], { color: 'var(--series-1)' })}
            {g.polygon([A2, B2, C2], { color: 'var(--series-2)' })}
            {g.segment(A, A2, { color: 'var(--axis)', dashed: true, muted: true, width: 1.5 })}
            {g.length(A, B, values.ab, { color: 'var(--series-1)' })}
            {g.length(A2, B2, values.ab2, { color: 'var(--series-2)' })}
            {g.angle(B, A, C, { label: `${values.ang}°` })}
            {g.angle(B2, A2, C2, { label: `${values.ang2}°` })}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={axis ? 'trans.reflectLineAxis' : 'trans.reflectLinePoint'}
          values={values}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="trans.reflectNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="trans.reflectTask"
        isCorrect={answer === ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={ANSWER}
        onReveal={() => setAnswer(ANSWER)}
        hintKey="trans.reflectHint"
      >
        <div className="pill-row" role="group" aria-label={t('trans.reflectOptAria')}>
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={answer === option ? 'pill active' : 'pill'}
              aria-pressed={answer === option}
              onClick={() => setAnswer(option)}
            >
              {t(`trans.reflectOpt_${option}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
