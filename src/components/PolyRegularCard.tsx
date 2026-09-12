import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { dist, fmt, len, mid, polygonArea, regularPolygon, type Pt } from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const R = 3
const O: Pt = { x: 0, y: 0 }

/** A regular hexagon of side 2: the right answer and three near misses. */
const CHOICES = [
  { id: 'quarter', value: 3 * Math.sqrt(3) },
  { id: 'area', value: 6 * Math.sqrt(3) },
  { id: 'perimeter', value: 12 },
  { id: 'double', value: 12 * Math.sqrt(3) },
]
const CHOICE_ANSWER = 'area'

/**
 * Miért K · r / 2 a szabályos sokszög területe?
 *
 * The polygon is cut into its n triangles and the triangles are laid out in a
 * strip. Nothing is added or thrown away, so the strip has the same area — and
 * the strip's is one anybody can write down: middle line times height.
 */
export function PolyRegularCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [n, setN] = useState(6)
  const [strip, setStrip] = useState(false)
  const [answer, setAnswer] = useState('')

  const pts = regularPolygon(n, R)
  const side = dist(pts[0], pts[1])
  // The apothem is the distance from the centre to the middle of any side.
  const apothem = len(mid(pts[0], pts[1]))
  const perimeter = n * side
  const area = polygonArea(pts)

  // The strip: every other triangle turned upside down, so they interlock. Its
  // bottom and top together are the whole perimeter, so its middle line is K/2.
  const bot = -apothem / 2
  const top = apothem / 2
  const upSpan = Math.ceil(n / 2) * side
  const downSpan = Math.floor(n / 2) * side
  const x0 = -upSpan / 2 - side / 4

  const piece = (i: number): Pt[] => {
    const j = Math.floor(i / 2)
    if (i % 2 === 0)
      return [
        { x: x0 + j * side, y: bot },
        { x: x0 + (j + 1) * side, y: bot },
        { x: x0 + j * side + side / 2, y: top },
      ]
    return [
      { x: x0 + side / 2 + j * side, y: top },
      { x: x0 + side / 2 + (j + 1) * side, y: top },
      { x: x0 + (j + 1) * side, y: bot },
    ]
  }

  const outline: Pt[] = [
    { x: x0, y: bot },
    { x: x0 + upSpan, y: bot },
    { x: x0 + side / 2 + downSpan, y: top },
    { x: x0 + side / 2, y: top },
  ]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('poly.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="poly.regularIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['poly.regularDef1', 'poly.regularDef2']} />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('poly.regularPickN')} <strong>{fmt(n, sep)}</strong>
          </span>
          <input
            type="range"
            min={3}
            max={24}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="pill-row" role="group" aria-label={t('poly.regularViewAria')}>
        <button
          type="button"
          className={strip ? 'pill' : 'pill active'}
          aria-pressed={!strip}
          onClick={() => setStrip(false)}
        >
          {t('poly.view_polygon')}
        </button>
        <button
          type="button"
          className={strip ? 'pill active' : 'pill'}
          aria-pressed={strip}
          onClick={() => setStrip(true)}
        >
          {t('poly.view_strip')}
        </button>
      </div>

      <GeoFigure
        world={{ minX: -7, maxX: 7, minY: -4, maxY: 4 }}
        height={320}
        ariaLabel={t(strip ? 'poly.regularAriaStrip' : 'poly.regularAriaPolygon')}
      >
        {(g) => (
          <>
            {!strip &&
              pts.map((p, i) => (
                <g key={i}>
                  {g.polygon([O, p, pts[(i + 1) % n]], {
                    color: i % 2 === 0 ? 'var(--series-1)' : 'var(--series-2)',
                  })}
                </g>
              ))}
            {!strip && (
              <>
                {g.segment(O, mid(pts[0], pts[1]), { color: 'var(--accent-select)' })}
                {g.length(O, mid(pts[0], pts[1]), `r = ${fmt(apothem, sep)}`)}
                {n <= 12 && g.length(pts[0], pts[1], `a = ${fmt(side, sep)}`)}
              </>
            )}

            {strip && (
              <>
                {Array.from({ length: n }, (_, i) => (
                  <g key={i}>
                    {g.polygon(piece(i), {
                      color: i % 2 === 0 ? 'var(--series-1)' : 'var(--series-2)',
                    })}
                  </g>
                ))}
                {g.polygon(outline, { color: 'var(--accent-select)', dashed: true, fill: false })}
                {g.length({ x: x0 + side / 2, y: bot }, { x: x0 + side / 2, y: top }, `r = ${fmt(apothem, sep)}`)}
              </>
            )}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="poly.regularResult"
          values={{
            n: fmt(n, sep, 0),
            a: fmt(side, sep, 2),
            k: fmt(perimeter, sep, 2),
            r: fmt(apothem, sep, 2),
            half: fmt(perimeter / 2, sep, 2),
            area: fmt(area, sep, 2),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans
          i18nKey="poly.regularNote"
          values={{ circle: fmt(Math.PI * R * R, sep, 2), k: fmt(2 * R * Math.PI, sep, 2) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="poly.regularTask"
        promptValues={{ k: fmt(12, sep), r: fmt(Math.sqrt(3), sep, 2) }}
        isCorrect={answer === CHOICE_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={CHOICE_ANSWER}
        onReveal={() => setAnswer(CHOICE_ANSWER)}
        hintKey="poly.regularHint"
      >
        <div className="pill-row" role="group" aria-label={t('poly.regularOptAria')}>
          {CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className={answer === choice.id ? 'pill active' : 'pill'}
              aria-pressed={answer === choice.id}
              onClick={() => setAnswer(choice.id)}
            >
              {fmt(choice.value, sep)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
