import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { angleAt, dist, fmt, rad, scale, type Pt } from '../lib/geometry'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GeoFigure } from './GeoFigure'

type CaseId = 'sss' | 'sas' | 'asa' | 'ssa'
const CASES: CaseId[] = ['sss', 'sas', 'asa', 'ssa']
const ANSWER: CaseId = 'ssa'

interface Dims {
  a: number
  b: number
  c: number
  alpha: number
  beta: number
}

/** Two sides that meet at 40° with the third data set so SSA starts ambiguous. */
const START: Dims = { a: 5, b: 6, c: 7, alpha: 40, beta: 60 }

/** Which sliders each case hands the reader, in the order the name lists them. */
const FIELDS: Record<CaseId, Array<keyof Dims>> = {
  sss: ['a', 'b', 'c'],
  sas: ['b', 'alpha', 'c'],
  asa: ['alpha', 'c', 'beta'],
  ssa: ['c', 'alpha', 'a'],
}

const A: Pt = { x: 0, y: 0 }

const dirOf = (a: number): Pt => ({ x: Math.cos(rad(a)), y: Math.sin(rad(a)) })
const cot = (a: number): number => Math.cos(rad(a)) / Math.sin(rad(a))
const bearing = (O: Pt, P: Pt): number => (Math.atan2(P.y - O.y, P.x - O.x) * 180) / Math.PI

interface Build {
  /** How many triangles the data allow: the whole point of the card. */
  status: 'one' | 'two' | 'none'
  /** The third vertex, once or twice, or not at all. */
  cs: Pt[]
  /** Extra points the window must hold, so the construction stays visible. */
  fit: Pt[]
  key: string
  values: Record<string, string>
}

/**
 * The triangle built from the given pieces, the way a compass and a ruler
 * would do it — and the sentence that says how many triangles came out.
 */
function build(kind: CaseId, d: Dims, sep: string): Build {
  const B: Pt = { x: d.c, y: 0 }
  const f = (x: number) => fmt(x, sep)

  if (kind === 'sss') {
    // C is where the two circles meet: the x follows from the two distances.
    const cx = (d.b * d.b - d.a * d.a + d.c * d.c) / (2 * d.c)
    const h2 = d.b * d.b - cx * cx
    if (h2 <= 0) {
      const sides = [d.a, d.b, d.c]
      const longest = Math.max(...sides)
      const rest = sides.reduce((s, v) => s + v, 0) - longest
      return {
        status: 'none',
        cs: [],
        fit: [
          { x: -d.b, y: 0 },
          { x: 0, y: d.b },
          { x: d.c + d.a, y: 0 },
          { x: d.c, y: d.a },
        ],
        key: 'trans.congLineSssNone',
        values: { longest: f(longest), rest: f(rest) },
      }
    }
    const C = { x: cx, y: Math.sqrt(h2) }
    return {
      status: 'one',
      cs: [C],
      fit: [C],
      key: 'trans.congLineSssOne',
      values: { al: f(angleAt(B, A, C)), be: f(angleAt(A, B, C)), ga: f(angleAt(A, C, B)) },
    }
  }

  if (kind === 'sas') {
    const C = scale(dirOf(d.alpha), d.b)
    return {
      status: 'one',
      cs: [C],
      fit: [C],
      key: 'trans.congLineSas',
      values: { b: f(d.b), third: f(dist(B, C)) },
    }
  }

  if (kind === 'asa') {
    const sum = d.alpha + d.beta
    if (sum >= 180) {
      return {
        status: 'none',
        cs: [],
        fit: [scale(dirOf(d.alpha), 6), { x: d.c + 6 * Math.cos(rad(180 - d.beta)), y: 6 * Math.sin(rad(d.beta)) }],
        key: 'trans.congLineAsaNone',
        values: { sum: f(sum) },
      }
    }
    const h = d.c / (cot(d.alpha) + cot(d.beta))
    const C = { x: h * cot(d.alpha), y: h }
    return {
      status: 'one',
      cs: [C],
      fit: [C],
      key: 'trans.congLineAsaOne',
      values: { ga: f(180 - sum) },
    }
  }

  // SSA: the circle around B may cut the arm at A twice, once or never.
  const u = dirOf(d.alpha)
  const proj = d.c * Math.cos(rad(d.alpha))
  const disc = d.a * d.a - d.c * d.c * Math.sin(rad(d.alpha)) ** 2
  const circleFit = [
    { x: d.c - d.a, y: 0 },
    { x: d.c + d.a, y: 0 },
    { x: d.c, y: d.a },
  ]
  const missBy = proj > 0 ? d.c * Math.sin(rad(d.alpha)) : d.c
  if (disc < 0) {
    return {
      status: 'none',
      cs: [],
      fit: [...circleFit, scale(u, d.c)],
      key: 'trans.congLineSsaNone',
      values: { a: f(d.a), h: f(missBy) },
    }
  }
  const root = Math.sqrt(disc)
  const ts = [proj + root, proj - root].filter((v) => v > 1e-6)
  if (ts.length === 0) {
    return {
      status: 'none',
      cs: [],
      fit: [...circleFit, scale(u, d.c)],
      key: 'trans.congLineSsaNone',
      values: { a: f(d.a), h: f(missBy) },
    }
  }
  const cs = ts.map((v) => scale(u, v))
  return {
    status: ts.length === 2 ? 'two' : 'one',
    cs,
    fit: [...circleFit, ...cs],
    key: ts.length === 2 ? 'trans.congLineSsaTwo' : 'trans.congLineSsaOne',
    values: ts.length === 2 ? { b1: f(ts[0]), b2: f(ts[1]) } : { b1: f(ts[0]) },
  }
}

