import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { mentalSquare, SQUARE_ANSWER, squareParts } from '../lib/algebra'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

type Part = 'a2' | 'ab' | 'b2' | 'all'

const PARTS: Part[] = ['a2', 'ab', 'b2', 'all']
const PAD = { left: 24, top: 20, right: 10, bottom: 10 }

interface Region {
  x: number
  y: number
  w: number
  h: number
  series: 1 | 2 | 3
  label: string
  /** Which of the four buttons light this piece up. */
  parts: readonly Part[]
}

/**
 * Nevezetes azonosságok: (a + b)² and (a − b)².
 *
 * The square is cut once and the pieces are named, so the 2ab in the middle is
 * something the reader counts rather than memorises — and so is the b² that
 * comes back in the subtraction case, having been cut away twice.
 */
export function AlgSquareCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const [sign, setSign] = useState<1 | -1>(1)
  const [a, setA] = useState(5)
  const [rawB, setRawB] = useState(2)
  const [lit, setLit] = useState<Part | null>(null)
  const [n, setN] = useState(47)
  const [answer, setAnswer] = useState('')

  // A subtracted strip cannot be wider than the square it comes off.
  const b = sign === -1 ? Math.min(rawB, a - 1) : rawB
  const parts = squareParts(a, b, sign)
  const rest = a - b

  const regions: Region[] =
    sign === 1
      ? [
          { x: 0, y: 0, w: a, h: a, series: 1, label: String(parts.a2), parts: ['a2', 'all'] },
          { x: a, y: 0, w: b, h: a, series: 2, label: String(parts.ab), parts: ['ab', 'all'] },
          { x: 0, y: a, w: a, h: b, series: 2, label: String(parts.ab), parts: ['ab', 'all'] },
          { x: a, y: a, w: b, h: b, series: 3, label: String(parts.b2), parts: ['b2', 'all'] },
        ]
      : [
          { x: 0, y: 0, w: rest, h: rest, series: 1, label: String(parts.total), parts: ['a2', 'all'] },
          { x: rest, y: 0, w: b, h: rest, series: 2, label: String(b * rest), parts: ['a2', 'ab', 'all'] },
          { x: 0, y: rest, w: rest, h: b, series: 2, label: String(b * rest), parts: ['a2', 'ab', 'all'] },
          { x: rest, y: rest, w: b, h: b, series: 3, label: String(parts.b2), parts: ['a2', 'ab', 'b2', 'all'] },
        ]

  const span = sign === 1 ? a + b : a
  const unit = Math.max(6, Math.min(24, (width - PAD.left - PAD.right) / span, 250 / span))
  const height = span * unit + PAD.top + PAD.bottom
  const px = (u: number) => PAD.left + u * unit
  const py = (u: number) => PAD.top + u * unit
  const edges = sign === 1 ? [{ at: 0, len: a }, { at: a, len: b }] : [{ at: 0, len: rest }, { at: rest, len: b }]

  const signTex = sign === 1 ? '+' : '-'
  const identityTex = `(a ${signTex} b)^2 = a^2 ${signTex} 2ab + b^2`
  const numbersTex = `(${a} ${signTex} ${b})^2 = ${a}^2 ${signTex} 2 \\cdot ${a} \\cdot ${b} + ${b}^2 = ${parts.a2} ${signTex} ${2 * parts.ab} + ${parts.b2} = ${parts.total}`

  const m = mentalSquare(n)
  const mSign = m.d < 0 ? '-' : '+'
  const mentalTex = `${n}^2 = (${m.ten} ${mSign} ${Math.abs(m.d)})^2 = ${m.tenSq} ${mSign} ${Math.abs(m.cross)} + ${m.dSq} = ${m.value}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.squareIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="alg.squareDef" />
      </div>

      <div className="pill-row" role="group" aria-label={t('alg.squareModeAria')}>
        <button
          type="button"
          className={sign === 1 ? 'pill active' : 'pill'}
          aria-pressed={sign === 1}
          onClick={() => setSign(1)}
        >
          {t('alg.squareModePlus')}
        </button>
        <button
          type="button"
          className={sign === -1 ? 'pill active' : 'pill'}
          aria-pressed={sign === -1}
          onClick={() => setSign(-1)}
        >
          {t('alg.squareModeMinus')}
        </button>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('alg.squarePickA')} <strong>{a}</strong>
          </span>
          <input type="range" min={2} max={9} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('alg.squarePickB')} <strong>{b}</strong>
          </span>
          <input type="range" min={1} max={5} step={1} value={b} onChange={(e) => setRawB(Number(e.target.value))} />
        </label>
      </div>

      <div ref={ref} className="chart-box">
        {width > 0 && (
          <svg
            className="alg-area"
            width={width}
            height={height}
            role="img"
            aria-label={t(sign === 1 ? 'alg.squareAriaPlus' : 'alg.squareAriaMinus', { a, b })}
          >
            {regions.map((r) => (
              <g key={`${r.x}-${r.y}`}>
                <rect
                  className={lit && r.parts.includes(lit) ? 'alg-region lit' : 'alg-region'}
                  x={px(r.x)}
                  y={py(r.y)}
                  width={r.w * unit}
                  height={r.h * unit}
                  fill={`var(--series-${r.series})`}
                />
                <text className="alg-label" x={px(r.x + r.w / 2)} y={py(r.y + r.h / 2) + 4} textAnchor="middle">
                  {r.label}
                </text>
              </g>
            ))}
            {edges.map((e) => (
              <g key={`e${e.at}`}>
                <text className="alg-label" x={px(e.at + e.len / 2)} y={PAD.top - 6} textAnchor="middle">
                  {e.len}
                </text>
                <text className="alg-label" x={PAD.left - 8} y={py(e.at + e.len / 2) + 4} textAnchor="end">
                  {e.len}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>

      {/* The picture is hidden from assistive technology, so the same four
          choices are ordinary buttons underneath it. */}
      <div className="pill-row" role="group" aria-label={t('alg.squarePartAria')}>
        {PARTS.map((p) => (
          <button
            key={p}
            type="button"
            className={lit === p ? 'pill active' : 'pill'}
            aria-pressed={lit === p}
            onClick={() => setLit(lit === p ? null : p)}
          >
            {t(`alg.squarePart_${p}`)}
          </button>
        ))}
      </div>

      <Tex block tex={identityTex} />
      <Tex block tex={numbersTex} />
      <p className="lin-result lesson-text">
        <Trans
          i18nKey={sign === 1 ? 'alg.squareReadPlus' : 'alg.squareReadMinus'}
          values={{ a, b, rest }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="mini-title">{t('alg.squareMentalTitle')}</p>
      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('alg.squareMentalPick')} <strong>{n}</strong>
          </span>
          <input type="range" min={11} max={99} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
      </div>
      <Tex block tex={mentalTex} />
      <p className="card-note lesson-text">
        <Trans i18nKey="alg.squareMentalNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="alg.squareTask"
        isCorrect={Number(answer) === SQUARE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(SQUARE_ANSWER)}
        onReveal={() => setAnswer(String(SQUARE_ANSWER))}
        hintKey="alg.squareHint"
      >
        <label className="field">
          <span className="field-label">{t('alg.squareAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
