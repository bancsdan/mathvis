import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { linearTex, traceTrick, TRICK_ANSWER, TRICKS } from '../lib/algebra'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/**
 * Gondolj egy számra: a mind-reading trick, and the letter that explains it.
 *
 * The two columns run side by side on purpose. One holds the reader's own
 * arithmetic, which proves nothing; the other holds the same steps done with a
 * letter, which proves everything — and the last row of the letter column is
 * the whole answer to "why does this always work".
 */
export function AlgTrickCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [trickId, setTrickId] = useState('double')
  const [secret, setSecret] = useState(7)
  const [answer, setAnswer] = useState('')

  const trick = TRICKS.find((tr) => tr.id === trickId) ?? TRICKS[0]
  const rows = traceTrick(trick.steps, secret)
  const last = rows[rows.length - 1]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('alg.trickTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="alg.trickIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['alg.trickDef1', 'alg.trickDef2', 'alg.trickDef3']} />
        <p className="card-note">
          <Trans i18nKey="alg.trickIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('alg.trickPickAria')}>
        {TRICKS.map((tr) => (
          <button
            key={tr.id}
            type="button"
            className={trickId === tr.id ? 'pill active' : 'pill'}
            aria-pressed={trickId === tr.id}
            onClick={() => setTrickId(tr.id)}
          >
            {t(`alg.trickName_${tr.id}`)}
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('alg.trickPickSecret')} <strong>{secret}</strong>
          </span>
          <input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={secret}
            onChange={(e) => setSecret(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('alg.trickThStep')}</th>
              <th>{t('alg.trickThNumber')}</th>
              <th>{t('alg.trickThLetter')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('alg.trickStepStart')}</td>
              <td>{secret}</td>
              <td>
                <Tex tex="x" />
              </td>
            </tr>
            {trick.steps.map((step, i) => (
              <tr key={i} className={i === rows.length - 1 ? 'alg-final' : undefined}>
                <td>{t(`alg.trickStep_${step.op}`, { n: step.value })}</td>
                <td>{rows[i].value}</td>
                <td>
                  <Tex tex={linearTex(rows[i].linear)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="card-note lesson-text">
        {last.linear.a === 0 ? (
          <Trans
            i18nKey="alg.trickEndsConst"
            values={{ value: last.linear.b }}
            components={{ b: <strong />, i: <em /> }}
          />
        ) : (
          <Trans i18nKey="alg.trickEndsX" components={{ b: <strong />, i: <em /> }} />
        )}
      </p>

      <Exercise
        promptKey="alg.trickTask"
        isCorrect={Number(answer) === TRICK_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(TRICK_ANSWER)}
        onReveal={() => setAnswer(String(TRICK_ANSWER))}
        hintKey="alg.trickHint"
      >
        <label className="field">
          <span className="field-label">{t('alg.trickAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
