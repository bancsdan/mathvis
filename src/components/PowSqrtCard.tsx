import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal, parseDecimal } from '../lib/numbers'
import {
  isPerfectSquare,
  neighbourSquares,
  PERFECT_SQUARES,
  ROOT_SUM_TRAP,
  SQRT_ANSWER,
  sqrtText,
} from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const MAX_AREA = 100
const MARGIN = 16

const trapWhole = Math.sqrt(ROOT_SUM_TRAP.a + ROOT_SUM_TRAP.b)
const trapParts = Math.sqrt(ROOT_SUM_TRAP.a) + Math.sqrt(ROOT_SUM_TRAP.b)

/**
 * Mi a négyzetgyök: the root is the side of a square whose area you set, so a
 * root is a length before it is a button on a calculator — and the sum of two
 * roots is visibly not the root of the sum.
 */
export function PowSqrtCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [area, setArea] = useState(50)
  const [whole, setWhole] = useState('')
  const [parts, setParts] = useState('')

  const exact = isPerfectSquare(area)
  const around = neighbourSquares(area)
  // The side of the picture is proportional to the root, so the area really is
  // the number of unit squares it would hold.
  const box = Math.max(40, Math.min(220, width - 2 * MARGIN))
  const side = (Math.sqrt(area) / Math.sqrt(MAX_AREA)) * box
  const sideLabel = exact ? String(Math.sqrt(area)) : formatDecimal(sqrtText(area, 3), sep, false)

  const answerKey = `${whole}|${parts}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.sqrtIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="pow.sqrtDef">
          <Tex block tex="\sqrt{a} = b \iff b^{2} = a \quad (a \ge 0,\ b \ge 0)" />
        </Definition>
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('pow.sqrtPickArea')} <strong>{area}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={MAX_AREA}
            step={1}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
          />
        </label>
      </div>

      <div ref={ref} className="chart-box">
        {width > 0 && (
          <svg
            width={width}
            height={box + 2 * MARGIN}
            role="img"
            aria-label={t('pow.sqrtAria', { area, side: sideLabel })}
          >
            <rect
              x={MARGIN}
              y={MARGIN + box - side}
              width={side}
              height={side}
              rx={2}
              fill="var(--series-1)"
              fillOpacity={0.25}
              stroke={exact ? 'var(--series-3)' : 'var(--series-1)'}
            />
            {/* KaTeX cannot live inside an SVG, so the labels are plain text. */}
            <text x={MARGIN} y={MARGIN + box + 12} className="line-label" fill="var(--text-secondary)">
              {`√${area} ${exact ? '=' : '≈'} ${sideLabel}`}
            </text>
            <text x={MARGIN + 6} y={MARGIN + box - 6} className="line-label" fill="var(--text-secondary)">
              {`${t('pow.sqrtAreaWord')} ${area}`}
            </text>
          </svg>
        )}
      </div>

      <Tex
        block
        tex={
          exact
            ? `\\sqrt{${area}} = ${Math.sqrt(area)}`
            : `\\sqrt{${area}} \\approx ${formatDecimal(sqrtText(area, 3), sep, true)}`
        }
      />
      <p className="lin-result lesson-text" role="status" aria-live="polite">
        {exact
          ? t('pow.sqrtExactNote', { area, root: Math.sqrt(area) })
          : t('pow.sqrtBetweenNote', {
              area,
              lo: around.lo,
              hi: around.hi,
              loSq: around.lo * around.lo,
              hiSq: around.hi * around.hi,
            })}
      </p>

      <div className="table-wrap">
        <table className="paper-table">
          <tbody>
            <tr>
              <th>{t('pow.sqrtThN')}</th>
              {PERFECT_SQUARES.map((_, i) => (
                <td key={i}>{i + 1}</td>
              ))}
            </tr>
            <tr>
              <th>{t('pow.sqrtThSquare')}</th>
              {PERFECT_SQUARES.map((sq) => (
                <td key={sq}>{sq}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Folded in from the old laws-of-roots section: the one trap of the topic. */}
      <Tex
        block
        tex={`\\sqrt{${ROOT_SUM_TRAP.a} + ${ROOT_SUM_TRAP.b}} = ${trapWhole} \\ne ${trapParts} = \\sqrt{${ROOT_SUM_TRAP.a}} + \\sqrt{${ROOT_SUM_TRAP.b}}`}
      />
      <p className="card-note lesson-text">
        <Trans
          i18nKey="pow.sqrtSumTrap"
          values={{ a: ROOT_SUM_TRAP.a, b: ROOT_SUM_TRAP.b, whole: trapWhole, parts: trapParts }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="pow.sqrtTask"
        promptValues={{ a: ROOT_SUM_TRAP.a, b: ROOT_SUM_TRAP.b }}
        isCorrect={parseDecimal(whole) === SQRT_ANSWER.whole && parseDecimal(parts) === SQRT_ANSWER.parts}
        canCheck={whole.trim() !== '' && parts.trim() !== ''}
        answerKey={answerKey}
        solutionKey={`${SQRT_ANSWER.whole}|${SQRT_ANSWER.parts}`}
        onReveal={() => {
          setWhole(String(SQRT_ANSWER.whole))
          setParts(String(SQRT_ANSWER.parts))
        }}
        hintKey="pow.sqrtHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('pow.sqrtAnswerWhole', { a: ROOT_SUM_TRAP.a, b: ROOT_SUM_TRAP.b })}</span>
            <input
              className="answer-input"
              type="text"
              inputMode="decimal"
              value={whole}
              onChange={(e) => setWhole(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('pow.sqrtAnswerParts', { a: ROOT_SUM_TRAP.a, b: ROOT_SUM_TRAP.b })}</span>
            <input
              className="answer-input"
              type="text"
              inputMode="decimal"
              value={parts}
              onChange={(e) => setParts(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
