import { useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { intPower, LAW_IDS, LAW_TEX, LAWS_ANSWER, lawInstance, SUM_TRAP, type LawId } from '../lib/powers'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const BASE_CHOICES = [2, 3, 5]
const BASE2_CHOICES = [3, 4, 5]

/** One row of factor chips. `cancel` strikes through the first few. */
function chipRow(label: string, count: number, group: 'g1' | 'g2', key: string, cancel = 0): ReactNode {
  return (
    <span key={key} className="pow-factor-row">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`pow-factor ${group}${i < cancel ? ' cancel' : ''}`}>
          {label}
        </span>
      ))}
    </span>
  )
}

/**
 * Miért adódnak össze a kitevők: each law is drawn as the factors it talks
 * about, so the student counts chips instead of memorising which exponents get
 * added. The picture is the proof, and it works for any m and n.
 */
export function PowLawsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [law, setLaw] = useState<LawId>('product')
  const [base, setBase] = useState(2)
  const [base2, setBase2] = useState(3)
  const [rawM, setRawM] = useState(3)
  const [n, setN] = useState(2)
  const [answer, setAnswer] = useState('')

  // A quotient of powers only stays a whole power while m > n, so the two
  // sliders are clamped against each other rather than allowed to disagree.
  const m = law === 'quotient' ? Math.max(rawM, n + 1) : rawM
  const instance = lawInstance(law, base, m, n, base2)
  const total = instance.groups.reduce((sum, g) => sum + g.count, 0)
  const twoBases = law === 'productBase' || law === 'quotientBase'
  // A quotient of different bases rarely lands on a whole number, so it is
  // shown as the fraction it is rather than as a run of decimals.
  const valueTex =
    law === 'quotientBase'
      ? `\\frac{${intPower(base, n)}}{${intPower(base2, n)}}`
      : String(instance.value)

  let picture: ReactNode
  if (law === 'product') {
    picture = (
      <span className="pow-factor-row">
        {chipRow(String(base), m, 'g1', 'a')}
        <span className="pow-op">·</span>
        {chipRow(String(base), n, 'g2', 'b')}
      </span>
    )
  } else if (law === 'quotient') {
    picture = (
      <>
        {chipRow(String(base), m, 'g1', 'top', n)}
        <div className="pow-frac-bar" />
        {chipRow(String(base), n, 'g2', 'bottom', n)}
      </>
    )
  } else if (law === 'power') {
    picture = <>{instance.groups.map((g, i) => chipRow(g.label, g.count, i % 2 === 0 ? 'g1' : 'g2', `r${i}`))}</>
  } else {
    const pairs = (
      <span className="pow-factor-row">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className="pow-factor-row">
            <span className="pow-factor g1">{base}</span>
            <span className="pow-factor g2">{base2}</span>
            <span className="pow-gap" />
          </span>
        ))}
      </span>
    )
    const regrouped =
      law === 'productBase' ? (
        <span className="pow-factor-row">
          {chipRow(String(base), n, 'g1', 'a')}
          <span className="pow-op">·</span>
          {chipRow(String(base2), n, 'g2', 'b')}
        </span>
      ) : (
        <>
          {chipRow(String(base), n, 'g1', 'a')}
          <div className="pow-frac-bar" />
          {chipRow(String(base2), n, 'g2', 'b')}
        </>
      )
    picture = (
      <>
        {pairs}
        <p className="card-note lesson-text">{t('pow.lawsRegroup')}</p>
        {regrouped}
      </>
    )
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.lawsIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('pow.lawsModeAria')}>
        {LAW_IDS.map((lid) => (
          <button
            key={lid}
            type="button"
            className={law === lid ? 'pill active' : 'pill'}
            aria-pressed={law === lid}
            onClick={() => setLaw(lid)}
          >
            {t(`pow.lawsMode_${lid}`)}
          </button>
        ))}
      </div>

      <span className="field-label">{t('pow.lawsPickBase')}</span>
      <div className="pill-row" role="group" aria-label={t('pow.lawsPickBase')}>
        {BASE_CHOICES.map((b) => (
          <button
            key={b}
            type="button"
            className={base === b ? 'pill active' : 'pill'}
            aria-pressed={base === b}
            onClick={() => setBase(b)}
          >
            {b}
          </button>
        ))}
      </div>
      {twoBases && (
        <>
          <span className="field-label">{t('pow.lawsPickBase2')}</span>
          <div className="pill-row" role="group" aria-label={t('pow.lawsPickBase2')}>
            {BASE2_CHOICES.map((b) => (
              <button
                key={b}
                type="button"
                className={base2 === b ? 'pill active' : 'pill'}
                aria-pressed={base2 === b}
                onClick={() => setBase2(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="controls-inline">
        {!twoBases && (
          <label className="field">
            <span className="field-label">
              {t('pow.lawsPickM')} <strong>{m}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={m}
              onChange={(e) => setRawM(Number(e.target.value))}
            />
          </label>
        )}
        <label className="field">
          <span className="field-label">
            {t('pow.lawsPickN')} <strong>{n}</strong>
          </span>
          <input type="range" min={1} max={5} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
      </div>

      <div className="pow-picture" role="img" aria-label={t('pow.lawsPictureAria', { total })}>
        {picture}
      </div>

      <Tex block tex={`${instance.leftTex} = ${instance.rightTex} = ${valueTex}`} />
      <Tex block tex={LAW_TEX[law]} />
      <p className="lin-result lesson-text">
        <Trans i18nKey={`pow.lawsResult_${law}`} components={{ b: <strong />, i: <em /> }} />
      </p>

      <Tex
        block
        tex={`(${SUM_TRAP.a} + ${SUM_TRAP.b})^{2} = ${intPower(SUM_TRAP.a + SUM_TRAP.b, 2)} \\ne ${intPower(SUM_TRAP.a, 2) + intPower(SUM_TRAP.b, 2)} = ${SUM_TRAP.a}^{2} + ${SUM_TRAP.b}^{2}`}
      />
      <p className="card-note lesson-text">
        <Trans
          i18nKey="pow.lawsTrap"
          values={{
            a: SUM_TRAP.a,
            b: SUM_TRAP.b,
            whole: intPower(SUM_TRAP.a + SUM_TRAP.b, 2),
            parts: intPower(SUM_TRAP.a, 2) + intPower(SUM_TRAP.b, 2),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="pow.lawsTask"
        isCorrect={Number(answer) === LAWS_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(LAWS_ANSWER)}
        onReveal={() => setAnswer(String(LAWS_ANSWER))}
        hintKey="pow.lawsHint"
      >
        <label className="field">
          <span className="field-label">{t('pow.lawsAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
