import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  eulerPolynomial,
  isPrime,
  PROOF_STEPS,
  PROOF_STEPS_SHUFFLED,
  proofOrderCorrect,
  smallestFactor,
  type ProofStep,
} from '../lib/logic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

/** Enough cases to show the run of forty primes and the first failures after it. */
const CASES = Array.from({ length: 45 }, (_, n) => n)
const CELL_H = 26

/** Strip of cells, one per n, colored by whether n² + n + 41 is prime. */
function EulerStrip({ selected, onSelect }: { selected: number; onSelect: (n: number) => void }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const perRow = Math.max(5, Math.floor(width / 34))
  const rows = Math.ceil(CASES.length / perRow)
  const cell = width / perRow
  const height = rows * CELL_H + 4

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={t('logic.proofStripAria')}>
          {CASES.map((n) => {
            const x = (n % perRow) * cell
            const y = Math.floor(n / perRow) * CELL_H
            const prime = isPrime(eulerPolynomial(n))
            return (
              <g key={n} onClick={() => onSelect(n)} style={{ cursor: 'pointer' }}>
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={cell - 4}
                  height={CELL_H - 4}
                  rx={4}
                  fill={prime ? 'var(--series-3)' : 'var(--critical)'}
                  fillOpacity={selected === n ? 0.6 : 0.22}
                  stroke={selected === n ? 'var(--text-primary)' : 'none'}
                />
                <text x={x + cell / 2} y={y + CELL_H / 2 + 4} textAnchor="middle" className="tick-text">
                  {n}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export function LogicProofCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [n, setN] = useState(0)
  const [order, setOrder] = useState<readonly ProofStep[]>([])

  const value = eulerPolynomial(n)
  const prime = isPrime(value)
  const factor = smallestFactor(value)
  const firstFail = CASES.find((k) => !isPrime(eulerPolynomial(k))) ?? 0

  const remaining = PROOF_STEPS_SHUFFLED.filter((s) => !order.includes(s))

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.proofTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.proofIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="logic.proofDef" />
        <p className="card-note">
          <Trans i18nKey="logic.proofIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <p className="mini-title">{t('logic.proofEulerTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="logic.proofEulerIntro" components={{ b: <strong />, i: <em /> }} />
      </p>
      <Tex block tex="n^2 + n + 41" />

      <EulerStrip selected={n} onSelect={setN} />
      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('logic.proofPickN')}</span>
          <input
            className="count-input"
            type="number"
            min={0}
            max={CASES.length - 1}
            value={n}
            onChange={(e) => setN(Math.min(CASES.length - 1, Math.max(0, Number(e.target.value) || 0)))}
          />
        </label>
      </div>
      <div className="pill-row">
        <button type="button" className="btn" disabled={n === 0} onClick={() => setN(n - 1)}>
          {t('logic.proofPrev')}
        </button>
        <button type="button" className="btn" disabled={n === CASES.length - 1} onClick={() => setN(n + 1)}>
          {t('logic.proofNext')}
        </button>
      </div>
      <Tex block tex={`${n}^2 + ${n} + 41 = ${value}${prime ? '' : ` = ${factor} \\cdot ${value / factor}`}`} />
      <p className={`alias-verdict ${prime ? 'verdict-ok' : 'verdict-bad'}`}>
        {prime
          ? t('logic.proofIsPrime', { n, value })
          : t('logic.proofNotPrime', {
              n,
              value,
              a: factor,
              b: value / factor,
            })}
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="logic.proofEulerMoral" values={{ first: firstFail }} components={{ b: <strong /> }} />
      </p>

      <p className="mini-title">{t('logic.proofCourtTitle')}</p>
      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.proofCourt1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="logic.proofCourt2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <Exercise
        promptKey="logic.proofTask"
        isCorrect={proofOrderCorrect(order)}
        canCheck={order.length === PROOF_STEPS.length}
        answerKey={order.join(',')}
        solutionKey={PROOF_STEPS.join(',')}
        onReveal={() => setOrder(PROOF_STEPS)}
        hintKey="logic.proofHint"
      >
        <Tex block tex="(2k+1) + (2m+1) = 2k + 2m + 2 = 2(k + m + 1)" />
        <p className="card-note">{t('logic.proofPool')}</p>
        <div className="step-list" role="group" aria-label={t('logic.proofPool')}>
          {remaining.map((s) => (
            <button key={s} type="button" className="step-btn" onClick={() => setOrder([...order, s])}>
              {t(`logic.proofStep_${s}`)}
            </button>
          ))}
          {remaining.length === 0 && <p className="card-note">{t('logic.proofPoolEmpty')}</p>}
        </div>
        <p className="card-note">{t('logic.proofOrdered')}</p>
        <ol className="step-list">
          {order.map((s, i) => (
            <li key={s} className="step-row">
              <span className="section-nav-num" aria-hidden="true">
                {i + 1}.
              </span>
              <span>{t(`logic.proofStep_${s}`)}</span>
            </li>
          ))}
        </ol>
        {order.length > 0 && (
          <button type="button" className="btn" onClick={() => setOrder([])}>
            {t('logic.proofReset')}
          </button>
        )}
      </Exercise>
    </section>
  )
}
