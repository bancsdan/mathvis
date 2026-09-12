import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { dist, fmt, homothety, polygonArea, type Pt } from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

/** The triangle that gets scaled. Fixed, so the only moving parts are O and λ. */
const SHAPE: Pt[] = [
  { x: 1.2, y: 0.8 },
  { x: 3.4, y: 1.2 },
  { x: 2, y: 2.8 },
]

/** Zero is missing on purpose: it would crush the triangle into the centre. */
const LAMBDAS = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]
const START_INDEX = 9

const ANSWER = '12'

const LETTERS = ['A', 'B', 'C']
const IMAGE_LETTERS = ['A′', 'B′', 'C′']

const perimeter = (pts: readonly Pt[]): number =>
  pts.reduce((s, p, i) => s + dist(p, pts[(i + 1) % pts.length]), 0)

/** Keeps the centre where both the triangle and its image stay drawable. */
const hold = (p: Pt): Pt => ({
  x: Math.min(4, Math.max(-4, p.x)),
  y: Math.min(3, Math.max(-3, p.y)),
})

/** The window around everything the figure has to show, never smaller than 6 units. */
function fitWorld(pts: readonly Pt[], pad: number) {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const grow = (lo: number, hi: number): [number, number] =>
    hi - lo >= 6 ? [lo, hi] : [(lo + hi) / 2 - 3, (lo + hi) / 2 + 3]
  const [x0, x1] = grow(Math.min(...xs) - pad, Math.max(...xs) + pad)
  const [y0, y1] = grow(Math.min(...ys) - pad, Math.max(...ys) + pad)
  return { minX: x0, maxX: x1, minY: y0, maxY: y1 }
}

/**
 * Ha kétszer akkora, miért négyszer akkora a terület?
 *
 * The perimeter and the area are both measured off the picture, so the two
 * ratios stand side by side and refuse to be the same number. The negative end
 * of the slider is the second lesson: it puts the image on the far side of the
 * centre without changing a single measurement.
 */
export function TransSimilarCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [index, setIndex] = useState(START_INDEX)
  const [O, setO] = useState<Pt>({ x: 0, y: 0 })
  const [answer, setAnswer] = useState('')

  const lambda = LAMBDAS[index]
  const image = SHAPE.map((p) => homothety(p, O, lambda))
  const world = fitWorld([O, ...SHAPE, ...image], 1)

  const values = {
    k: fmt(lambda, sep),
    p1: fmt(perimeter(SHAPE), sep),
    p2: fmt(perimeter(image), sep),
    abs: fmt(Math.abs(lambda), sep),
    a1: fmt(polygonArea(SHAPE), sep, 2),
    a2: fmt(polygonArea(image), sep, 2),
    sq: fmt(lambda * lambda, sep, 2),
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('trans.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="trans.simIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['trans.simDef1', 'trans.simDef2']} />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('trans.simRatio')} <strong>λ = {values.k}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={LAMBDAS.length - 1}
            step={1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
          />
        </label>
      </div>

      <GeoFigure
        world={world}
        height={320}
        ariaLabel={t('trans.simAria')}
        clamp={(_, p) => hold(p)}
        onDrag={(_, p) => setO(p)}
        points={[
          { id: 'O', p: O, label: 'O', color: 'var(--accent-select)', draggable: true },
          ...SHAPE.map((p, i) => ({ id: LETTERS[i], p, label: LETTERS[i] })),
          ...image.map((p, i) => ({
            id: IMAGE_LETTERS[i],
            p,
            label: IMAGE_LETTERS[i],
            color: 'var(--series-2)',
          })),
        ]}
      >
        {(g) => (
          <>
            {SHAPE.map((p, i) => (
              <g key={LETTERS[i]}>
                {g.line(O, p, { color: 'var(--axis)', dashed: true, muted: true, width: 1.5 })}
              </g>
            ))}
            {g.polygon(SHAPE, { color: 'var(--series-1)' })}
            {g.polygon(image, { color: 'var(--series-2)' })}
            {g.length(SHAPE[0], SHAPE[1], fmt(dist(SHAPE[0], SHAPE[1]), sep), {
              color: 'var(--series-1)',
            })}
            {g.length(image[0], image[1], fmt(dist(image[0], image[1]), sep), {
              color: 'var(--series-2)',
            })}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans i18nKey="trans.simLine" values={values} components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="trans.simNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="trans.simTask"
        isCorrect={Number(answer) === Number(ANSWER)}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={ANSWER}
        onReveal={() => setAnswer(ANSWER)}
        hintKey="trans.simHint"
      >
        <label className="field">
          <span className="field-label">{t('trans.simAnswer')}</span>
          <input
            className="answer-input"
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
