import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal, parseDecimal } from '../lib/numbers'
import {
  isPerfectSquare,
  neighbourSquares,
  PERFECT_SQUARES,
  SQRT_ANSWER,
  sqrtText,
} from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const MAX_AREA = 100
const MARGIN = 16

/**
 * A négyzetgyök. The root is the side of a square whose area you set, so a
 * root is a length before it is a button on a calculator.
 */
export function PowSqrtCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [area, setArea] = useState(49)
  const [typed, setTyped] = useState('2')
  const [answer, setAnswer] = useState('')

  const exact = isPerfectSquare(area)
  const around = neighbourSquares(area)
  // The side of the picture is proportional to the root, so the area really is
  // the number of unit squares it would hold.
  const box = Math.max(40, Math.min(220, width - 2 * MARGIN))
  const side = (Math.sqrt(area) / Math.sqrt(MAX_AREA)) * box
  const sideLabel = exact ? String(Math.sqrt(area)) : formatDecimal(sqrtText(area, 3), sep, false)

  const given = parseDecimal(typed)
  const valid = given !== null && given >= 0
  const calcAround = valid ? neighbourSquares(given) : null

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.sqrtTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.sqrtIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="pow.sqrtDef">
          <Tex block tex="\sqrt{a} = b \iff b^{2} = a \quad (a \ge 0,\ b \ge 0)" />
        </Definition>
        <p className="card-note">
          <Trans i18nKey="pow.sqrtIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
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
      <p className="alias-verdict" role="status" aria-live="polite">
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

      <p className="mini-title">{t('pow.sqrtTableTitle')}</p>
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

      <p className="mini-title">{t('pow.sqrtCalcTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sqrtCalcIntro" components={{ b: <strong />, i: <em /> }} />
      </p>
      <label className="field field-wide">
        <span className="field-label">{t('pow.sqrtCalcLabel')}</span>
        <input
          type="text"
          inputMode="decimal"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
      </label>
      {valid && calcAround ? (
        <>
          <Tex block tex={`\\sqrt{${formatDecimal(String(given), sep, true)}} \\approx ${formatDecimal(sqrtText(given, 4), sep, true)}`} />
          <p className="card-note lesson-text">
            {isPerfectSquare(given)
              ? t('pow.sqrtExactNote', { area: given, root: Math.sqrt(given) })
              : t('pow.sqrtBetweenNote', {
                  area: formatDecimal(String(given), sep, false),
                  lo: calcAround.lo,
                  hi: calcAround.hi,
                  loSq: calcAround.lo * calcAround.lo,
                  hiSq: calcAround.hi * calcAround.hi,
                })}
          </p>
        </>
      ) : (
        <p className="card-note lesson-text">{t('pow.sqrtCalcBad')}</p>
      )}
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sqrtCalcNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sqrtTrap1" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sqrtTrap2" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="pow.sqrtTask"
        isCorrect={parseDecimal(answer) === SQRT_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(SQRT_ANSWER)}
        onReveal={() => setAnswer(String(SQRT_ANSWER))}
        hintKey="pow.sqrtHint"
      >
        <label className="field">
          <span className="field-label">{t('pow.sqrtAnswerLabel')}</span>
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