/** The window around everything the figure has to show, never smaller than 6 units. */
function fitWorld(pts: readonly Pt[], pad: number) {
  const xs = pts.map((p) => p.x).filter(Number.isFinite)
  const ys = pts.map((p) => p.y).filter(Number.isFinite)
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const grow = (lo: number, hi: number): [number, number] =>
    hi - lo >= 6 ? [lo, hi] : [(lo + hi) / 2 - 3, (lo + hi) / 2 + 3]
  const [x0, x1] = grow(minX, maxX)
  const [y0, y1] = grow(minY, maxY)
  return { minX: x0, maxX: x1, minY: y0, maxY: y1 }
}

/**
 * Három adat mikor határoz meg egy háromszöget?
 *
 * The card really constructs the triangle rather than drawing a picture of
 * one: two circles for SSS, an arm and a circle for SAS, two arms for ASA. The
 * fourth case is built the same way and that is what gives it away — the
 * circle can cut the arm in two places, so the same three numbers describe two
 * different triangles.
 */
export function TransCongruentCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [kind, setKind] = useState<CaseId>('sss')
  const [dims, setDims] = useState<Dims>(START)
  const [answer, setAnswer] = useState('')

  const B: Pt = { x: dims.c, y: 0 }
  const built = build(kind, dims, sep)
  const world = fitWorld([A, B, ...built.fit], 1.2)
  const arm = scale(dirOf(dims.alpha), 1)

  const colorOf = (i: number) => (i === 0 ? 'var(--series-1)' : 'var(--series-2)')
  const scaffold = 'var(--axis)'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('trans.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="trans.congIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="trans.congDef" />
      </div>

      <div className="pill-row" role="group" aria-label={t('trans.congCaseAria')}>
        {CASES.map((k) => (
          <button
            key={k}
            type="button"
            className={kind === k ? 'pill active' : 'pill'}
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
          >
            {t(`trans.congCase_${k}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        {FIELDS[kind].map((field) => {
          const isAngle = field === 'alpha' || field === 'beta'
          return (
            <label className="field" key={field}>
              <span className="field-label">
                {t(`trans.congField_${field}`)}{' '}
                <strong>
                  {fmt(dims[field], sep)}
                  {isAngle ? '°' : ''}
                </strong>
              </span>
              <input
                type="range"
                min={isAngle ? 20 : 2}
                max={isAngle ? 150 : 9}
                step={isAngle ? 5 : 0.5}
                value={dims[field]}
                onChange={(e) => setDims((old) => ({ ...old, [field]: Number(e.target.value) }))}
              />
            </label>
          )
        })}
      </div>

      <GeoFigure
        world={world}
        height={340}
        ariaLabel={t('trans.congAria', { kind: t(`trans.congCase_${kind}`) })}
        points={[
          { id: 'A', p: A, label: 'A' },
          { id: 'B', p: B, label: 'B' },
          ...built.cs.map((C, i) => ({
            id: `C${i}`,
            p: C,
            label: built.cs.length === 2 ? (i === 0 ? 'C₁' : 'C₂') : 'C',
            color: colorOf(i),
          })),
        ]}
      >
        {(g) => (
          <>
            {g.segment(A, B, { color: scaffold })}
            {g.length(A, B, fmt(dims.c, sep), { color: scaffold, side: -1 })}

            {kind === 'sss' &&
              (built.status === 'none' ? (
                <>
                  {g.circle(A, dims.b, { color: scaffold, dashed: true, muted: true, width: 1.5 })}
                  {g.circle(B, dims.a, { color: scaffold, dashed: true, muted: true, width: 1.5 })}
                </>
              ) : (
                <>
                  {g.arc(A, dims.b, bearing(A, built.cs[0]) - 28, bearing(A, built.cs[0]) + 28, {
                    color: scaffold,
                    dashed: true,
                    muted: true,
                    width: 1.5,
                  })}
                  {g.arc(B, dims.a, bearing(B, built.cs[0]) - 28, bearing(B, built.cs[0]) + 28, {
                    color: scaffold,
                    dashed: true,
                    muted: true,
                    width: 1.5,
                  })}
                </>
              ))}

            {kind === 'sas' && (
              <>
                {g.ray(A, arm, { color: scaffold, dashed: true, muted: true, width: 1.5 })}
                {g.arc(A, dims.b, dims.alpha - 25, dims.alpha + 25, {
                  color: scaffold,
                  dashed: true,
                  muted: true,
                  width: 1.5,
                })}
              </>
            )}

            {kind === 'asa' && (
              <>
                {g.ray(A, arm, { color: scaffold, dashed: true, muted: true, width: 1.5 })}
                {g.ray(B, { x: B.x - Math.cos(rad(dims.beta)), y: Math.sin(rad(dims.beta)) }, {
                  color: scaffold,
                  dashed: true,
                  muted: true,
                  width: 1.5,
                })}
              </>
            )}

            {kind === 'ssa' && (
              <>
                {g.ray(A, arm, { color: scaffold, dashed: true, muted: true, width: 1.5 })}
                {g.circle(B, dims.a, { color: scaffold, dashed: true, muted: true, width: 1.5 })}
              </>
            )}

            {built.cs.map((C, i) => (
              <g key={i}>
                {g.polygon([A, B, C], { color: colorOf(i) })}
                {kind !== 'sss' && g.angle(B, A, C, { label: `${fmt(dims.alpha, sep)}°` })}
              </g>
            ))}
          </>
        )}
      </GeoFigure>

      <p className="lin-result lesson-text">
        <Trans i18nKey={built.key} values={built.values} components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="trans.congNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="trans.congTask"
        isCorrect={answer === ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={ANSWER}
        onReveal={() => setAnswer(ANSWER)}
        hintKey="trans.congHint"
      >
        <div className="pill-row" role="group" aria-label={t('trans.congOptAria')}>
          {CASES.map((k) => (
            <button
              key={k}
              type="button"
              className={answer === k ? 'pill active' : 'pill'}
              aria-pressed={answer === k}
              onClick={() => setAnswer(k)}
            >
              {t(`trans.congOpt_${k}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
