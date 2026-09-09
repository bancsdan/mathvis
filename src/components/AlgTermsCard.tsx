import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { collectLike, family, polyTex, TERM_PRESETS, TERMS_ANSWER, termTex, type Term } from '../lib/algebra'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/**
 * Tagok, tényezők, együtthatók: what may be added together, and what may not.
 *
 * The chips are the lesson. Clicking one lights every term of the same family,
 * so "egynemű" stops being a word to learn and becomes the thing the colours
 * were already saying.
 */
export function AlgTermsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [presetId, setPresetId] = useState('mixed')
  const [litPart, setLitPart] = useState<string | null>(null)
  const [collected, setCollected] = useState(false)
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [c, setC] = useState('')

  const preset = TERM_PRESETS.find((p) => p.id === presetId) ?? TERM_PRESETS[0]
  const result = collectLike(preset.terms)
  const shown: readonly Term[] = collected ? result : preset.terms
  const answerKey = `${a}|${b}|${c}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.termsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.termsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition
          i18nKey={['alg.termsDef1', 'alg.termsDef2', 'alg.termsDef3', 'alg.termsDef4', 'alg.termsDef5']}
        />
      </div>

      <div className="pill-row" role="group" aria-label={t('alg.termsPickAria')}>
        {TERM_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => {
              setPresetId(p.id)
              setCollected(false)
              setLitPart(null)
            }}
          >
            {t(`alg.termsPreset_${p.id}`)}
          </button>
        ))}
      </div>

      {/* Buttons, not a picture: a chip is the control and the illustration at
          once, so a keyboard reaches everything the mouse can. */}
      <div className="alg-term-row" role="group" aria-label={t('alg.termsChipsAria')}>
        {shown.map((term, i) => (
          <button
            key={`${term.part}-${i}`}
            type="button"
            className={`alg-term fam-${family(term.part)}${litPart === term.part ? ' lit' : ''}`}
            aria-pressed={litPart === term.part}
            onClick={() => setLitPart(litPart === term.part ? null : term.part)}
          >
            <Tex tex={termTex(term, i === 0)} />
          </button>
        ))}
      </div>

      <div className="pill-row">
        <button type="button" className="btn" onClick={() => setCollected(!collected)}>
          {collected ? t('alg.termsUndo') : t('alg.termsCollect')}
        </button>
      </div>

      <Tex block tex={`${polyTex(preset.terms)} = ${polyTex(result)}`} />

      <p className="card-note lesson-text">
        <Trans i18nKey="alg.termsNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="alg.termsTask"
        isCorrect={answerKey === TERMS_ANSWER}
        canCheck={a.trim() !== '' && b.trim() !== '' && c.trim() !== ''}
        answerKey={answerKey}
        solutionKey={TERMS_ANSWER}
        onReveal={() => {
          const [pa, pb, pc] = TERMS_ANSWER.split('|')
          setA(pa)
          setB(pb)
          setC(pc)
        }}
        hintKey="alg.termsHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('alg.termsAnswerA')}</span>
            <input className="answer-input" type="number" value={a} onChange={(e) => setA(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('alg.termsAnswerB')}</span>
            <input className="answer-input" type="number" value={b} onChange={(e) => setB(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('alg.termsAnswerC')}</span>
            <input className="answer-input" type="number" value={c} onChange={(e) => setC(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
