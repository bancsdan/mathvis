import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LOST_ROOT, STANDARD_ANSWER, STANDARD_PRESETS } from '../lib/quadratic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** A number with the typographic minus prose uses, not the hyphen. */
const signed = (v: number): string => (v < 0 ? `−${Math.abs(v)}` : String(v))

/**
 * A másodfokú egyenlet és az ekvivalens átalakítás.
 *
 * Whatever the equation looks like at first, the same tidying turns it into
 * ax² + bx + c = 0, and the three numbers are then simply read off. The second
 * half is the counter-example: one tempting step that quietly throws a root
 * away.
 */
export function QuadIntroCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [presetId, setPresetId] = useState('move')
  const [ansA, setAnsA] = useState('')
  const [ansB, setAnsB] = useState('')
  const [ansC, setAnsC] = useState('')

  const preset = STANDARD_PRESETS.find((p) => p.id === presetId) ?? STANDARD_PRESETS[0]
  const answerKey = `${ansA}|${ansB}|${ansC}`
  const [solA, solB, solC] = STANDARD_ANSWER.split('|')

  // The last line is always the one that put everything on the left; anything
  // before it opened a bracket first.
  const noteOf = (i: number) =>
    i === preset.steps.length - 1 ? t('quad.stepMoveAll') : t('quad.stepExpandLeft')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.introTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.introIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['quad.introDef1', 'quad.introDef2']} />
        <p className="card-note">
          <Trans i18nKey="quad.introIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="quad.introIntro3" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.introEqAria')}>
        {STANDARD_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => setPresetId(p.id)}
          >
            <Tex tex={p.givenTex} />
          </button>
        ))}
      </div>

      <ol className="lin-steps">
        <li className="lin-step">
          <Tex block tex={preset.givenTex} />
          <span className="lin-step-note">{t('quad.stepStart')}</span>
        </li>
        {preset.steps.map((step, i) => (
          <li key={step} className="lin-step">
            <Tex block tex={step} />
            <span className="lin-step-note">{noteOf(i)}</span>
          </li>
        ))}
      </ol>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('quad.introStatA')}</span>
          <span className="stat-value">{signed(preset.std.a)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('quad.introStatB')}</span>
          <span className="stat-value">{signed(preset.std.b)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('quad.introStatC')}</span>
          <span className="stat-value">{signed(preset.std.c)}</span>
        </div>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="quad.introResult"
          values={{ a: signed(preset.std.a), b: signed(preset.std.b), c: signed(preset.std.c) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="mini-title">{t('quad.introLostTitle')}</p>
      <Tex block tex="x^2 = 4x" />
      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('quad.introLostWrong')}</th>
              <th>{t('quad.introLostRight')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Tex tex={LOST_ROOT.wrongTex} />
              </td>
              <td>
                <Tex tex={LOST_ROOT.rightTex} />
              </td>
            </tr>
            <tr>
              <td>{t('quad.introLostOne')}</td>
              <td>
                <Tex tex={`x = 0 \\text{ ${t('quad.orWord')} } x = 4`} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="card-note lesson-text">{t('quad.introCheck')}</p>

      <Exercise
        promptKey="quad.introTask"
        isCorrect={answerKey === STANDARD_ANSWER}
        canCheck={ansA.trim() !== '' && ansB.trim() !== '' && ansC.trim() !== ''}
        answerKey={answerKey}
        solutionKey={STANDARD_ANSWER}
        onReveal={() => {
          setAnsA(solA)
          setAnsB(solB)
          setAnsC(solC)
        }}
        hintKey="quad.introHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('quad.introAnswerA')}</span>
            <input className="answer-input" type="number" value={ansA} onChange={(e) => setAnsA(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('quad.introAnswerB')}</span>
            <input className="answer-input" type="number" value={ansB} onChange={(e) => setAnsB(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('quad.introAnswerC')}</span>
            <input className="answer-input" type="number" value={ansC} onChange={(e) => setAnsC(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
