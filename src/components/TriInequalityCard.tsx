import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { fmt, type Pt } from '../lib/geometry'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'
import { Tex } from './Tex'

const WORLD = { minX: -0.5, maxX: 11.5, minY: -1.5, maxY: 10.5 }
/** The base always starts here, so only its right end moves with c. */
const A: Pt = { x: 1, y: 0 }

/** Only one of these cannot be closed into a triangle. */
const TRIPLES = [
  { id: '3-4-5', a: 3, b: 4, c: 5 },
  { id: '2-3-6', a: 2, b: 3, c: 6 },
  { id: '6-6-11', a: 6, b: 6, c: 11 },
  { id: '5-12-13', a: 5, b: 12, c: 13 },
] as const
const TRIPLE_ANSWER = '2-3-6'

/**
 * Mikor nem lehet a három szakaszból háromszöget rajzolni?
 *
 * The base c is drawn, the other two sides swing on it as circles: C is where
 * the circles cross. Push one side past the sum of the other two and the
 * circles come apart — the sticks lie down on the base with the gap between
 * them, which is exactly what the triangle inequality forbids.
 */
export function TriInequalityCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [a, setA] = useState(6)
  const [b, setB] = useState(5)
  const [c, setC] = useState(8)
  const [answer, setAnswer] = useState('')

  const B: Pt = { x: A.x + c, y: 0 }
  const longest = Math.max(a, b, c)
  const rest = a + b + c - longest
  const state = longest < rest ? 'ok' : longest === rest ? 'flat' : 'gap'

  // C seen from A: its distance along the base, then straight up.
  const px = (b * b + c * c - a * a) / (2 * c)
  const C: Pt = { x: A.x + px, y: Math.sqrt(Math.max(b * b - px * px, 0)) }

  // Where the two sticks reach when they cannot meet: flat on the base,
  // each leaning in from its own end.
  const tipA: Pt = { x: A.x + b, y: 0 }
  const tipB: Pt = { x: B.x - a, y: 0 }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('tri.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="tri.ineqIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('tri.ineqPickA')} <strong>{fmt(a, sep)}</strong>
          </span>
          <input type="range" min={1} max={10} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('tri.ineqPickB')} <strong>{fmt(b, sep)}</strong>
          </span>
          <input type="range" min={1} max={10} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('tri.ineqPickC')} <strong>{fmt(c, sep)}</strong>
          </span>
          <input type="range" min={1} max={10} step={1} value={c} onChange={(e) => setC(Number(e.target.value))} />
        </label>
      </div>

      <GeoFigure
        world={WORLD}
        height={320}
        ariaLabel={t('tri.ineqAria')}
        points={[
          { id: 'A', p: A, label: 'A' },
          { id: 'B', p: B, label: 'B' },
          ...(state === 'ok' ? [{ id: 'C', p: C, label: 'C', color: 'var(--accent-select)' }] : []),
        ]}
      >
        {(g) => (
          <>
            {g.circle(A, b, { color: 'var(--series-2)', dashed: true, muted: true, width: 1.5 })}
            {g.circle(B, a, { color: 'var(--series-3)', dashed: true, muted: true, width: 1.5 })}
            {g.segment(A, B, { color: 'var(--series-1)' })}
            {g.length(A, B, `c = ${fmt(c, sep)}`, { side: -1 })}
            {state === 'ok' ? (
              <>
                {g.segment(A, C, { color: 'var(--series-2)' })}
                {g.segment(B, C, { color: 'var(--series-3)' })}
                {g.length(A, C, `b = ${fmt(b, sep)}`, { side: -1 })}
                {g.length(B, C, `a = ${fmt(a, sep)}`)}
              </>
            ) : (
              <>
                {g.segment(A, tipA, { color: 'var(--series-2)', width: 4 })}
                {g.segment(B, tipB, { color: 'var(--series-3)', width: 4 })}
                {g.length(A, tipA, `b = ${fmt(b, sep)}`, { side: -1, offset: 22 })}
                {g.length(B, tipB, `a = ${fmt(a, sep)}`, { side: -1, offset: 38 })}
                {state === 'gap' && (
                  <>
                    {g.segment(tipA, tipB, { color: 'var(--accent-select)', dashed: true, width: 3 })}
                    {g.length(tipA, tipB, fmt(tipB.x - tipA.x, sep), {
                      color: 'var(--accent-select)',
                    })}
                  </>
                )}
              </>
            )}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={state === 'ok' ? 'tri.ineqOk' : state === 'flat' ? 'tri.ineqFlat' : 'tri.ineqGap'}
          values={{
            longest: fmt(longest, sep),
            rest: fmt(rest, sep),
            gap: fmt(longest - rest, sep),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="tri.ineqNote" components={{ b: <strong />, i: <em /> }} />
      </p>
      <Tex block tex="a < b + c, \quad b < a + c, \quad c < a + b" />

      <Exercise
        promptKey="tri.ineqTask"
        isCorrect={answer === TRIPLE_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={TRIPLE_ANSWER}
        onReveal={() => setAnswer(TRIPLE_ANSWER)}
        hintKey="tri.ineqHint"
      >
        <div className="pill-row" role="group" aria-label={t('tri.ineqOptAria')}>
          {TRIPLES.map((triple) => (
            <button
              key={triple.id}
              type="button"
              className={answer === triple.id ? 'pill active' : 'pill'}
              aria-pressed={answer === triple.id}
              onClick={() => setAnswer(triple.id)}
            >
              {t('tri.ineqTrio', { a: triple.a, b: triple.b, c: triple.c })}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
