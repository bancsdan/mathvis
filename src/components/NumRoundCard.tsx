import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  agreeingPrefix,
  areaBounds,
  formatDecimal,
  parseDecimal,
  ROOM,
  ROOM_ERRORS,
  ROUND_ANSWER,
  ROUND_PRESETS,
  roundAt,
  roundingError,
} from '../lib/numbers'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** Which place is being rounded to, from thousands down to thousandths. */
const PLACES: Array<{ decimals: number; key: string }> = [
  { decimals: -3, key: 'num.roundPlaceThousands' },
  { decimals: -2, key: 'num.roundPlaceHundreds' },
  { decimals: -1, key: 'num.roundPlaceTens' },
  { decimals: 0, key: 'num.roundPlaceOnes' },
  { decimals: 1, key: 'num.roundPlaceTenths' },
  { decimals: 2, key: 'num.roundPlaceHundredths' },
  { decimals: 3, key: 'num.roundPlaceThousandths' },
]

/** The digits as they are lined up for rounding: padded exactly like `roundAt`. */
function laidOut(value: string, decimals: number): { digits: string[]; point: number; cut: number } {
  const [rawInt = '0', rawFrac = ''] = value.split('.')
  const intPart = '0'.repeat(Math.max(0, 1 - decimals - rawInt.length)) + rawInt
  const fracPart = rawFrac + '0'.repeat(Math.max(0, decimals + 1 - rawFrac.length))
  return { digits: [...(intPart + fracPart)], point: intPart.length, cut: intPart.length + decimals }
}

/**
 * Kerekítés és mérés: which digit decides, what the rounding costs, and why a
 * measured area cannot have more true digits than the ruler gave it.
 */
export function NumRoundCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState('pi')
  const [decimals, setDecimals] = useState(3)
  const [err, setErr] = useState(ROOM_ERRORS[0])
  const [answer, setAnswer] = useState('')

  const preset = ROUND_PRESETS.find((p) => p.id === presetId) ?? ROUND_PRESETS[0]
  // Rounding 0,04567 to thousands is true but unreadable, so only the places
  // the number actually has digits for are offered.
  const [intDigits, fracDigits = ''] = preset.value.split('.')
  const places = PLACES.filter((p) => p.decimals > -intDigits.length && p.decimals <= fracDigits.length)
  const place = places.some((p) => p.decimals === decimals) ? decimals : places[places.length - 1].decimals

  const rounded = roundAt(preset.value, place)
  const error = roundingError(preset.value, place)
  const { digits, point, cut } = laidOut(preset.value, place)

  const bounds = areaBounds(ROOM.length, ROOM.width, err)
  const sure = agreeingPrefix(bounds.min.toFixed(6), bounds.max.toFixed(6))

  const plain = (v: string) => formatDecimal(v, sep, false)
  const texNum = (v: string) => formatDecimal(v, sep, true)
  const given = parseDecimal(answer)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.roundTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.roundIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="num.roundIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('num.roundPickNumber')}>
        {ROUND_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => setPresetId(p.id)}
          >
            {plain(p.value)}
            {p.unit ? ` ${p.unit}` : ''}
          </button>
        ))}
      </div>
      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('num.roundPickPlace')}</span>
          <select value={place} onChange={(e) => setDecimals(Number(e.target.value))}>
            {places.map((p) => (
              <option key={p.decimals} value={p.decimals}>
                {t(p.key)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="digit-row">
        {digits.map((d, i) => (
          <span key={i} className="digit-cell">
            {i === point && point > 0 && <span className="digit-sep">{sep}</span>}
            <span
              className={
                i === cut ? 'digit-box deciding' : i < cut ? 'digit-box' : 'digit-box dropped'
              }
            >
              {d}
            </span>
          </span>
        ))}
      </div>
      <div className="legend">
        <span className="legend-item">{t('num.roundKeep')}</span>
        <span className="legend-item">{t('num.roundDeciding', { digit: rounded.deciding })}</span>
        <span className="legend-item">{t('num.roundDrop')}</span>
      </div>

      <Tex block tex={`${texNum(preset.value)} \\approx ${texNum(rounded.result)}`} />
      <p className="card-note lesson-text">
        <Trans i18nKey="num.roundRule" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        {t('num.roundErrorLabel', { error: plain(String(Math.abs(error))) })}
      </p>

      <p className="mini-title">{t('num.measureTitle')}</p>
      <p className="card-note lesson-text">
        <Trans
          i18nKey="num.measureIntro"
          values={{ length: plain(String(ROOM.length)), width: plain(String(ROOM.width)) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>
      <div className="pill-row" role="group" aria-label={t('num.measurePickErr')}>
        {ROOM_ERRORS.map((e) => (
          <button
            key={e}
            type="button"
            className={err === e ? 'pill active' : 'pill'}
            aria-pressed={err === e}
            onClick={() => setErr(e)}
          >
            {t('num.measureErrPill', { mm: Math.round(e * 1000) })}
          </button>
        ))}
      </div>

      <Tex block tex={`${texNum(String(ROOM.length))} \\cdot ${texNum(String(ROOM.width))} = ${texNum(bounds.nominal.toFixed(4))}`} />
      <div className="table-wrap">
        <table className="paper-table">
          <tbody>
            <tr>
              <td>{t('num.measureMin')}</td>
              <td>{plain(bounds.min.toFixed(4))}</td>
            </tr>
            <tr className="row-ok">
              <td>{t('num.measureNominal')}</td>
              <td>{plain(bounds.nominal.toFixed(4))}</td>
            </tr>
            <tr>
              <td>{t('num.measureMax')}</td>
              <td>{plain(bounds.max.toFixed(4))}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="alias-verdict">
        <Trans
          i18nKey="num.measureSure"
          values={{ sure: plain(sure), nominal: plain(bounds.nominal.toFixed(4)) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="num.measureNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="num.roundTask"
        isCorrect={given === ROUND_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={plain(String(ROUND_ANSWER))}
        onReveal={() => setAnswer(plain(String(ROUND_ANSWER)))}
        hintKey="num.roundHint"
      >
        <label className="field">
          <span className="field-label">{t('num.roundAnswerLabel')}</span>
          <input
            className="answer-input"
            type="text"
            inputMode="decimal"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
