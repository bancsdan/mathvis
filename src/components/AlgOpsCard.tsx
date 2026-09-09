import { useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { divMono, monoFactors, monoTex, mulMono, OPS_ANSWER, powMono, type Monomial } from '../lib/algebra'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

type Mode = 'mul' | 'pow' | 'div'

const MODES: Mode[] = ['mul', 'pow', 'div']

/** Numbers, x's and y's each get their own tint, so regrouping is visible. */
function chipClass(factor: string): string {
  if (factor === 'x') return 'pow-factor alg-x'
  if (factor === 'y') return 'pow-factor alg-y'
  return 'pow-factor'
}

function chips(factors: readonly string[], keyPrefix: string): ReactNode {
  return factors.map((f, i) => (
    <span key={`${keyPrefix}-${i}`} className={chipClass(f)}>
      {f}
    </span>
  ))
}

/** Numbers first, then every x, then every y — the point of the second row. */
function regroup(factors: readonly string[]): string[] {
  return [
    ...factors.filter((f) => f !== 'x' && f !== 'y'),
    ...factors.filter((f) => f === 'x'),
    ...factors.filter((f) => f === 'y'),
  ]
}

/**
 * Műveletek egytagú kifejezésekkel. Nothing here is a new rule: the chips are
 * written out, pushed into their own groups, and counted. The exponents add
 * themselves.
 *
 * Division is shown as a product divided back by one of its own factors, so
 * every quotient on screen is exact without a single validation branch.
 */
export function AlgOpsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('mul')
  const [c1, setC1] = useState(2)
  const [x1, setX1] = useState(2)
  const [y1, setY1] = useState(1)
  const [c2, setC2] = useState(3)
  const [x2, setX2] = useState(1)
  const [y2, setY2] = useState(3)
  const [n, setN] = useState(3)
  const [coef, setCoef] = useState('')
  const [expA, setExpA] = useState('')
  const [expB, setExpB] = useState('')

  const first: Monomial = { coef: c1, x: x1, y: y1 }
  const second: Monomial = { coef: c2, x: x2, y: y2 }
  const product = mulMono(first, second)
  const powered = powMono(first, n)
  const quotient = divMono(product, second) ?? first

  const answerKey = `${coef}|${expA}|${expB}`
  const [solCoef, solA, solB] = OPS_ANSWER.split('|')

  // Row one: the operands written out factor by factor. Row two: the same
  // chips, sorted into their groups — the only thing that ever happens here.
  let firstRow: ReactNode
  let secondRow: ReactNode
  let statement: string
  if (mode === 'mul') {
    firstRow = (
      <>
        {chips(monoFactors(first), 'a')}
        <span className="pow-op">·</span>
        {chips(monoFactors(second), 'b')}
      </>
    )
    secondRow = chips(regroup([...monoFactors(first), ...monoFactors(second)]), 'r')
    statement = `${monoTex(first)} \\cdot ${monoTex(second)} = ${monoTex(product)}`
  } else if (mode === 'pow') {
    firstRow = Array.from({ length: n }, (_, i) => (
      <span key={i} className="pow-factor-row">
        {i > 0 && <span className="pow-op">·</span>}
        {chips(monoFactors(first), `p${i}`)}
      </span>
    ))
    secondRow = chips(
      regroup(Array.from({ length: n }, () => monoFactors(first)).flat()),
      'r',
    )
    statement = `\\left(${monoTex(first)}\\right)^{${n}} = ${monoTex(powered)}`
  } else {
    firstRow = (
      <>
        {chips(monoFactors(product), 'a')}
        <span className="pow-op">:</span>
        {chips(monoFactors(second), 'b')}
      </>
    )
    secondRow = chips(monoFactors(quotient), 'r')
    statement = `${monoTex(product)} : ${monoTex(second)} = ${monoTex(quotient)}`
  }

  const twoOperands = mode !== 'pow'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.opsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.opsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="alg.opsDef" />
      </div>

      <div className="pill-row" role="group" aria-label={t('alg.opsModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`alg.opsMode_${m}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('alg.opsPickC1')} <strong>{c1}</strong>
          </span>
          <input type="range" min={1} max={9} step={1} value={c1} onChange={(e) => setC1(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('alg.opsPickX1')} <strong>{x1}</strong>
          </span>
          <input type="range" min={0} max={3} step={1} value={x1} onChange={(e) => setX1(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('alg.opsPickY1')} <strong>{y1}</strong>
          </span>
          <input type="range" min={0} max={3} step={1} value={y1} onChange={(e) => setY1(Number(e.target.value))} />
        </label>
      </div>

      {twoOperands ? (
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">
              {t('alg.opsPickC2')} <strong>{c2}</strong>
            </span>
            <input type="range" min={1} max={9} step={1} value={c2} onChange={(e) => setC2(Number(e.target.value))} />
          </label>
          <label className="field">
            <span className="field-label">
              {t('alg.opsPickX2')} <strong>{x2}</strong>
            </span>
            <input type="range" min={0} max={3} step={1} value={x2} onChange={(e) => setX2(Number(e.target.value))} />
          </label>
          <label className="field">
            <span className="field-label">
              {t('alg.opsPickY2')} <strong>{y2}</strong>
            </span>
            <input type="range" min={0} max={3} step={1} value={y2} onChange={(e) => setY2(Number(e.target.value))} />
          </label>
        </div>
      ) : (
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">
              {t('alg.opsPickN')} <strong>{n}</strong>
            </span>
            <input type="range" min={2} max={4} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} />
          </label>
        </div>
      )}

      <div className="pow-picture" role="img" aria-label={t(`alg.opsAria_${mode}`)}>
        <div className="pow-factor-row">{firstRow}</div>
        <p className="card-note lesson-text">{t(`alg.opsRegroup_${mode}`)}</p>
        <div className="pow-factor-row">{secondRow}</div>
      </div>

      <Tex block tex={statement} />

      {mode === 'div' && (
        <p className="card-note lesson-text">
          <Trans i18nKey="alg.opsDivNote" components={{ b: <strong />, i: <em /> }} />
        </p>
      )}

      <p className="card-note lesson-text">
        <Trans i18nKey="alg.opsNote1" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="alg.opsNote2" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="alg.opsTask"
        isCorrect={answerKey === OPS_ANSWER}
        canCheck={coef.trim() !== '' && expA.trim() !== '' && expB.trim() !== ''}
        answerKey={answerKey}
        solutionKey={OPS_ANSWER}
        onReveal={() => {
          setCoef(solCoef)
          setExpA(solA)
          setExpB(solB)
        }}
        hintKey="alg.opsHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('alg.opsAnswerCoef')}</span>
            <input className="answer-input" type="number" value={coef} onChange={(e) => setCoef(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('alg.opsAnswerA')}</span>
            <input className="answer-input" type="number" value={expA} onChange={(e) => setExpA(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('alg.opsAnswerB')}</span>
            <input className="answer-input" type="number" value={expB} onChange={(e) => setExpB(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
