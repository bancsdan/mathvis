import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  BASE_SETS,
  equationTex,
  fracPlain,
  SET_ANSWER,
  SET_PRESETS,
  SET_TASK,
  sideTex,
  solutionSet,
  solutionSetTex,
  solveLinear,
  solveSteps,
  type BaseSet,
} from '../lib/linear'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** The three answers offered by the exercise, in the order they are shown. */
const OPTIONS = ['single', 'empty', 'all'] as const

/**
 * Alaphalmaz és megoldáshalmaz. The same equation is solved once and then
 * asked three times, and only the base set changes: 3/2 is an answer over Q
 * and no answer at all over Z.
 */
export function LinSetsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState('one')
  const [base, setBase] = useState<BaseSet>('Q')
  const [answer, setAnswer] = useState('')

  const preset = SET_PRESETS.find((p) => p.id === presetId) ?? SET_PRESETS[0]
  const result = solveLinear(preset.l, preset.r)
  const set = solutionSet(result, base)
  const steps = solveSteps(preset.l, preset.r)

  // The mechanical steps end at `0 = 0` or `0 = 1`; what that means is the
  // point of the section, so the last line says it in words.
  const noteOf = (index: number, noteKey: string) => {
    if (index < steps.length - 1) return noteKey
    if (result.kind === 'all') return 'lin.setsAllNote'
    if (result.kind === 'none') return 'lin.setsNoneNote'
    return noteKey
  }

  const verdictKey =
    result.kind === 'all'
      ? 'lin.setsVerdict_all'
      : result.kind === 'none'
        ? 'lin.setsVerdict_none'
        : set.kind === 'single'
          ? 'lin.setsVerdict_single'
          : 'lin.setsVerdict_outside'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.setsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.setsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['lin.setsDef1', 'lin.setsDef2']} />
        <p className="card-note">
          <Trans i18nKey="lin.setsIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">{t('lin.setsNatNote')}</p>
      </div>

      <div className="pill-row" role="group" aria-label={t('lin.setsEqAria')}>
        {SET_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => setPresetId(p.id)}
          >
            {t(`lin.setsEq_${p.id}`)}
          </button>
        ))}
      </div>

      <div className="pill-row" role="group" aria-label={t('lin.setsBaseAria')}>
        <span className="field-label">{t('lin.setsBaseAria')}</span>
        {BASE_SETS.map((b) => (
          <button
            key={b}
            type="button"
            className={base === b ? 'pill active' : 'pill'}
            aria-pressed={base === b}
            onClick={() => setBase(b)}
          >
            {t(`lin.setsBase_${b}`)}
          </button>
        ))}
      </div>

      {presetId === 'all' && (
        <>
          <Tex block tex={`2(x + 3) = ${sideTex(preset.r)}`} />
          <p className="card-note lesson-text">
            <Trans i18nKey="lin.setsAllExpand" components={{ b: <strong />, i: <em /> }} />
          </p>
        </>
      )}

      <ol className="lin-steps">
        {steps.map((step, i) => (
          <li key={i} className="lin-step">
            <Tex block tex={step.tex} />
            <span className="lin-step-note">{t(noteOf(i, step.noteKey))}</span>
          </li>
        ))}
      </ol>

      <Tex block tex={`M = ${solutionSetTex(set, base)}`} />
      <p className="lin-result lesson-text">
        <Trans
          i18nKey={verdictKey}
          values={{
            x: result.kind === 'one' ? fracPlain(result.x, sep) : '',
            noun: t(`lin.setsNoun_${base}`),
            base: t(`lin.setsBase_${base}`),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="lin.setsTask"
        isCorrect={answer === SET_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={SET_ANSWER}
        onReveal={() => setAnswer(SET_ANSWER)}
        hintKey="lin.setsHint"
      >
        <Tex block tex={equationTex(SET_TASK.l, SET_TASK.r)} />
        <div className="pill-row" role="group" aria-label={t('lin.setsOptAria')}>
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={answer === option ? 'pill active' : 'pill'}
              aria-pressed={answer === option}
              onClick={() => setAnswer(option)}
            >
              {t(`lin.setsOpt_${option}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
