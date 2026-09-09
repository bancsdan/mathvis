import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  divideSci,
  LIFE_SECONDS,
  multiplySci,
  SCI_CLAIMS,
  SCI_CLAIMS_ANSWER,
  sciTex,
  toNormalForm,
  type Sci,
} from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** The mantissa sliders run in tenths, so no float ever has to be stepped. */
const tenths = (v: number): string => (v / 10).toFixed(1)

/**
 * Számolás normálalakkal. Multiplying two normal forms is shown as the two
 * separate jobs it really is — mantissas one way, exponents the other — with
 * the renormalising step kept visible instead of folded into the answer.
 */
export function PowSciCalcCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [m1, setM1] = useState(25)
  const [e1, setE1] = useState(4)
  const [m2, setM2] = useState(80)
  const [e2, setE2] = useState(3)
  const [op, setOp] = useState<'mul' | 'div'>('mul')
  const [verdicts, setVerdicts] = useState<Record<string, string>>({})
  const [showTrue, setShowTrue] = useState(false)

  const a: Sci = { mantissa: tenths(m1), exponent: e1 }
  const b: Sci = { mantissa: tenths(m2), exponent: e2 }
  const { raw, result } = op === 'mul' ? multiplySci(a, b) : divideSci(a, b)
  const opTex = op === 'mul' ? '\\cdot' : ':'
  const alreadyNormal = raw.mantissa === result.mantissa && raw.exponent === result.exponent

  const life = multiplySci(toNormalForm(String(LIFE_SECONDS.years)), LIFE_SECONDS.secondsPerYear)
  const answerKey = SCI_CLAIMS.map((c) => verdicts[c.id] ?? '').join('|')

  /** `7 \cdot 10^{-5}\ \text{m}` — one claim's number, with its unit. */
  const claimTex = (mantissa: string, exponent: number, id2: string, unit: string): string =>
    `${sciTex({ mantissa, exponent }, sep)}\\ \\text{${unit || t(`pow.sciUnitWord_${id2}`)}}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.sciCalcTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.sciCalcIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>
      <Tex
        block
        tex={`${LIFE_SECONDS.years} \\cdot ${sciTex(LIFE_SECONDS.secondsPerYear, sep)} \\approx ${sciTex(life.result, sep)}`}
      />
      <div className="lesson-text">
        <Definition i18nKey={['pow.sciCalcDef1', 'pow.sciCalcDef2']}>
          <Tex
            block
            tex="\left(a \cdot 10^{k}\right) \cdot \left(b \cdot 10^{l}\right) = (a \cdot b) \cdot 10^{k+l}"
          />
        </Definition>
        <p className="card-note">
          <Trans i18nKey="pow.sciCalcIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('pow.sciCalcOpAria')}>
        <button
          type="button"
          className={op === 'mul' ? 'pill active' : 'pill'}
          aria-pressed={op === 'mul'}
          onClick={() => setOp('mul')}
        >
          {t('pow.sciCalcOpMul')}
        </button>
        <button
          type="button"
          className={op === 'div' ? 'pill active' : 'pill'}
          aria-pressed={op === 'div'}
          onClick={() => setOp('div')}
        >
          {t('pow.sciCalcOpDiv')}
        </button>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('pow.sciCalcPickM1')} <strong>{a.mantissa.replace('.', sep)}</strong>
          </span>
          <input type="range" min={10} max={99} step={1} value={m1} onChange={(e) => setM1(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('pow.sciCalcPickE1')} <strong>{e1}</strong>
          </span>
          <input type="range" min={-6} max={12} step={1} value={e1} onChange={(e) => setE1(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('pow.sciCalcPickM2')} <strong>{b.mantissa.replace('.', sep)}</strong>
          </span>
          <input type="range" min={10} max={99} step={1} value={m2} onChange={(e) => setM2(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('pow.sciCalcPickE2')} <strong>{e2}</strong>
          </span>
          <input type="range" min={-6} max={12} step={1} value={e2} onChange={(e) => setE2(Number(e.target.value))} />
        </label>
      </div>

      <Tex block tex={`${sciTex(a, sep)} ${opTex} ${sciTex(b, sep)}`} />
      <Tex block tex={`= ${sciTex(raw, sep)}`} />
      <p className={alreadyNormal ? 'pow-badge ok' : 'pow-badge'}>
        {alreadyNormal ? t('pow.sciCalcResultLabel') : t('pow.sciCalcRawLabel')}
      </p>
      {!alreadyNormal && <Tex block tex={`= ${sciTex(result, sep)}`} />}
      {alreadyNormal && <p className="card-note lesson-text">{t('pow.sciCalcSameNote')}</p>}

      <p className="mini-title">{t('pow.sciCalcFactTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sciCalcFactIntro" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="pow.sciCalcTask"
        isCorrect={answerKey === SCI_CLAIMS_ANSWER}
        canCheck={SCI_CLAIMS.every((c) => verdicts[c.id])}
        answerKey={answerKey}
        solutionKey={SCI_CLAIMS_ANSWER}
        onReveal={() =>
          setVerdicts(Object.fromEntries(SCI_CLAIMS.map((c) => [c.id, c.plausible ? 'ok' : 'bad'])))
        }
        hintKey="pow.sciCalcHint"
      >
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>{t('pow.sciCalcThClaim')}</th>
                <th>{t('pow.sciCalcThValue')}</th>
                <th>{t('pow.sciCalcThVerdict')}</th>
                {showTrue && <th>{t('pow.sciCalcThTrue')}</th>}
              </tr>
            </thead>
            <tbody>
              {SCI_CLAIMS.map((c) => (
                <tr key={c.id}>
                  <td>{t(`pow.sciClaim_${c.id}`)}</td>
                  <td>
                    <Tex tex={claimTex(c.mantissa, c.exponent, c.id, c.unit)} />
                  </td>
                  <td>
                    <span className="pill-row">
                      <button
                        type="button"
                        className={verdicts[c.id] === 'ok' ? 'pill active' : 'pill'}
                        aria-pressed={verdicts[c.id] === 'ok'}
                        onClick={() => setVerdicts({ ...verdicts, [c.id]: 'ok' })}
                      >
                        {t('pow.sciCalcVerdictOk')}
                      </button>
                      <button
                        type="button"
                        className={verdicts[c.id] === 'bad' ? 'pill active' : 'pill'}
                        aria-pressed={verdicts[c.id] === 'bad'}
                        onClick={() => setVerdicts({ ...verdicts, [c.id]: 'bad' })}
                      >
                        {t('pow.sciCalcVerdictBad')}
                      </button>
                    </span>
                  </td>
                  {showTrue && (
                    <td>
                      <Tex tex={claimTex(c.trueMantissa, c.trueExponent, c.id, c.unit)} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn" onClick={() => setShowTrue(!showTrue)}>
          {showTrue ? t('pow.sciCalcHideTrue') : t('pow.sciCalcShowTrue')}
        </button>
      </Exercise>
    </section>
  )
}
