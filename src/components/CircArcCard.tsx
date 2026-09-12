import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { arcLength, fmt, rad, sectorArea, segmentArea, type Pt } from '../lib/geometry'
import { parseDecimal, texSeparator } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'
import { Tex } from './Tex'

const O: Pt = { x: 0, y: 0 }
const WORLD = { minX: -7, maxX: 7, minY: -7, maxY: 7 }

type Mode = 'sector' | 'segment' | 'ring'
const MODES: Mode[] = ['sector', 'segment', 'ring']

/** The exercise: a sixth of a circle of radius 6, so the arc is exactly 2π. */
const TASK_R = 6
const TASK_ALPHA = 60
const TASK_ANSWER = arcLength(TASK_R, TASK_ALPHA)

/** The point of the circle at a given angle: `geometry.ts` has no polar form. */
const polar = (r: number, degrees: number): Pt => ({
  x: r * Math.cos(rad(degrees)),
  y: r * Math.sin(rad(degrees)),
})

/**
 * The circle between two angles as a chain of points, fine enough that a
 * polygon of them reads as an arc. `Draw` can stroke an arc but cannot fill
 * one, and every shaded piece of this figure is bounded by one.
 */
function arcPoints(r: number, from: number, to: number): Pt[] {
  const steps = Math.max(2, Math.ceil(Math.abs(to - from) / 3))
  return Array.from({ length: steps + 1 }, (_, i) => polar(r, from + ((to - from) * i) / steps))
}

/**
 * Középponti szög, körív, körcikk.
 *
 * One slider turns the angle and the whole slice follows: the arc, the sector
 * and the ring slice are the same fraction α/360 of the whole circle. The
 * körszelet pill is there to break the pattern — its area is not proportional
 * to the angle, which is exactly the trap the note names.
 */
export function CircArcCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [mode, setMode] = useState<Mode>('sector')
  const [alpha, setAlpha] = useState(120)
  const [radius, setRadius] = useState(5)
  const [inner, setInner] = useState(3)
  const [answer, setAnswer] = useState('')

  // The hole can never swallow the ring: it stays a unit inside the rim.
  const rIn = Math.min(inner, radius - 1)
  const arc = arcLength(radius, alpha)
  const sector = sectorArea(radius, alpha)
  const segment = segmentArea(radius, alpha)
  const triangle = sector - segment
  const ringFull = (radius * radius - rIn * rIn) * Math.PI
  const ringPart = (ringFull * alpha) / 360
  const ratio = (alpha / 360) * 100

  /** For prose: the reader's separator. */
  const num = (x: number) => fmt(x, sep, 2)
  /** For KaTeX: written with a point, swapped for the separator by texSeparator. */
  const tn = (x: number) => fmt(x, '.', 2)

  const start = polar(radius, 0)
  const end = polar(radius, alpha)
  const shape =
    mode === 'sector'
      ? [O, ...arcPoints(radius, 0, alpha)]
      : mode === 'segment'
        ? arcPoints(radius, 0, alpha)
        : [...arcPoints(radius, 0, alpha), ...arcPoints(rIn, alpha, 0)]

  const formulas =
    mode === 'sector'
      ? [
          `i = 2r\\pi \\cdot \\frac{\\alpha}{360^\\circ} = 2 \\cdot ${radius} \\cdot \\pi \\cdot \\frac{${alpha}}{360} = ${tn(arc)}`,
          `t = r^2\\pi \\cdot \\frac{\\alpha}{360^\\circ} = ${radius}^2 \\cdot \\pi \\cdot \\frac{${alpha}}{360} = ${tn(sector)}`,
        ]
      : mode === 'segment'
        ? [
            `t_{\\text{${t('circ.arcWordSegment')}}} = t_{\\text{${t('circ.arcWordSector')}}} - t_{\\text{${t('circ.arcWordTriangle')}}} = ${tn(sector)} - ${tn(triangle)} = ${tn(segment)}`,
          ]
        : [
            `t = (R^2 - r^2)\\pi \\cdot \\frac{\\alpha}{360^\\circ} = (${radius}^2 - ${rIn}^2) \\cdot \\pi \\cdot \\frac{${alpha}}{360} = ${tn(ringPart)}`,
          ]

  const typed = parseDecimal(answer)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('circ.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="circ.arcIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['circ.arcDef1', 'circ.arcDef2']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('circ.arcModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`circ.arcMode_${m}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('circ.arcPickAlpha')} <strong>{alpha}°</strong>
          </span>
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t(mode === 'ring' ? 'circ.arcPickOuter' : 'circ.arcPickR')}{' '}
            <strong>{num(radius)}</strong>
          </span>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </label>
        {mode === 'ring' && (
          <label className="field">
            <span className="field-label">
              {t('circ.arcPickInner')} <strong>{num(rIn)}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={inner}
              onChange={(e) => setInner(Number(e.target.value))}
            />
          </label>
        )}
      </div>

      <GeoFigure
        world={WORLD}
        height={320}
        ariaLabel={t('circ.arcAria', { r: num(radius), alpha })}
        points={[{ id: 'O', p: O, label: 'O', color: 'var(--axis)' }]}
      >
        {(g) => (
          <>
            {g.circle(O, radius, { color: 'var(--axis)', muted: true })}
            {mode === 'ring' && g.circle(O, rIn, { color: 'var(--axis)', muted: true })}
            {g.polygon(shape, { color: 'var(--series-1)', width: 1.5 })}
            {g.segment(O, start, { color: 'var(--series-1)' })}
            {g.segment(O, end, { color: 'var(--series-1)' })}
            {mode === 'segment' && g.segment(start, end, { color: 'var(--series-3)' })}
            {mode === 'ring' && g.segment(O, polar(rIn, alpha), { color: 'var(--series-3)', dashed: true })}
            {alpha > 0 && alpha < 360 && g.arc(O, radius, 0, alpha, { color: 'var(--series-2)', width: 4 })}
            {alpha > 0 && g.arc(O, 1.2, 0, Math.min(alpha, 359), { color: 'var(--axis)' })}
            {g.label(polar(1.9, alpha / 2), `${alpha}°`, { color: 'var(--axis)' })}
            {g.length(O, start, `r = ${num(radius)}`, { side: -1 })}
          </>
        )}
      </GeoFigure>

      {formulas.map((f) => (
        <Tex key={f} block tex={texSeparator(f, sep)} />
      ))}

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`circ.arcResult_${mode}`}
          values={{
            alpha,
            ratio: num(ratio),
            arc: num(arc),
            sector: num(sector),
            segment: num(segment),
            triangle: num(triangle),
            ring: num(ringFull),
            part: num(ringPart),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="circ.arcNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="circ.arcTask"
        promptValues={{ r: TASK_R, alpha: TASK_ALPHA }}
        isCorrect={typed !== null && Math.abs(typed - TASK_ANSWER) < 0.05}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={num(TASK_ANSWER)}
        onReveal={() => setAnswer(num(TASK_ANSWER))}
        hintKey="circ.arcHint"
      >
        <label className="field">
          <span className="field-label">{t('circ.arcAnswer')}</span>
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
