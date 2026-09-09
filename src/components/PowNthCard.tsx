import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal } from '../lib/numbers'
import { CUBE_PRESETS, NTH_ANSWER, nthRoot, RATIONAL_TABLE, rationalPower } from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const ROOT_INDICES = [2, 3, 4, 5]

/**
 * n-edik gyök és törtkitevő. The cube root arrives as the edge of a cube, and
 * the fractional exponent is then forced by the laws of section 3 rather than
 * introduced as a new rule to accept.
 */
export function PowNthCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [n, setN] = useState(3)
  const [a, setA] = useState(27)
  const [answer, setAnswer] = useState('')

  const root = nthRoot(a, n)
  const whole = root !== null && Number.isInteger(root)
  const rootTex =
    root === null
      ? '-'
      : whole
        ? String(root)
        : formatDecimal(root.toFixed(3), sep, true)

  /** `16^{3/4} = \sqrt[4]{16^3} = (\sqrt[4]{16})^3 = 2^3 = 8` — the whole route. */
  const rowTex = (row: { a: number; m: number; n: number }): string => {
    const inner = nthRoot(row.a, row.n)
    const value = rationalPower(row.a, row.m, row.n)
    return `\\sqrt[${row.n}]{${row.a}^{${row.m}}} = \\left(\\sqrt[${row.n}]{${row.a}}\\right)^{${row.m}} = ${inner}^{${row.m}} = ${value === null ? '-' : formatDecimal(String(value), sep, true)}`
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.nthTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.nthIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="pow.nthDef1">
          <Tex block tex="\sqrt[n]{a} = b \iff b^{n} = a" />
        </Definition>
        <p className="card-note">
          <Trans i18nKey="pow.nthIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <span className="field-label">{t('pow.nthPickN')}</span>
      <div className="pill-row" role="group" aria-label={t('pow.nthPickN')}>
        {ROOT_INDICES.map((v) => (
          <button
            key={v}
            type="button"
            className={n === v ? 'pill active' : 'pill'}
            aria-pressed={n === v}
            onClick={() => setN(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <span className="field-label">{t('pow.nthCubePick')}</span>
      <div className="pill-row" role="group" aria-label={t('pow.nthCubePick')}>
        {CUBE_PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            className={a === v ? 'pill active' : 'pill'}
            aria-pressed={a === v}
            onClick={() => setA(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('pow.nthPickA')} <strong>{a}</strong>
          </span>
          <input type="range" min={1} max={1000} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
      </div>

      <Tex block tex={`\\sqrt[${n}]{${a}} ${whole ? '=' : '\\approx'} ${rootTex}`} />
      <p className={whole ? 'pow-badge ok' : 'pow-badge'} role="status" aria-live="polite">
        {whole ? t('pow.nthBadgeWhole') : t('pow.nthBadgeNot')}
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.nthOddNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('pow.nthFracTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.nthFracIntro" components={{ b: <strong />, i: <em /> }} />
      </p>
      <div className="lesson-text">
        <Definition i18nKey="pow.nthDef2">
          <Tex block tex="a^{\frac{1}{n}} = \sqrt[n]{a} \qquad a^{\frac{m}{n}} = \sqrt[n]{a^{m}}" />
        </Definition>
      </div>

      <p className="mini-title">{t('pow.nthWhyTitle')}</p>
      <Tex block tex="\left(a^{\frac{1}{2}}\right)^{2} = a^{\frac{1}{2} \cdot 2} = a^{1} = a" />
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.nthWhy" components={{ b: <strong />, i: <em /> }} />
      </p>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('pow.nthThPower')}</th>
              <th>{t('pow.nthThSteps')}</th>
            </tr>
          </thead>
          <tbody>
            {RATIONAL_TABLE.map((row) => (
              <tr key={`${row.a}-${row.m}-${row.n}`}>
                <td>
                  <Tex tex={`${row.a}^{\\frac{${row.m}}{${row.n}}}`} />
                </td>
                <td>
                  <Tex tex={rowTex(row)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Exercise
        promptKey="pow.nthTask"
        isCorrect={Number(answer) === NTH_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(NTH_ANSWER)}
        onReveal={() => setAnswer(String(NTH_ANSWER))}
        hintKey="pow.nthHint"
      >
        <label className="field">
          <span className="field-label">{t('pow.nthAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
