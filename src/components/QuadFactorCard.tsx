import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { FACTOR_ANSWER, factorTex, fromRoots, quadTex, quadValue } from '../lib/quadratic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/** −6 to 6 in quarter steps: fine enough that the parabola looks smooth. */
const XS = Array.from({ length: 49 }, (_, i) => -6 + i * 0.25)
const Y_DOMAIN: [number, number] = [-12, 12]

/** A number with the typographic minus prose uses, not the hyphen. */
const signed = (v: number): string => (v < 0 ? `−${Math.abs(v)}` : String(v))

/** `2 · (−3)`: a negative second number wears brackets, the way we write it. */
const pair = (r1: number, r2: number, op: string): string =>
  `${signed(r1)} ${op} ${r2 < 0 ? `(${signed(r2)})` : String(r2)}`

/**
 * Szorzattá alakítás és a gyöktényezős alak.
 *
 * The two sliders are the roots, and everything else on screen follows them:
 * the factored form, the coefficients, and the two places where the curve
 * crosses the axis. Coefficients and roots turn out to be the same two numbers
 * seen from different sides — b is minus their sum, c is their product, which
 * is what makes an equation factorable by looking for two numbers.
 */
export function QuadFactorCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [r1, setR1] = useState(2)
  const [r2, setR2] = useState(3)
  const [ansA, setAnsA] = useState('')
  const [ansB, setAnsB] = useState('')

  const q = fromRoots(r1, r2)
  const values = useMemo(() => XS.map((x) => quadValue(fromRoots(r1, r2), x)), [r1, r2])
  const [solA, solB] = FACTOR_ANSWER.split('|')

  const typed = [ansA, ansB].map(Number)
  const answered = ansA.trim() !== '' && ansB.trim() !== '' && typed.every(Number.isFinite)
  const answerKey = answered ? [...typed].sort((a, b) => a - b).join('|') : `${ansA}|${ansB}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.factorIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="quad.factorDef" />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('quad.factorPickR1')} <strong>{signed(r1)}</strong>
          </span>
          <input type="range" min={-5} max={5} step={1} value={r1} onChange={(e) => setR1(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('quad.factorPickR2')} <strong>{signed(r2)}</strong>
          </span>
          <input type="range" min={-5} max={5} step={1} value={r2} onChange={(e) => setR2(Number(e.target.value))} />
        </label>
      </div>

      <Tex block tex={`${factorTex(r1, r2)} = ${quadTex(q)}`} />

      <LineChart
        xs={XS}
        height={240}
        xLabel="x"
        yLabel="y"
        yDomain={Y_DOMAIN}
        xStep={1}
        series={[{ name: t('quad.factorCurve'), color: 'var(--series-1)', values }]}
      />
      <p className="lin-result lesson-text">
        <Trans
          i18nKey="quad.factorResult"
          values={{
            sum: pair(r1, r2, '+'),
            sumValue: signed(r1 + r2),
            b: signed(q.b),
            prod: pair(r1, r2, '·'),
            prodValue: signed(r1 * r2),
            c: signed(q.c),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="quad.factorRule" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="quad.factorTask"
        isCorrect={answerKey === FACTOR_ANSWER}
        canCheck={answered}
        answerKey={answerKey}
        solutionKey={FACTOR_ANSWER}
        onReveal={() => {
          setAnsA(solA)
          setAnsB(solB)
        }}
        hintKey="quad.factorHint"
      >
        <Tex block tex={`${quadTex({ a: 1, b: -7, c: 12 })} = 0`} />
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('quad.factorAnswer1')}</span>
            <input className="answer-input" type="number" value={ansA} onChange={(e) => setAnsA(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('quad.factorAnswer2')}</span>
            <input className="answer-input" type="number" value={ansB} onChange={(e) => setAnsB(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
