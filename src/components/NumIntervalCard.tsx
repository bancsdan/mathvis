import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  formatDecimal,
  INTERVAL_ANSWER,
  INTERVAL_OPTIONS,
  INTERVAL_QUIZ,
  intervalContains,
  intervalNotation,
  intervalSetBuilder,
} from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { NumberLine } from './NumberLine'
import { Tex } from './Tex'

const MIN = -5
const MAX = 5

/** Why a test value is in or out, so the endpoints stop being a memory game. */
function reasonKey(lo: number, hi: number, leftClosed: boolean, rightClosed: boolean, x: number): string {
  if (x === lo) return leftClosed ? 'num.intWhyLeftClosed' : 'num.intWhyLeftOpen'
  if (x === hi) return rightClosed ? 'num.intWhyRightClosed' : 'num.intWhyRightOpen'
  if (x < lo) return 'num.intWhyBelow'
  if (x > hi) return 'num.intWhyAbove'
  return 'num.intWhyInside'
}

/**
 * Benne van a végpont: which numbers a stretch of the line takes with it, the
 * two ways of writing that down, and a test value checked against both ends.
 */
export function NumIntervalCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const style = t('num.intervalStyle') === 'hu' ? 'hu' : 'en'
  const [a, setA] = useState(-1)
  const [b, setB] = useState(3)
  const [leftClosed, setLeftClosed] = useState(false)
  const [rightClosed, setRightClosed] = useState(true)
  const [answer, setAnswer] = useState('')

  // The reader may drag the ends past each other; the interval simply turns
  // around rather than becoming empty.
  const lo = Math.min(a, b)
  const hi = Math.max(a, b) === lo ? Math.min(lo + 0.5, MAX) : Math.max(a, b)

  const plain = (v: number) => formatDecimal(String(v), sep, false)
  // Braced, so KaTeX reads the minus of a bound as a sign and not as a
  // subtraction between the bracket and the number.
  const texNum = (v: number) => `{${formatDecimal(String(v), sep, true)}}`

  const notation = intervalNotation(lo, hi, leftClosed, rightClosed, style, texNum)
  const tests = [...new Set([lo, hi, (lo + hi) / 2, Math.max(lo - 1, MIN), Math.min(hi + 1, MAX)])].sort(
    (x, y) => x - y,
  )
  const resultKey = `num.intervalResult_${leftClosed ? 'c' : 'o'}${rightClosed ? 'c' : 'o'}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.intervalIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['num.intervalDef1', 'num.intervalDef2']} />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('num.intervalPickA')}</span>
          <input
            type="number"
            min={MIN}
            max={MAX}
            step={0.5}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">{t('num.intervalPickB')}</span>
          <input
            type="number"
            min={MIN}
            max={MAX}
            step={0.5}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="pill-row" role="group" aria-label={t('num.intervalLeftAria')}>
        <span className="field-label">{t('num.intervalLeftAria')}</span>
        <button
          type="button"
          className={leftClosed ? 'pill active' : 'pill'}
          aria-pressed={leftClosed}
          onClick={() => setLeftClosed(true)}
        >
          {t('num.intervalClosed')}
        </button>
        <button
          type="button"
          className={leftClosed ? 'pill' : 'pill active'}
          aria-pressed={!leftClosed}
          onClick={() => setLeftClosed(false)}
        >
          {t('num.intervalOpen')}
        </button>
      </div>
      <div className="pill-row" role="group" aria-label={t('num.intervalRightAria')}>
        <span className="field-label">{t('num.intervalRightAria')}</span>
        <button
          type="button"
          className={rightClosed ? 'pill active' : 'pill'}
          aria-pressed={rightClosed}
          onClick={() => setRightClosed(true)}
        >
          {t('num.intervalClosed')}
        </button>
        <button
          type="button"
          className={rightClosed ? 'pill' : 'pill active'}
          aria-pressed={!rightClosed}
          onClick={() => setRightClosed(false)}
        >
          {t('num.intervalOpen')}
        </button>
      </div>

      <NumberLine
        min={MIN}
        max={MAX}
        height={86}
        tickText={(v) => plain(v)}
        segments={[{ from: lo, to: hi, leftClosed, rightClosed, color: 'var(--series-1)' }]}
        ariaLabel={t('num.intervalAria', {
          from: plain(lo),
          to: plain(hi),
          left: leftClosed ? t('num.intervalClosed') : t('num.intervalOpen'),
          right: rightClosed ? t('num.intervalClosed') : t('num.intervalOpen'),
        })}
      />

      <Tex block tex={notation} />
      <Tex
        block
        tex={`\\{\\, x \\in \\mathbb{R} \\mid ${intervalSetBuilder(lo, hi, leftClosed, rightClosed, texNum)} \\,\\}`}
      />

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('num.intervalThValue')}</th>
              <th>{t('num.intervalThVerdict')}</th>
              <th>{t('num.intervalThWhy')}</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((x) => {
              const inside = intervalContains(lo, hi, leftClosed, rightClosed, x)
              return (
                <tr key={x} className={inside ? 'row-ok' : undefined}>
                  <td>{plain(x)}</td>
                  <td>{inside ? t('num.intervalIn') : t('num.intervalOut')}</td>
                  <td>{t(reasonKey(lo, hi, leftClosed, rightClosed, x))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="lin-result lesson-text">{t(resultKey)}</p>

      <p className="card-note lesson-text">
        <Trans i18nKey="num.intervalOtherNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="num.intervalTask"
        isCorrect={answer === INTERVAL_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={INTERVAL_ANSWER}
        onReveal={() => setAnswer(INTERVAL_ANSWER)}
        hintKey="num.intervalHint"
      >
        <Tex
          block
          tex={intervalSetBuilder(
            INTERVAL_QUIZ.a,
            INTERVAL_QUIZ.b,
            INTERVAL_QUIZ.leftClosed,
            INTERVAL_QUIZ.rightClosed,
            texNum,
          )}
        />
        <div className="pill-row" role="group" aria-label={t('num.intervalOptionsAria')}>
          {INTERVAL_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={answer === o.id ? 'pill active' : 'pill'}
              aria-pressed={answer === o.id}
              onClick={() => setAnswer(o.id)}
            >
              <Tex
                tex={intervalNotation(INTERVAL_QUIZ.a, INTERVAL_QUIZ.b, o.leftClosed, o.rightClosed, style, texNum)}
              />
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
