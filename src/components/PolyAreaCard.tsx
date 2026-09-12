import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { fmt, polygonArea, type Pt } from '../lib/geometry'
import { Exercise } from './Exercise'
import { GeoFigure, type GeoWorld } from './GeoFigure'

type Shape = 'para' | 'trap' | 'kite'

const SHAPES: Shape[] = ['para', 'trap', 'kite']

/** Each rearrangement needs its own piece of the plane to spread out in. */
const WORLDS: Record<Shape, GeoWorld> = {
  para: { minX: -1.5, maxX: 15.5, minY: -2, maxY: 8 },
  trap: { minX: -3.5, maxX: 20, minY: -2, maxY: 8 },
  kite: { minX: -7, maxX: 7, minY: -6.5, maxY: 6.5 },
}

const TRAP_TASK_ANSWER = 32

/**
 * Átdarabolás.
 *
 * Three formulas, one idea: cut the shape up and the pieces make a rectangle or
 * a parallelogram whose area anybody can write down. The toggle moves the cut
 * piece, so the reader sees the same area twice rather than being told twice.
 */
export function PolyAreaCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [shape, setShape] = useState<Shape>('para')
  const [cut, setCut] = useState(false)
  const [a, setA] = useState(8)
  const [c, setC] = useState(4)
  const [m, setM] = useState(4)
  const [slant, setSlant] = useState(2)
  const [d1, setD1] = useState(8)
  const [d2, setD2] = useState(6)
  const [answer, setAnswer] = useState('')

  // The parallelogram, its cut and the rectangle the cut piece completes.
  const paraPts: Pt[] = [
    { x: 0, y: 0 },
    { x: a, y: 0 },
    { x: a + slant, y: m },
    { x: slant, y: m },
  ]
  const paraFoot: Pt = { x: slant, y: 0 }
  const paraLeft: Pt[] = [{ x: 0, y: 0 }, paraFoot, { x: slant, y: m }]
  const paraRest: Pt[] = [paraFoot, { x: a, y: 0 }, { x: a + slant, y: m }, { x: slant, y: m }]
  const paraMoved: Pt[] = [
    { x: a, y: 0 },
    { x: a + slant, y: 0 },
    { x: a + slant, y: m },
  ]

  // The trapezoid and the copy turned half a turn about the middle of its leg.
  const off = (a - c) / 2
  const trapPts: Pt[] = [
    { x: 0, y: 0 },
    { x: a, y: 0 },
    { x: off + c, y: m },
    { x: off, y: m },
  ]
  const trapCopy: Pt[] = [
    { x: a, y: 0 },
    { x: a + c, y: 0 },
    { x: a + off + c, y: m },
    { x: off + c, y: m },
  ]

  // The kite inside the rectangle its diagonals span.
  const up = d2 * 0.6
  const down = d2 * 0.4
  const kitePts: Pt[] = [
    { x: -d1 / 2, y: 0 },
    { x: 0, y: -down },
    { x: d1 / 2, y: 0 },
    { x: 0, y: up },
  ]
  const kiteBox: Pt[] = [
    { x: -d1 / 2, y: -down },
    { x: d1 / 2, y: -down },
    { x: d1 / 2, y: up },
    { x: -d1 / 2, y: up },
  ]
  const kiteRest: Pt[][] = [
    [{ x: d1 / 2, y: 0 }, { x: d1 / 2, y: up }, { x: 0, y: up }],
    [{ x: -d1 / 2, y: 0 }, { x: -d1 / 2, y: up }, { x: 0, y: up }],
    [{ x: d1 / 2, y: 0 }, { x: d1 / 2, y: -down }, { x: 0, y: -down }],
    [{ x: -d1 / 2, y: 0 }, { x: -d1 / 2, y: -down }, { x: 0, y: -down }],
  ]

  const area = polygonArea(shape === 'para' ? paraPts : shape === 'trap' ? trapPts : kitePts)
  const values = {
    a: fmt(a, sep),
    c: fmt(c, sep),
    m: fmt(m, sep),
    d1: fmt(d1, sep),
    d2: fmt(d2, sep),
    area: fmt(area, sep),
    double: fmt(2 * area, sep),
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('poly.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="poly.areaIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('poly.areaShapeAria')}>
        {SHAPES.map((item) => (
          <button
            key={item}
            type="button"
            className={shape === item ? 'pill active' : 'pill'}
            aria-pressed={shape === item}
            onClick={() => setShape(item)}
          >
            {t(`poly.shape_${item}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        {shape !== 'kite' && (
          <label className="field">
            <span className="field-label">
              {t('poly.areaPickA')} <strong>{fmt(a, sep)}</strong>
            </span>
            <input
              type="range"
              min={4}
              max={10}
              step={1}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
            />
          </label>
        )}
        {shape === 'trap' && (
          <label className="field">
            <span className="field-label">
              {t('poly.areaPickC')} <strong>{fmt(c, sep)}</strong>
            </span>
            <input
              type="range"
              min={2}
              max={8}
              step={1}
              value={c}
              onChange={(e) => setC(Number(e.target.value))}
            />
          </label>
        )}
        {shape !== 'kite' && (
          <label className="field">
            <span className="field-label">
              {t('poly.areaPickM')} <strong>{fmt(m, sep)}</strong>
            </span>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={m}
              onChange={(e) => setM(Number(e.target.value))}
            />
          </label>
        )}
        {shape === 'para' && (
          <label className="field">
            <span className="field-label">
              {t('poly.areaPickSlant')} <strong>{fmt(slant, sep)}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={slant}
              onChange={(e) => setSlant(Number(e.target.value))}
            />
          </label>
        )}
        {shape === 'kite' && (
          <label className="field">
            <span className="field-label">
              {t('poly.areaPickD1')} <strong>{fmt(d1, sep)}</strong>
            </span>
            <input
              type="range"
              min={4}
              max={10}
              step={1}
              value={d1}
              onChange={(e) => setD1(Number(e.target.value))}
            />
          </label>
        )}
        {shape === 'kite' && (
          <label className="field">
            <span className="field-label">
              {t('poly.areaPickD2')} <strong>{fmt(d2, sep)}</strong>
            </span>
            <input
              type="range"
              min={4}
              max={10}
              step={1}
              value={d2}
              onChange={(e) => setD2(Number(e.target.value))}
            />
          </label>
        )}
      </div>

      <div className="pill-row" role="group" aria-label={t('poly.areaCutAria')}>
        <button
          type="button"
          className={cut ? 'pill' : 'pill active'}
          aria-pressed={!cut}
          onClick={() => setCut(false)}
        >
          {t('poly.areaCutOff')}
        </button>
        <button
          type="button"
          className={cut ? 'pill active' : 'pill'}
          aria-pressed={cut}
          onClick={() => setCut(true)}
        >
          {t(`poly.areaCutOn_${shape}`)}
        </button>
      </div>

      <GeoFigure
        world={WORLDS[shape]}
        height={320}
        ariaLabel={t(`poly.areaAria_${shape}`)}
      >
        {(g) => (
          <>
            {shape === 'para' && (
              <>
                {g.polygon(cut ? paraRest : paraPts, { color: 'var(--series-1)' })}
                {g.polygon(cut ? paraMoved : paraLeft, { color: 'var(--series-2)' })}
                {cut &&
                  g.polygon(
                    [paraFoot, { x: a + slant, y: 0 }, { x: a + slant, y: m }, { x: slant, y: m }],
                    { color: 'var(--accent-select)', dashed: true, fill: false }
                  )}
                {g.segment(paraFoot, { x: slant, y: m }, {
                  color: 'var(--axis)',
                  dashed: true,
                  width: 1.5,
                })}
                {g.length({ x: 0, y: 0 }, { x: a, y: 0 }, `a = ${fmt(a, sep)}`)}
                {g.length({ x: slant, y: m }, paraFoot, `m = ${fmt(m, sep)}`, { side: -1 })}
              </>
            )}

            {shape === 'trap' && (
              <>
                {g.polygon(trapPts, { color: 'var(--series-1)' })}
                {cut && g.polygon(trapCopy, { color: 'var(--series-2)' })}
                {cut &&
                  g.polygon(
                    [
                      { x: 0, y: 0 },
                      { x: a + c, y: 0 },
                      { x: a + off + c, y: m },
                      { x: off, y: m },
                    ],
                    { color: 'var(--accent-select)', dashed: true, fill: false }
                  )}
                {g.segment({ x: off, y: 0 }, { x: off, y: m }, {
                  color: 'var(--axis)',
                  dashed: true,
                  width: 1.5,
                })}
                {g.length({ x: 0, y: 0 }, { x: a, y: 0 }, `a = ${fmt(a, sep)}`)}
                {g.length({ x: off, y: m }, { x: off + c, y: m }, `c = ${fmt(c, sep)}`, { side: -1 })}
                {g.length({ x: off, y: m }, { x: off, y: 0 }, `m = ${fmt(m, sep)}`, { side: -1 })}
              </>
            )}

            {shape === 'kite' && (
              <>
                {cut && g.polygon(kiteBox, { color: 'var(--accent-select)', dashed: true, fill: false })}
                {cut && kiteRest.map((tri, i) => <g key={i}>{g.polygon(tri, { color: 'var(--series-2)' })}</g>)}
                {g.polygon(kitePts, { color: 'var(--series-1)' })}
                {g.length({ x: -d1 / 2, y: 0 }, { x: d1 / 2, y: 0 }, `d₁ = ${fmt(d1, sep)}`)}
                {g.length({ x: 0, y: -down }, { x: 0, y: up }, `d₂ = ${fmt(d2, sep)}`)}
              </>
            )}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`poly.areaResult_${shape}`}
          values={values}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="poly.areaNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="poly.areaTask"
        promptValues={{ a: fmt(10, sep), c: fmt(6, sep), m: fmt(4, sep) }}
        isCorrect={Number(answer) === TRAP_TASK_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(TRAP_TASK_ANSWER)}
        onReveal={() => setAnswer(String(TRAP_TASK_ANSWER))}
        hintKey="poly.areaHint"
      >
        <label className="field">
          <span className="field-label">{t('poly.areaAnswer')}</span>
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
