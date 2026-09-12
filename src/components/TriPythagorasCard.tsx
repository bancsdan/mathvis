import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { deg, fmt, type Pt } from '../lib/geometry'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'
import { Tex } from './Tex'

type Mode = 'rearrange' | 'converse'
const MODES: Mode[] = ['rearrange', 'converse']
type Arrangement = 'squares' | 'tilted'
const ARRANGEMENTS: Arrangement[] = ['squares', 'tilted']

const TASK = { a: 5, b: 12 }
const TASK_ANSWER = '13'

/** The angle opposite the longest side, from the three lengths alone. */
function oppositeAngle(u: number, v: number, w: number): number {
  const cos = (u * u + v * v - w * w) / (2 * u * v)
  return deg(Math.acos(Math.min(1, Math.max(-1, cos))))
}

/**
 * Miért igaz, hogy a² + b² = c²?
 *
 * The same (a + b)-sided square holds the same four right triangles twice
 * over. One arrangement leaves two squares, a² and b²; the other leaves the
 * tilted square c². Nothing was added or removed between the two pictures, so
 * the two leftovers have to be equal.
 *
 * The second mode runs the theorem backwards: type three lengths and the
 * figure reports the angle facing the longest one.
 */
export function TriPythagorasCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [mode, setMode] = useState<Mode>('rearrange')
  const [arrangement, setArrangement] = useState<Arrangement>('squares')
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const [sides, setSides] = useState({ u: '6', v: '8', w: '10' })
  const [answer, setAnswer] = useState('')

  /* ---- the rearrangement ------------------------------------------- */
  const s = a + b
  const c = Math.hypot(a, b)
  const P = (x: number, y: number): Pt => ({ x, y })
  const squareTriangles: Pt[][] = [
    [P(a, 0), P(s, 0), P(s, a)],
    [P(a, 0), P(s, a), P(a, a)],
    [P(0, a), P(a, a), P(a, s)],
    [P(0, a), P(a, s), P(0, s)],
  ]
  const tiltedTriangles: Pt[][] = [
    [P(0, 0), P(a, 0), P(0, b)],
    [P(s, 0), P(s, a), P(a, 0)],
    [P(s, s), P(b, s), P(s, a)],
    [P(0, s), P(0, b), P(b, s)],
  ]
  const triangles = arrangement === 'squares' ? squareTriangles : tiltedTriangles

  /* ---- the converse ------------------------------------------------- */
  const nums = [Number(sides.u), Number(sides.v), Number(sides.w)]
  const clean = nums.every((n) => Number.isFinite(n) && n > 0)
  const sorted = [...nums].sort((x, y) => x - y)
  const [p, q, longest] = sorted
  const closes = clean && p + q > longest
  const angle = closes ? oppositeAngle(p, q, longest) : NaN
  const verdict = Math.abs(angle - 90) < 0.05 ? 'right' : angle < 90 ? 'acute' : 'obtuse'

  // The longest side lies on the base, so the angle facing it is the one at
  // the top — the only one the reader has to look at.
  const baseA = P(0, 0)
  const baseB = P(longest, 0)
  const cx = closes ? (p * p + longest * longest - q * q) / (2 * longest) : 0
  const apex = P(cx, closes ? Math.sqrt(Math.max(p * p - cx * cx, 0)) : 0)

  const rearrangeWorld = { minX: -0.6, maxX: s + 0.6, minY: -0.6, maxY: s + 0.6 }
  const converseWorld = {
    minX: -0.6,
    maxX: (clean ? longest : 1) + 0.6,
    minY: -1.2,
    maxY: Math.max(apex.y + 1, 2),
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('tri.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="tri.pythIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('tri.pythModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`tri.pythMode_${m}`)}
          </button>
        ))}
      </div>

      {mode === 'rearrange' ? (
        <>
          <div className="controls-inline">
            <label className="field">
              <span className="field-label">
                {t('tri.pythPickA')} <strong>{fmt(a, sep)}</strong>
              </span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
              />
            </label>
            <label className="field">
              <span className="field-label">
                {t('tri.pythPickB')} <strong>{fmt(b, sep)}</strong>
              </span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="pill-row" role="group" aria-label={t('tri.pythArrangeAria')}>
            {ARRANGEMENTS.map((arr) => (
              <button
                key={arr}
                type="button"
                className={arrangement === arr ? 'pill active' : 'pill'}
                aria-pressed={arrangement === arr}
                onClick={() => setArrangement(arr)}
              >
                {t(`tri.pythArrange_${arr}`)}
              </button>
            ))}
          </div>

          <GeoFigure
            world={rearrangeWorld}
            height={340}
            ariaLabel={t(`tri.pythAria_${arrangement}`)}
          >
            {(g) => (
              <>
                {g.polygon([P(0, 0), P(s, 0), P(s, s), P(0, s)], {
                  color: 'var(--axis)',
                  fill: false,
                })}
                {triangles.map((tri, i) => (
                  <g key={i}>{g.polygon(tri, { color: 'var(--series-1)' })}</g>
                ))}
                {arrangement === 'squares' ? (
                  <>
                    {g.polygon([P(0, 0), P(a, 0), P(a, a), P(0, a)], {
                      color: 'var(--series-2)',
                    })}
                    {g.polygon([P(a, a), P(s, a), P(s, s), P(a, s)], {
                      color: 'var(--series-3)',
                    })}
                    {g.label(P(a / 2, a / 2), 'a²', { color: 'var(--series-2)' })}
                    {g.label(P((a + s) / 2, (a + s) / 2), 'b²', { color: 'var(--series-3)' })}
                  </>
                ) : (
                  <>
                    {g.polygon([P(a, 0), P(s, a), P(b, s), P(0, b)], {
                      color: 'var(--accent-select)',
                    })}
                    {g.label(P(s / 2, s / 2), 'c²', { color: 'var(--accent-select)' })}
                  </>
                )}
                {g.length(P(0, 0), P(a, 0), `a = ${fmt(a, sep)}`, { side: -1 })}
                {g.length(P(a, 0), P(s, 0), `b = ${fmt(b, sep)}`, { side: -1 })}
              </>
            )}
          </GeoFigure>

          <Tex block tex={`a^2 + b^2 = ${a * a} + ${b * b} = ${a * a + b * b} = c^2`} />
        </>
      ) : (
        <>
          <div className="controls-inline">
            {(['u', 'v', 'w'] as const).map((key) => (
              <label className="field" key={key}>
                <span className="field-label">{t(`tri.pythSide_${key}`)}</span>
                <input
                  className="answer-input"
                  type="number"
                  min={0}
                  value={sides[key]}
                  onChange={(e) => setSides((old) => ({ ...old, [key]: e.target.value }))}
                />
              </label>
            ))}
          </div>

          <GeoFigure world={converseWorld} height={300} ariaLabel={t('tri.pythAria_converse')}>
            {(g) => (
              <>
                {closes ? (
                  <>
                    {g.polygon([baseA, baseB, apex], { color: 'var(--series-1)' })}
                    {g.angle(baseA, apex, baseB, {
                      label: `${fmt(angle, sep)}°`,
                      right: verdict === 'right',
                      color: 'var(--accent-select)',
                    })}
                    {g.length(baseA, baseB, fmt(longest, sep), { side: -1 })}
                    {g.length(baseA, apex, fmt(p, sep), { side: -1 })}
                    {g.length(baseB, apex, fmt(q, sep))}
                  </>
                ) : (
                  g.segment(baseA, baseB, { color: 'var(--axis)', dashed: true })
                )}
              </>
            )}
          </GeoFigure>
        </>
      )}

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={
            mode === 'rearrange'
              ? 'tri.pythResult'
              : closes
                ? 'tri.pythConverse'
                : 'tri.pythConverseNone'
          }
          values={{
            aa: fmt(a * a, sep),
            bb: fmt(b * b, sep),
            sum: fmt(a * a + b * b, sep),
            c: fmt(c, sep, 2),
            small: fmt(p * p + q * q, sep),
            big: fmt(longest * longest, sep),
            ang: fmt(angle, sep),
            verdict: t(`tri.pythVerdict_${verdict}`),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="tri.pythNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="tri.pythTask"
        promptValues={TASK}
        isCorrect={answer.trim() === TASK_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer.trim()}
        solutionKey={TASK_ANSWER}
        onReveal={() => setAnswer(TASK_ANSWER)}
        hintKey="tri.pythHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('tri.pythAnswer')}</span>
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
