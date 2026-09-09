import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { parseDecimal } from '../lib/numbers'
import {
  discriminant,
  FORMULA_ANSWER,
  FORMULA_PRESETS,
  formulaSubstitutedTex,
  parallelSteps,
  quadTex,
  rootDecimal,
  rootTex,
  solveQuad,
} from '../lib/quadratic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** `2x² − 5x + 2 = 0`, the equation of the exercise. */
const TASK = { a: 2, b: -5, c: 2 }

/** A number with the typographic minus prose uses, not the hyphen. */
const signed = (v: number): string => (v < 0 ? `−${Math.abs(v)}` : String(v))

/**
 * A megoldóképlet.
 *
 * The derivation runs in two columns: the letters on the left and the same
 * move on one concrete equation on the right. Nothing new happens in the left
 * column that the reader has not already done by hand in the right one — which
 * is the whole claim of the section, that the formula is completing the square
 * carried out once and for all.
 */
export function QuadFormulaCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [index, setIndex] = useState(0)
  const [ansA, setAnsA] = useState('')
  const [ansB, setAnsB] = useState('')

  const q = FORMULA_PRESETS[index]
  const d = discriminant(q)
  const roots = solveQuad(q)
  const steps = parallelSteps(q)
  const verdictKey =
    roots.kind === 'two' ? 'quad.verdictTwo' : roots.kind === 'one' ? 'quad.verdictOne' : 'quad.verdictNone'

  const typed = [ansA, ansB].map(parseDecimal)
  const answered = typed.every((v) => v !== null)
  const answerKey = answered
    ? (typed as number[])
        .slice()
        .sort((x, y) => x - y)
        .map(String)
        .join('|')
    : `${ansA}|${ansB}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.formulaTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.formulaIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['quad.formulaDef1', 'quad.formulaDef2']} />
        <p className="card-note">
          <Trans i18nKey="quad.formulaIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.formulaEqAria')}>
        {FORMULA_PRESETS.map((preset, i) => (
          <button
            key={quadTex(preset)}
            type="button"
            className={i === index ? 'pill active' : 'pill'}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          >
            <Tex tex={`${quadTex(preset)} = 0`} />
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="paper-table quad-parallel">
          <thead>
            <tr>
              <th>{t('quad.parGeneral')}</th>
              <th>{t('quad.parConcrete')}</th>
              <th>{t('quad.parNote')}</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.noteKey}>
                {/* Display style, so the fractions are legible inside a table cell. */}
                <td>{step.general !== '' && <Tex tex={`\\displaystyle ${step.general}`} />}</td>
                <td>
                  <Tex tex={`\\displaystyle ${step.concrete}`} />
                </td>
                <td className="quad-note">{t(step.noteKey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mini-title">{t('quad.formulaSubTitle')}</p>
      <Tex block tex={formulaSubstitutedTex(q)} />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="quad.formulaResult"
          values={{ d: signed(d), verdict: t(verdictKey) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      {roots.kind !== 'none' && <Tex block tex={rootTex(q)} />}
      {roots.kind !== 'none' && !roots.exact && (
        <p className="card-note lesson-text">
          {t('quad.formulaApprox', {
            x1: rootDecimal(roots.x1 as number, sep),
            x2: rootDecimal(roots.x2 as number, sep),
          })}
        </p>
      )}

      <p className="mini-title">{t('quad.formulaHistoryTitle')}</p>
      <p className="card-note lesson-text">{t('quad.formulaHistory')}</p>

      <Exercise
        promptKey="quad.formulaTask"
        isCorrect={answerKey === FORMULA_ANSWER}
        canCheck={answered}
        answerKey={answerKey}
        solutionKey={FORMULA_ANSWER}
        onReveal={() => {
          setAnsA(rootDecimal(0.5, sep))
          setAnsB(rootDecimal(2, sep))
        }}
        hintKey="quad.formulaHint"
      >
        <Tex block tex={`${quadTex(TASK)} = 0`} />
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('quad.formulaAnswer1')}</span>
            <input
              className="answer-input"
              type="text"
              inputMode="decimal"
              value={ansA}
              onChange={(e) => setAnsA(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('quad.formulaAnswer2')}</span>
            <input
              className="answer-input"
              type="text"
              inputMode="decimal"
              value={ansB}
              onChange={(e) => setAnsB(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
