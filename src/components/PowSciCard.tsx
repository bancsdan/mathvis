import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal, parseDecimal } from '../lib/numbers'
import { isNormalMantissa, SCI_ANSWER, SCI_PRESETS, sciTex, shiftPoint } from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/**
 * The digits of a number laid out with the point at a chosen place, padded
 * with zeros wherever the point has walked off the end of the digits.
 */
function laidOut(digits: string, places: number): { all: string; point: number } {
  const [intPart = '0', fracPart = ''] = digits.split('.')
  let all = intPart + fracPart
  let point = intPart.length + places
  if (point < 1) {
    all = '0'.repeat(1 - point) + all
    point = 1
  }
  if (point > all.length) all += '0'.repeat(point - all.length)
  return { all, point }
}

/**
 * Normálalak. The point is not computed away, it is walked: the reader moves
 * it one place at a time and watches the exponent count the moves.
 */
export function PowSciCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState('earthSun')
  const [places, setPlaces] = useState(0)
  const [mantissa, setMantissa] = useState('')
  const [exponent, setExponent] = useState('')

  const preset = SCI_PRESETS.find((p) => p.id === presetId) ?? SCI_PRESETS[0]
  // The point has to be able to walk past either end of the digits, so the
  // slider is exactly as long as the number it belongs to.
  const span = preset.digits.replace('.', '').length
  const shift = Math.max(-span, Math.min(span, places))
  const { all, point } = laidOut(preset.digits, shift)
  const first = all.search(/[1-9]/)
  const value = shiftPoint(preset.digits, shift)
  const sci = { mantissa: value, exponent: -shift }
  const normal = isNormalMantissa(value)
  // Two of the presets are counts of people, which is a word rather than a
  // symbol, so the unit comes from the lib only when there is one to come.
  const unit = preset.unit || t('pow.sciUnitPeople')

  const givenMantissa = parseDecimal(mantissa)
  const answerKey = `${mantissa}|${exponent}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.sciTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.sciIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="pow.sciDef">
          <Tex block tex="a \cdot 10^{k}, \qquad 1 \le a < 10" />
        </Definition>
        <p className="card-note">
          <Trans i18nKey="pow.sciIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('pow.sciPickAria')}>
        {SCI_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => {
              setPresetId(p.id)
              setPlaces(0)
            }}
          >
            {t(`pow.sciPreset_${p.id}`)}
          </button>
        ))}
      </div>

      <div className="digit-row" role="img" aria-label={t('pow.sciDigitsAria', { before: point })}>
        {[...all].map((d, i) => (
          <span key={i} className="digit-cell">
            {i === point && <span className="pow-point">{sep}</span>}
            <span className={i === first ? 'digit-box deciding' : 'digit-box'}>{d}</span>
          </span>
        ))}
        {/* A point after the last digit means a whole number: nothing to show. */}
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('pow.sciPickShift')} <strong>{shift}</strong>
          </span>
          <input
            type="range"
            min={-span}
            max={span}
            step={1}
            value={shift}
            onChange={(e) => setPlaces(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('pow.sciMantissaLabel')}</span>
          <span className="stat-value">{formatDecimal(value, sep, false)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('pow.sciExponentLabel')}</span>
          <span className="stat-value">{-shift}</span>
        </div>
      </div>
      <p className={normal ? 'pow-badge ok' : 'pow-badge'} role="status" aria-live="polite">
        {normal ? t('pow.sciBadgeOk') : t('pow.sciBadgeNo')}
      </p>
      <Tex block tex={`${sciTex(sci, sep)}\\ \\text{${unit}}`} />

      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sciNote1" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sciNote2" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="pow.sciTask"
        isCorrect={givenMantissa === Number(SCI_ANSWER.mantissa) && Number(exponent) === SCI_ANSWER.exponent}
        canCheck={mantissa.trim() !== '' && exponent.trim() !== ''}
        answerKey={answerKey}
        solutionKey={`${formatDecimal(SCI_ANSWER.mantissa, sep, false)}|${SCI_ANSWER.exponent}`}
        onReveal={() => {
          setMantissa(formatDecimal(SCI_ANSWER.mantissa, sep, false))
          setExponent(String(SCI_ANSWER.exponent))
        }}
        hintKey="pow.sciHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('pow.sciAnswerMantissa')}</span>
            <input
              className="answer-input"
              type="text"
              inputMode="decimal"
              value={mantissa}
              onChange={(e) => setMantissa(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('pow.sciAnswerExponent')}</span>
            <input
              className="answer-input"
              type="number"
              value={exponent}
              onChange={(e) => setExponent(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
