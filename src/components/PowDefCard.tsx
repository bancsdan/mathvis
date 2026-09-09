import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal, parseDecimal } from '../lib/numbers'
import {
  BASES,
  basePowerTex,
  baseValueTex,
  DEF_ANSWER,
  factorList,
  FOLD_RECORD,
  foldLayers,
  foldThicknessMm,
  humanLength,
  milestoneAt,
} from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** A thin space every three digits, so 4398046511104 can be read at a glance. */
const grouped = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/**
 * Hatvány: alap és kitevő. The shorthand is unpacked into its factors, so the
 * exponent is visibly a count of them rather than a rule to remember, and the
 * folding panel shows what that count does once it starts doubling.
 */
export function PowDefCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [baseId, setBaseId] = useState('two')
  const [exp, setExp] = useState(5)
  const [folds, setFolds] = useState(0)
  const [paren, setParen] = useState('')
  const [bare, setBare] = useState('')

  const base = BASES.find((b) => b.id === baseId) ?? BASES[0]
  const chipTex = base.paren ? `\\left(${base.tex}\\right)` : base.tex
  const factors = factorList(chipTex, exp)
  const productTex = factors.join(' \\cdot ')

  const layers = foldLayers(folds)
  const thickness = humanLength(foldThicknessMm(folds))
  const milestone = milestoneAt(folds)

  const parenSolution = formatDecimal(String(DEF_ANSWER.paren), sep, false)
  const bareSolution = formatDecimal(String(DEF_ANSWER.bare), sep, false)
  const answerKey = `${paren}|${bare}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.defTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.defIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['pow.defDef1', 'pow.defDef2']} />
        <p className="card-note">
          <Trans i18nKey="pow.defIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('pow.defPickBase')}>
        {BASES.map((b) => (
          <button
            key={b.id}
            type="button"
            className={baseId === b.id ? 'pill active' : 'pill'}
            aria-pressed={baseId === b.id}
            onClick={() => setBaseId(b.id)}
          >
            <Tex tex={b.paren ? `\\left(${b.tex}\\right)` : b.tex} />
          </button>
        ))}
      </div>
      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('pow.defPickExp')} <strong>{exp}</strong>
          </span>
          <input type="range" min={1} max={8} step={1} value={exp} onChange={(e) => setExp(Number(e.target.value))} />
        </label>
      </div>

      <div
        className="pow-picture"
        role="img"
        aria-label={t('pow.defFactorsAria', { factors: exp, base: base.value })}
      >
        <div className="pow-factor-row">
          {factors.map((f, i) => (
            <span key={i} className="pow-factor">
              <Tex tex={f} />
            </span>
          ))}
        </div>
      </div>

      <Tex block tex={`${basePowerTex(base, exp)} = ${productTex} = ${baseValueTex(base, exp)}`} />

      {base.num < 0 && (
        <p className="card-note lesson-text">
          <Trans i18nKey="pow.defSignNote" components={{ b: <strong />, i: <em /> }} />
        </p>
      )}

      <p className="mini-title">{t('pow.defTrapTitle')}</p>
      <Tex block tex={`\\left(-2\\right)^{4} = 16 \\qquad -2^{4} = -16`} />
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.defTrapNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('pow.defFoldTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.defFoldIntro" components={{ b: <strong />, i: <em /> }} />
      </p>
      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('pow.defFoldPick')} <strong>{folds}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={42}
            step={1}
            value={folds}
            onChange={(e) => setFolds(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('pow.defFoldLayers')}</span>
          <span className="stat-value">{grouped(layers)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('pow.defFoldThickness')}</span>
          <span className="stat-value">
            {formatDecimal(String(thickness.value), sep, false)} {thickness.unit}
          </span>
        </div>
      </div>
      <Tex block tex={`2^{${folds}} = ${grouped(layers).replace(/ /g, '\\,')}`} />
      <p className="alias-verdict" role="status" aria-live="polite">
        {milestone ? t(milestone.compareKey) : t('pow.defFoldStart')}
      </p>
      <p className="card-note lesson-text">
        <Trans
          i18nKey="pow.defFoldRecord"
          values={{
            folds: FOLD_RECORD.folds,
            year: FOLD_RECORD.year,
            km: formatDecimal(String(FOLD_RECORD.lengthKm), sep, false),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="pow.defTask"
        isCorrect={parseDecimal(paren) === DEF_ANSWER.paren && parseDecimal(bare) === DEF_ANSWER.bare}
        canCheck={paren.trim() !== '' && bare.trim() !== ''}
        answerKey={answerKey}
        solutionKey={`${parenSolution}|${bareSolution}`}
        onReveal={() => {
          setParen(parenSolution)
          setBare(bareSolution)
        }}
        hintKey="pow.defHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('pow.defAnswerParen')}</span>
            <input
              className="answer-input"
              type="text"
              inputMode="numeric"
              value={paren}
              onChange={(e) => setParen(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('pow.defAnswerBare')}</span>
            <input
              className="answer-input"
              type="text"
              inputMode="numeric"
              value={bare}
              onChange={(e) => setBare(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
