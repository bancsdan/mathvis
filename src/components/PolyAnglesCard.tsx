import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  add,
  angleAt,
  fmt,
  normalize,
  rad,
  regularPolygon,
  scale,
  sub,
  type Pt,
} from '../lib/geometry'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

const R = 3
const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)']
const HEXAGON_ANSWER = 720

/**
 * A polygon that is convex but visibly not regular, so nothing on the picture
 * can be blamed on symmetry. The radii wobble by a tenth, which is far too
 * little to fold a vertex inwards.
 */
function shape(n: number): Pt[] {
  return regularPolygon(n, 1).map((p, i) => scale(p, R * (1 + 0.12 * Math.sin(2.3 * i + 0.7))))
}

/** A point of the gathering circle, at `deg` measured the mathematical way. */
const at = (deg: number, r: number): Pt => ({ x: r * Math.cos(rad(deg)), y: r * Math.sin(rad(deg)) })

/**
 * Miért (n − 2) · 180° a belső, és miért 360° a külső szögösszeg?
 *
 * The interior sum is counted rather than recited: the diagonals of one vertex
 * cut the polygon into triangles and the reader counts them. The exterior
 * angles are gathered around a single point, where they visibly close up into
 * one full turn however many sides there are.
 */
export function PolyAnglesCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [n, setN] = useState(6)
  const [mode, setMode] = useState<'inner' | 'outer'>('inner')
  const [gathered, setGathered] = useState(false)
  const [answer, setAnswer] = useState('')

  const pts = shape(n)
  const inner = pts.map((p, i) => angleAt(pts[(i + n - 1) % n], p, pts[(i + 1) % n]))
  const outer = inner.map((a) => 180 - a)
  const innerSum = inner.reduce((s, a) => s + a, 0)
  const outerSum = outer.reduce((s, a) => s + a, 0)

  // Where each gathered exterior angle starts, going round from straight up.
  const starts = outer.reduce<number[]>(
    (acc, a) => [...acc, (acc[acc.length - 1] ?? 90) + a],
    []
  )

  const ariaKey = mode === 'outer' && gathered ? 'gathered' : mode

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('poly.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="poly.anglesIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('poly.anglesPickN')} <strong>{fmt(n, sep)}</strong>
          </span>
          <input
            type="range"
            min={3}
            max={10}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="pill-row" role="group" aria-label={t('poly.anglesModeAria')}>
        <button
          type="button"
          className={mode === 'inner' ? 'pill active' : 'pill'}
          aria-pressed={mode === 'inner'}
          onClick={() => setMode('inner')}
        >
          {t('poly.mode_inner')}
        </button>
        <button
          type="button"
          className={mode === 'outer' ? 'pill active' : 'pill'}
          aria-pressed={mode === 'outer'}
          onClick={() => setMode('outer')}
        >
          {t('poly.mode_outer')}
        </button>
        {mode === 'outer' && (
          <button
            type="button"
            className={gathered ? 'pill active' : 'pill'}
            aria-pressed={gathered}
            onClick={() => setGathered(!gathered)}
          >
            {t('poly.anglesGather')}
          </button>
        )}
      </div>

      <GeoFigure
        world={{ minX: -4.5, maxX: 4.5, minY: -4.5, maxY: 4.5 }}
        height={320}
        ariaLabel={t(`poly.anglesAria_${ariaKey}`)}
      >
        {(g) => (
          <>
            {mode === 'inner' &&
              pts.slice(1, n - 1).map((p, i) => (
                <g key={i}>
                  {g.polygon([pts[0], p, pts[i + 2]], { color: SERIES[i % 3] })}
                </g>
              ))}

            {mode === 'outer' && !gathered && (
              <>
                {g.polygon(pts, { color: 'var(--series-1)' })}
                {pts.map((p, i) => {
                  const ext = add(p, scale(normalize(sub(p, pts[(i + n - 1) % n])), 1.1))
                  return (
                    <g key={i}>
                      {g.segment(p, ext, { color: 'var(--axis)', dashed: true, width: 1.5 })}
                      {g.angle(ext, p, pts[(i + 1) % n], {
                        radius: 15,
                        color: 'var(--series-2)',
                      })}
                    </g>
                  )
                })}
              </>
            )}

            {mode === 'outer' && gathered && (
              <>
                {g.circle({ x: 0, y: 0 }, 2.6, { color: 'var(--axis)', dashed: true, width: 1.5 })}
                {outer.map((a, i) => {
                  const from = starts[i] - a
                  return (
                    <g key={i}>
                      {g.segment({ x: 0, y: 0 }, at(from, 2.6), {
                        color: SERIES[i % 3],
                        width: 1.5,
                      })}
                      {g.arc({ x: 0, y: 0 }, 2.6, from, starts[i], { color: SERIES[i % 3], width: 3 })}
                    </g>
                  )
                })}
              </>
            )}

            {mode === 'inner' && g.polygon(pts, { color: 'var(--series-1)', fill: false })}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={mode === 'inner' ? 'poly.anglesResultInner' : 'poly.anglesResultOuter'}
          values={{
            n: fmt(n, sep, 0),
            tri: fmt(n - 2, sep, 0),
            diag: fmt((n * (n - 3)) / 2, sep, 0),
            sum: fmt(innerSum, sep, 0),
            outerSum: fmt(outerSum, sep, 0),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="poly.anglesNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="poly.anglesTask"
        isCorrect={Number(answer) === HEXAGON_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(HEXAGON_ANSWER)}
        onReveal={() => setAnswer(String(HEXAGON_ANSWER))}
        hintKey="poly.anglesHint"
      >
        <label className="field">
          <span className="field-label">{t('poly.anglesAnswer')}</span>
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
