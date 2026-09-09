import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { diffParts, DIFF_ANSWER, mentalProduct, NEAR_TENS, oddSquareMinusOne } from '../lib/algebra'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const PAD = { left: 24, top: 20, right: 10, bottom: 10 }

/**
 * Két négyzet különbsége. The L left over after a corner is cut off is the same
 * area whether it is bent or straightened, and straightening it turns a² − b²
 * into a rectangle whose sides are a + b and a − b. That is the whole proof.
 */
export function AlgDiffCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const [a, setA] = useState(5)
  const [rawB, setRawB] = useState(2)
  const [moved, setMoved] = useState(false)
  const [m, setM] = useState(100)
  const [d, setD] = useState(1)
  const [half, setHalf] = useState(5)
  const [answer, setAnswer] = useState('')

  // The cut corner has to fit inside the square, and something has to be left.
  const b = Math.min(rawB, a - 1)
  const parts = diffParts(a, b)
  const rest = a - b

  const span = moved ? a + b : a
  const rows = moved ? rest : a
  const unit = Math.max(6, Math.min(24, (width - PAD.left - PAD.right) / span, 250 / Math.max(rows, 1)))
  const height = rows * unit + PAD.top + PAD.bottom
  const px = (u: number) => PAD.left + u * unit
  const py = (u: number) => PAD.top + u * unit

  // Before: the top block and the strip beside the missing corner. After: the
  // very same two pieces, laid end to end.
  const block = { x: 0, y: 0, w: a, h: rest }
  const strip = moved ? { x: a, y: 0, w: b, h: rest } : { x: 0, y: rest, w: rest, h: b }

  const product = mentalProduct(m, d)
  const odd = oddSquareMinusOne(2 * half + 1)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.diffTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.diffIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="alg.diffRule" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>
      <Tex block tex="(a + b)(a - b) = a^2 - b^2" />
      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.diffIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('alg.diffPickA')} <strong>{a}</strong>
          </span>
          <input type="range" min={3} max={9} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('alg.diffPickB')} <strong>{b}</strong>
          </span>
          <input type="range" min={1} max={8} step={1} value={b} onChange={(e) => setRawB(Number(e.target.value))} />
        </label>
      </div>

      <div ref={ref} className="chart-box">
        {width > 0 && (
          <svg
            className="alg-area"
            width={width}
            height={height}
            role="img"
            aria-label={t(moved ? 'alg.diffAriaAfter' : 'alg.diffAriaBefore', { a, b })}
          >
            <rect
              className="alg-region"
              x={px(block.x)}
              y={py(block.y)}
              width={block.w * unit}
              height={block.h * unit}
              fill="var(--series-1)"
            />
            <text
              className="alg-label"
              x={px(block.x + block.w / 2)}
              y={py(block.y + block.h / 2) + 4}
              textAnchor="middle"
            >
              {a * rest}
            </text>
            <rect
              className="alg-region"
              x={px(strip.x)}
              y={py(strip.y)}
              width={strip.w * unit}
              height={strip.h * unit}
              fill="var(--series-2)"
            />
            <text
              className="alg-label"
              x={px(strip.x + strip.w / 2)}
              y={py(strip.y + strip.h / 2) + 4}
              textAnchor="middle"
            >
              {rest * b}
            </text>
            {!moved && (
              <rect
                className="alg-missing"
                x={px(rest)}
                y={py(rest)}
                width={b * unit}
                height={b * unit}
              />
            )}
          </svg>
        )}
      </div>

      <div className="pill-row">
        <button type="button" className="btn" aria-pressed={moved} onClick={() => setMoved(!moved)}>
          {moved ? t('alg.diffUndo') : t('alg.diffRearrange')}
        </button>
      </div>

      <Tex
        block
        tex={`(${a} + ${b})(${a} - ${b}) = ${a}^2 - ${b}^2 = ${parts.a2} - ${parts.b2} = ${parts.value}`}
      />
      <p className="card-note lesson-text">
        <Trans
          i18nKey="alg.diffRead"
          values={{ width: parts.width, height: parts.height, value: parts.value }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="mini-title">{t('alg.diffMentalTitle')}</p>
      <div className="pill-row" role="group" aria-label={t('alg.diffPickM')}>
        {NEAR_TENS.map((ten) => (
          <button
            key={ten}
            type="button"
            className={m === ten ? 'pill active' : 'pill'}
            aria-pressed={m === ten}
            onClick={() => setM(ten)}
          >
            {ten}
          </button>
        ))}
      </div>
      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('alg.diffPickD')} <strong>{d}</strong>
          </span>
          <input type="range" min={1} max={5} step={1} value={d} onChange={(e) => setD(Number(e.target.value))} />
        </label>
      </div>
      <Tex
        block
        tex={`${product.lo} \\cdot ${product.hi} = (${m} - ${d})(${m} + ${d}) = ${m}^2 - ${d}^2 = ${product.mSq} - ${product.dSq} = ${product.value}`}
      />

      <p className="mini-title">{t('alg.diffDivTitle')}</p>
      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.diffIntro3" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>
      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('alg.diffPickN')} <strong>{2 * half + 1}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={half}
            onChange={(e) => setHalf(Number(e.target.value))}
          />
        </label>
      </div>
      <Tex
        block
        tex={`${2 * half + 1}^2 - 1 = ${odd.lo} \\cdot ${odd.hi} = ${odd.product} = 8 \\cdot ${odd.eighth}`}
      />

      <Exercise
        promptKey="alg.diffTask"
        isCorrect={Number(answer) === DIFF_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(DIFF_ANSWER)}
        onReveal={() => setAnswer(String(DIFF_ANSWER))}
        hintKey="alg.diffHint"
      >
        <label className="field">
          <span className="field-label">{t('alg.diffAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
