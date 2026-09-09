import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal, parseDecimal } from '../lib/numbers'
import {
  conversionHops,
  convert,
  ladder,
  LADDERS,
  plainNumber,
  UNITS_ANSWER,
  type UnitKind,
} from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** Where each ladder opens: a conversion a reader has met before. */
const DEFAULTS: Record<UnitKind, { from: string; to: string }> = {
  length: { from: 'km', to: 'm' },
  area: { from: 'm²', to: 'cm²' },
  volume: { from: 'l', to: 'ml' },
  time: { from: 'h', to: 'min' },
  speed: { from: 'km/h', to: 'm/s' },
}

/**
 * Mértékegységek átváltása. The ladder is the picture: converting is walking
 * from one rung to another, and the only thing that changes between kinds of
 * quantity is what is written between two rungs.
 */
export function PropUnitsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [kind, setKind] = useState<UnitKind>('length')
  const [from, setFrom] = useState(DEFAULTS.length.from)
  const [to, setTo] = useState(DEFAULTS.length.to)
  const [typed, setTyped] = useState(() => formatDecimal('2.5', sep, false))
  const [answer, setAnswer] = useState('')

  const { units } = ladder(kind)
  const given = parseDecimal(typed)
  const canonical = given === null ? '0' : typed.trim().replace(/−/g, '-').replace(',', '.')
  const hops = conversionHops(kind, from, to)
  const result = convert(kind, canonical, from, to)
  const wholeFactor = hops.reduce((acc, hop) => acc * hop.factor, 1)

  /** A unit as a name a reader says out loud; only the day is a word. */
  const unitName = (u: string) => (u === 'd' ? t('prop.unit_day') : u)
  /** KaTeX has no ² in text mode, so the exponent is hung on outside the \text. */
  const unitTex = (u: string) => {
    const power = u.includes('²') ? '^{2}' : u.includes('³') ? '^{3}' : ''
    return `\\text{${unitName(u).replace('²', '').replace('³', '')}}${power}`
  }

  const number = (s: string) => formatDecimal(s, sep, true)
  const walk = hops
    .map((hop) => `${hop.multiply ? '\\cdot' : ':'} ${number(String(hop.factor))}`)
    .join(' ')
  const line = [
    `${number(canonical)}\\ ${unitTex(from)}`,
    hops.length > 0 ? `${number(canonical)} ${walk}` : null,
    `${number(result)}\\ ${unitTex(to)}`,
  ]
    .filter((part): part is string => part !== null)
    .join(' = ')

  const fromIndex = units.indexOf(from)
  const toIndex = units.indexOf(to)
  const low = Math.min(fromIndex, toIndex)
  const high = Math.max(fromIndex, toIndex)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.unitsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.unitsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="prop.unitsDef" />
        <p className="card-note">
          <Trans i18nKey="prop.unitsIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('prop.unitsKindAria')}>
        {LADDERS.map((l) => (
          <button
            key={l.kind}
            type="button"
            className={kind === l.kind ? 'pill active' : 'pill'}
            aria-pressed={kind === l.kind}
            onClick={() => {
              setKind(l.kind)
              setFrom(DEFAULTS[l.kind].from)
              setTo(DEFAULTS[l.kind].to)
            }}
          >
            {t(`prop.kind_${l.kind}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('prop.unitsValue')}</span>
          <input
            className="answer-input"
            type="text"
            inputMode="decimal"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">{t('prop.unitsFrom')}</span>
          <select className="answer-input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {units.map((u) => (
              <option key={u} value={u}>
                {unitName(u)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('prop.unitsTo')}</span>
          <select className="answer-input" value={to} onChange={(e) => setTo(e.target.value)}>
            {units.map((u) => (
              <option key={u} value={u}>
                {unitName(u)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="prop-ladder" role="img" aria-label={t('prop.unitsLadderAria')}>
        {units.map((u, i) => (
          <span key={u} className="prop-rung-group">
            <span className={i === fromIndex || i === toIndex ? 'prop-rung lit' : 'prop-rung'}>{unitName(u)}</span>
            {i < units.length - 1 && (
              <span className={i >= low && i < high ? 'prop-hop lit' : 'prop-hop'}>
                {`×${plainNumber(ladder(kind).factors[i], sep)}`}
              </span>
            )}
          </span>
        ))}
      </div>

      {given === null ? (
        <p className="card-note lesson-text">{t('prop.unitsInvalid')}</p>
      ) : (
        <>
          <Tex block tex={line} />
          <p className="card-note lesson-text">
            {hops.length === 0
              ? t('prop.unitsStepsSame')
              : hops[0].multiply
                ? t('prop.unitsStepsDown', { factor: plainNumber(wholeFactor, sep) })
                : t('prop.unitsStepsUp', { factor: plainNumber(wholeFactor, sep) })}
          </p>
        </>
      )}

      {kind === 'volume' && <p className="card-note lesson-text">{t('prop.unitsNote')}</p>}

      <Exercise
        promptKey="prop.unitsTask"
        isCorrect={parseDecimal(answer) === Number(UNITS_ANSWER)}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={UNITS_ANSWER}
        onReveal={() => setAnswer(UNITS_ANSWER)}
        hintKey="prop.unitsHint"
      >
        <label className="field">
          <span className="field-label">{t('prop.unitsAnswerLabel')}</span>
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
