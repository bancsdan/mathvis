import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  checkTargetExpression,
  CLAIMS,
  CLAIMS_ANSWER,
  ESTIMATE_PRESETS,
  estimateOf,
  formatDecimal,
  TARGET_DIGITS,
  TARGETS,
  type Claim,
  type EstimatePreset,
} from '../lib/numbers'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const OP_TEX: Record<Claim['op'] | EstimatePreset['op'], string> = {
  mul: '\\cdot',
  div: ':',
  add: '+',
  square: '^',
}

/** `47 \cdot 81` — the calculation of a claim, with its own decimal separator. */
const claimTex = (c: Claim, sep: string): string => {
  const left = formatDecimal(c.left, sep, true)
  const right = formatDecimal(c.right, sep, true)
  return c.op === 'square' ? `${left}^{${right}}` : `${left} ${OP_TEX[c.op]} ${right}`
}

/**
 * Becslés és a számológép: work out roughly what the answer must be before
 * pressing any key, so a mistyped digit stands out.
 */
export function NumEstimateCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState('e1')
  const [expr, setExpr] = useState('')
  const [target, setTarget] = useState(TARGETS[0])
  const [showExact, setShowExact] = useState(false)
  const [verdicts, setVerdicts] = useState<Record<string, string>>({})

  const preset = ESTIMATE_PRESETS.find((p) => p.id === presetId) ?? ESTIMATE_PRESETS[0]
  const est = estimateOf(preset)
  const offPercent = ((Math.abs(est.estimate - est.exact) / Math.abs(est.exact)) * 100).toFixed(1)
  const attempt = checkTargetExpression(expr, target)
  // "1, 2, 3, 4" reads better in a sentence than "1234".
  const digitList = [...TARGET_DIGITS].join(', ')
  const answerKey = CLAIMS.map((c) => verdicts[c.id] ?? '').join('|')

  const num = (v: number, digits = 0) => formatDecimal(v.toFixed(digits), sep, true)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.estTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.estIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="num.estIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('num.estPickAria')}>
        {ESTIMATE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => setPresetId(p.id)}
          >
            <Tex
              tex={`${formatDecimal(String(p.a), sep, true)} ${OP_TEX[p.op]} ${formatDecimal(String(p.b), sep, true)}`}
            />
          </button>
        ))}
      </div>

      <Tex
        block
        tex={`${formatDecimal(String(preset.a), sep, true)} ${OP_TEX[preset.op]} ${formatDecimal(String(preset.b), sep, true)} \\approx ${formatDecimal(String(est.ra), sep, true)} ${OP_TEX[preset.op]} ${formatDecimal(String(est.rb), sep, true)} = ${num(est.estimate, Number.isInteger(est.estimate) ? 0 : 2)}`}
      />
      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('num.estEstimateLabel')}</span>
          <span className="stat-value">{formatDecimal(String(est.estimate), sep, false)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('num.estExactLabel')}</span>
          <span className="stat-value">
            {formatDecimal(Number.isInteger(est.exact) ? String(est.exact) : est.exact.toFixed(2), sep, false)}
          </span>
        </div>
      </div>
      <p className="card-note lesson-text">{t('num.estOff', { percent: formatDecimal(offPercent, sep, false) })}</p>
      <p className="alias-verdict">
        <Trans i18nKey="num.estRule" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('num.targetTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="num.targetIntro" values={{ digits: digitList }} components={{ b: <strong />, i: <em /> }} />
      </p>
      <div className="pill-row" role="group" aria-label={t('num.targetPickAria')}>
        {TARGETS.map((v) => (
          <button
            key={v}
            type="button"
            className={target === v ? 'pill active' : 'pill'}
            aria-pressed={target === v}
            onClick={() => setTarget(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <label className="field field-wide">
        <span className="field-label">{t('num.targetLabel', { target })}</span>
        <input
          type="text"
          inputMode="text"
          value={expr}
          placeholder={t('num.targetPlaceholder')}
          onChange={(e) => setExpr(e.target.value)}
        />
      </label>
      <p className={attempt.hit ? 'alias-verdict verdict-ok' : 'card-note lesson-text'} role="status" aria-live="polite">
        {expr.trim() === ''
          ? t('num.targetHintExample')
          : !attempt.charsOk
            ? t('num.targetBadChars')
            : !attempt.digitsOk
              ? t('num.targetBadDigits', { digits: digitList })
              : attempt.value === null
                ? t('num.targetBadExpr')
                : attempt.hit
                  ? t('num.targetHit', { target })
                  : t('num.targetValue', { value: formatDecimal(String(attempt.value), sep, false) })}
      </p>

      <Exercise
        promptKey="num.estTask"
        isCorrect={answerKey === CLAIMS_ANSWER}
        canCheck={CLAIMS.every((c) => verdicts[c.id])}
        answerKey={answerKey}
        solutionKey={CLAIMS_ANSWER}
        onReveal={() =>
          setVerdicts(Object.fromEntries(CLAIMS.map((c) => [c.id, c.plausible ? 'ok' : 'bad'])))
        }
        hintKey="num.estHint"
      >
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>{t('num.estThCalc')}</th>
                <th>{t('num.estThClaimed')}</th>
                <th>{t('num.estThVerdict')}</th>
                {showExact && <th>{t('num.estThExact')}</th>}
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Tex tex={claimTex(c, sep)} />
                  </td>
                  <td>{formatDecimal(c.claimed, sep, false)}</td>
                  <td>
                    <span className="pill-row">
                      <button
                        type="button"
                        className={verdicts[c.id] === 'ok' ? 'pill active' : 'pill'}
                        aria-pressed={verdicts[c.id] === 'ok'}
                        onClick={() => setVerdicts({ ...verdicts, [c.id]: 'ok' })}
                      >
                        {t('num.estVerdictOk')}
                      </button>
                      <button
                        type="button"
                        className={verdicts[c.id] === 'bad' ? 'pill active' : 'pill'}
                        aria-pressed={verdicts[c.id] === 'bad'}
                        onClick={() => setVerdicts({ ...verdicts, [c.id]: 'bad' })}
                      >
                        {t('num.estVerdictBad')}
                      </button>
                    </span>
                  </td>
                  {showExact && <td>{formatDecimal(c.exact, sep, false)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn" onClick={() => setShowExact(!showExact)}>
          {showExact ? t('num.estHideExact') : t('num.estShowExact')}
        </button>
      </Exercise>
    </section>
  )
}
