import { useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal, LAWS_ANSWER } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

type Mode = 'comm' | 'assoc' | 'distrib'

const MODES: Mode[] = ['comm', 'assoc', 'distrib']
const MARGIN = 24

interface GridProps {
  a: number
  b: number
  c: number
  mode: Mode
  ariaLabel: string
}

/**
 * The law as an area: a rectangle keeps its area when it is turned or cut, and
 * a row of squares keeps its length whichever way it is bracketed.
 */
function LawGrid({ a, b, c, mode, ariaLabel }: GridProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const span = mode === 'distrib' ? a : mode === 'comm' ? a + b + 2 : a + b + c
  const rows = mode === 'distrib' ? b + c : mode === 'comm' ? Math.max(a, b) : 3
  const cell = Math.max(6, Math.min(24, (Math.max(width, 1) - 2 * MARGIN) / span, 190 / rows))
  const height = rows * cell + (mode === 'assoc' ? 46 : 30)
  const top = mode === 'assoc' ? 22 : 16

  const tile = (x: number, y: number, fill: string, key: string) => (
    <rect
      key={key}
      x={MARGIN + x * cell}
      y={top + y * cell}
      width={cell - 1}
      height={cell - 1}
      rx={2}
      fill={fill}
      fillOpacity={0.35}
      stroke={fill}
    />
  )

  const tiles: ReactNode[] = []
  if (mode === 'distrib') {
    for (let y = 0; y < b + c; y++) {
      for (let x = 0; x < a; x++) {
        tiles.push(tile(x, y, y < b ? 'var(--series-1)' : 'var(--series-2)', `${x}-${y}`))
      }
    }
  } else if (mode === 'comm') {
    for (let y = 0; y < b; y++) for (let x = 0; x < a; x++) tiles.push(tile(x, y, 'var(--series-1)', `l${x}-${y}`))
    for (let y = 0; y < a; y++) {
      for (let x = 0; x < b; x++) tiles.push(tile(a + 2 + x, y, 'var(--series-2)', `r${x}-${y}`))
    }
  } else {
    const color = (i: number) => (i < a ? 'var(--series-1)' : i < a + b ? 'var(--series-2)' : 'var(--series-3)')
    for (let x = 0; x < a + b + c; x++) tiles.push(tile(x, 1, color(x), `s${x}`))
  }

  // Two ways of bracketing the same row: (a+b)+c above, a+(b+c) below.
  const bracket = (from: number, to: number, y: number, up: boolean) => {
    const x1 = MARGIN + from * cell
    const x2 = MARGIN + to * cell - 1
    const dy = up ? -5 : 5
    return `M${x1},${y - dy} L${x1},${y} L${x2},${y} L${x2},${y - dy}`
  }

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel}>
          {tiles}
          {mode === 'assoc' && (
            <>
              <path d={bracket(0, a + b, top + cell - 8, true)} fill="none" stroke="var(--series-1)" />
              <path d={bracket(a + b, a + b + c, top + cell - 8, true)} fill="none" stroke="var(--series-3)" />
              <path d={bracket(0, a, top + 2 * cell + 8, false)} fill="none" stroke="var(--series-1)" />
              <path d={bracket(a, a + b + c, top + 2 * cell + 8, false)} fill="none" stroke="var(--series-2)" />
            </>
          )}
        </svg>
      )}
    </div>
  )
}

/**
 * Műveleti azonosságok: what may be swapped, regrouped or split apart, what may
 * not, and what the brackets are for.
 */
export function NumLawsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const [c, setC] = useState(2)
  const [mode, setMode] = useState<Mode>('distrib')
  const [paren, setParen] = useState(false)
  const [answer, setAnswer] = useState('')

  const laws: Record<Mode, string[]> = {
    comm: ['a \\cdot b = b \\cdot a', `${a} \\cdot ${b} = ${b} \\cdot ${a} = ${a * b}`],
    assoc: [
      '(a + b) + c = a + (b + c)',
      `(${a} + ${b}) + ${c} = ${a + b} + ${c} = ${a + b + c}`,
      `${a} + (${b} + ${c}) = ${a} + ${b + c} = ${a + b + c}`,
    ],
    distrib: [
      'a \\cdot (b + c) = a \\cdot b + a \\cdot c',
      `${a} \\cdot (${b} + ${c}) = ${a * b} + ${a * c} = ${a * (b + c)}`,
    ],
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.lawsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.lawsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="num.lawsIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['num.lawsDef1', 'num.lawsDef2', 'num.lawsDef3']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('num.lawsModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`num.lawsMode_${m}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('num.lawsPickA')} <strong>{a}</strong>
          </span>
          <input type="range" min={1} max={9} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('num.lawsPickB')} <strong>{b}</strong>
          </span>
          <input type="range" min={1} max={9} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('num.lawsPickC')} <strong>{c}</strong>
          </span>
          <input type="range" min={1} max={9} step={1} value={c} onChange={(e) => setC(Number(e.target.value))} />
        </label>
      </div>

      <LawGrid a={a} b={b} c={c} mode={mode} ariaLabel={t(`num.lawsAria_${mode}`, { a, b, c })} />

      {laws[mode].map((tex) => (
        <Tex key={tex} block tex={tex} />
      ))}
      <p className="card-note lesson-text">
        <Trans i18nKey={`num.lawsRead_${mode}`} values={{ a, b, c }} components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('num.lawsNotCommTitle')}</p>
      <Tex block tex="5 - 3 = 2 \ne -2 = 3 - 5" />
      <Tex block tex={`8 : 2 = 4 \\ne ${formatDecimal('0.25', sep, true)} = 2 : 8`} />
      <p className="card-note lesson-text">
        <Trans i18nKey="num.lawsNotComm" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('num.lawsParenTitle')}</p>
      <div className="pill-row" role="group" aria-label={t('num.lawsParenAria')}>
        <button
          type="button"
          className={paren ? 'pill' : 'pill active'}
          aria-pressed={!paren}
          onClick={() => setParen(false)}
        >
          {t('num.lawsParenOff')}
        </button>
        <button
          type="button"
          className={paren ? 'pill active' : 'pill'}
          aria-pressed={paren}
          onClick={() => setParen(true)}
        >
          {t('num.lawsParenOn')}
        </button>
      </div>
      <Tex block tex={paren ? '(2 + 3) \\cdot 4 = 5 \\cdot 4 = 20' : '2 + 3 \\cdot 4 = 2 + 12 = 14'} />
      <p className="card-note lesson-text">
        <Trans i18nKey="num.lawsParenNote" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">{t('num.lawsCalcNote')}</p>

      <Exercise
        promptKey="num.lawsTask"
        isCorrect={Number(answer) === LAWS_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(LAWS_ANSWER)}
        onReveal={() => setAnswer(String(LAWS_ANSWER))}
        hintKey="num.lawsHint"
      >
        <label className="field">
          <span className="field-label">{t('num.lawsAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
