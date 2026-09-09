import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  evalSide,
  flip,
  fracPlain,
  holds,
  INEQ_ANSWER,
  INEQ_OPTIONS,
  INEQ_PRESETS,
  INEQ_TASK,
  ineqTex,
  REL_PLAIN,
  REL_TEX,
  solveIneq,
  type Rel,
} from '../lib/linear'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { NumberLine } from './NumberLine'
import { Tex } from './Tex'

const MIN = -6
const MAX = 6

/** The stretch of the line an `x rel bound` answer covers. */
function segment(rel: Rel, bound: number, color: string) {
  const closed = rel === 'le' || rel === 'ge'
  return rel === 'lt' || rel === 'le'
    ? { from: MIN, to: bound, leftClosed: true, rightClosed: closed, color }
    : { from: bound, to: MAX, leftClosed: closed, rightClosed: true, color }
}

/**
 * Egyenlőtlenségek. Everything works as it did for equations except one move,
 * and the test point is what makes that one move impossible to forget: put a
 * number back into the original inequality and the wrong half-line disagrees.
 */
export function LinIneqCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [presetId, setPresetId] = useState('flip')
  const [forget, setForget] = useState(false)
  const [test, setTest] = useState(0)
  const [answer, setAnswer] = useState('')

  const preset = INEQ_PRESETS.find((p) => p.id === presetId) ?? INEQ_PRESETS[0]
  const solved = solveIneq(preset.l, preset.r, preset.rel)
  const bound = solved.bound.p / solved.bound.q
  const flipped = solved.steps.some((step) => step.flipped)
  const isTrue = holds(preset.l, preset.r, preset.rel, test)

  const segments = [segment(solved.rel, bound, 'var(--series-1)')]
  if (forget && flipped) segments.push(segment(flip(solved.rel), bound, 'var(--series-2)'))

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.ineqTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.ineqIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="lin.ineqDef" />
        <p className="card-note">
          <Trans i18nKey="lin.ineqRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.ineqIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('lin.ineqEqAria')}>
        {INEQ_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => {
              setPresetId(p.id)
              setForget(false)
            }}
          >
            <Tex tex={ineqTex(p.l, p.r, p.rel)} />
          </button>
        ))}
      </div>

      <ol className="lin-steps">
        {solved.steps.map((step, i) => (
          <li key={i} className={step.flipped ? 'lin-step lin-flip' : 'lin-step'}>
            <Tex block tex={step.tex} />
            <span className="lin-step-note">{t(step.noteKey)}</span>
          </li>
        ))}
      </ol>

      <p className="mini-title">{t('lin.ineqLineTitle')}</p>
      <NumberLine
        min={MIN}
        max={MAX}
        height={86}
        segments={segments}
        points={[
          {
            id: 'test',
            value: test,
            label: String(test),
            color: 'var(--series-3)',
          },
        ]}
        ariaLabel={t('lin.ineqLineAria', {
          rel: REL_PLAIN[solved.rel],
          bound: fracPlain(solved.bound, sep),
        })}
      />

      {flipped ? (
        <div className="pill-row">
          <button
            type="button"
            className={forget ? 'pill active' : 'pill'}
            aria-pressed={forget}
            onClick={() => setForget(!forget)}
          >
            {t('lin.ineqForget')}
          </button>
        </div>
      ) : (
        <p className="card-note lesson-text">{t('lin.ineqNoFlipHere')}</p>
      )}
      {forget && flipped && <p className="card-note lesson-text">{t('lin.ineqForgetNote')}</p>}

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('lin.ineqTestPick')} <strong>{test}</strong>
          </span>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={test}
            onChange={(e) => setTest(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="lin.ineqTestLine"
          values={{
            x: test,
            left: evalSide(preset.l, test),
            right: evalSide(preset.r, test),
            rel: REL_PLAIN[preset.rel],
            verdict: t(isTrue ? 'lin.ineqTrue' : 'lin.ineqFalse', { x: test }),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="lin.ineqTask"
        isCorrect={answer === INEQ_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={INEQ_ANSWER}
        onReveal={() => setAnswer(INEQ_ANSWER)}
        hintKey="lin.ineqHint"
      >
        <Tex block tex={ineqTex(INEQ_TASK.l, INEQ_TASK.r, INEQ_TASK.rel)} />
        <div className="pill-row" role="group" aria-label={t('lin.ineqOptAria')}>
          {INEQ_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={answer === option.id ? 'pill active' : 'pill'}
              aria-pressed={answer === option.id}
              onClick={() => setAnswer(option.id)}
            >
              <Tex tex={`x ${REL_TEX[option.rel]} ${option.bound}`} />
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
