import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { gcd } from '../lib/numbers'
import { LADDER_BASES, ladder, NEG_ANSWER, type Fraction } from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** `\frac{1}{8}` for a real fraction, plain digits for a whole number. */
const fractionTex = (f: Fraction): string => (f.q === 1 ? String(f.p) : `\\frac{${f.p}}{${f.q}}`)

/**
 * Nulla és negatív kitevő. Neither is decreed: the ladder walks the exponents
 * down past 0 and the values are simply whatever the pattern already forces.
 */
export function PowNegCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [base, setBase] = useState(LADDER_BASES[0])
  const [p, setP] = useState('')
  const [q, setQ] = useState('')

  const rows = ladder(base, 5, -4)
  const givenP = Number(p)
  const givenQ = Number(q)
  const reduced =
    Number.isInteger(givenP) && Number.isInteger(givenQ) && givenQ > 0
      ? { p: givenP / (gcd(givenP, givenQ) || 1), q: givenQ / (gcd(givenP, givenQ) || 1) }
      : null
  const answerKey = `${p}|${q}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.negTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.negIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="pow.negIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['pow.negDef1', 'pow.negDef2']}>
          <Tex block tex="a^{0} = 1 \qquad a^{-n} = \frac{1}{a^{n}}" />
        </Definition>
      </div>

      <div className="pill-row" role="group" aria-label={t('pow.negPickBase')}>
        {LADDER_BASES.map((b) => (
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

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('pow.negThExp')}</th>
              <th>{t('pow.negThValue')}</th>
              <th>{t('pow.negThStep')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.exp} className={row.exp <= 0 ? 'row-ok' : undefined}>
                <td>
                  <Tex tex={`${base}^{${row.exp}}`} />
                </td>
                <td>
                  <Tex tex={fractionTex(row.value)} />
                </td>
                <td>{i === 0 ? '' : t('pow.negStepDown', { base })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="alias-verdict">
        <Trans i18nKey="pow.negZeroNote" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.negTenNote" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.negUndefNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="pow.negTask"
        isCorrect={reduced !== null && reduced.p === NEG_ANSWER.p && reduced.q === NEG_ANSWER.q}
        canCheck={p.trim() !== '' && q.trim() !== ''}
        answerKey={answerKey}
        solutionKey={`${NEG_ANSWER.p}|${NEG_ANSWER.q}`}
        onReveal={() => {
          setP(String(NEG_ANSWER.p))
          setQ(String(NEG_ANSWER.q))
        }}
        hintKey="pow.negHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('pow.negAnswerP')}</span>
            <input className="answer-input" type="number" value={p} onChange={(e) => setP(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('pow.negAnswerQ')}</span>
            <input className="answer-input" type="number" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
