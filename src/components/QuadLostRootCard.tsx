import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LOST_ROOT, LOST_ROOT_ANSWER } from '../lib/quadratic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** The two numbers worth trying in `x² = 4x`, in the order the buttons offer them. */
const CANDIDATES = [0, 4] as const

/**
 * Az elveszett gyök.
 *
 * `x² = 4x` divided by x gives one root; factored it gives two. Substituting
 * each candidate back into the original equation is what settles the argument:
 * both make it true, so the shorter route was simply wrong.
 */
export function QuadLostRootCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [candidate, setCandidate] = useState<number>(0)
  const [ansA, setAnsA] = useState('')
  const [ansB, setAnsB] = useState('')

  const [solA, solB] = LOST_ROOT_ANSWER.split('|')
  const typed = [ansA, ansB].map(Number)
  const answered = ansA.trim() !== '' && ansB.trim() !== '' && typed.every(Number.isFinite)
  const answerKey = answered ? [...typed].sort((a, b) => a - b).join('|') : `${ansA}|${ansB}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.lostrootIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['quad.lostrootDef1', 'quad.lostrootDef2']} />
      </div>

      <Tex block tex="x^2 = 4x" />

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('quad.lostrootWrong')}</th>
              <th>{t('quad.lostrootRight')}</th>
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
              <td>{t('quad.lostrootOne')}</td>
              <td>
                <Tex tex={`x = 0 \\text{ ${t('quad.orWord')} } x = 4`} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.lostrootTryAria')}>
        {CANDIDATES.map((value) => (
          <button
            key={value}
            type="button"
            className={candidate === value ? 'pill active' : 'pill'}
            aria-pressed={candidate === value}
            onClick={() => setCandidate(value)}
          >
            {t('quad.lostrootTry', { x: value })}
          </button>
        ))}
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="quad.lostrootCheck"
          values={{
            x: candidate,
            left: candidate * candidate,
            right: 4 * candidate,
            fate: t(candidate === 0 ? 'quad.lostrootFate_lost' : 'quad.lostrootFate_kept'),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="quad.lostrootTask"
        isCorrect={answerKey === LOST_ROOT_ANSWER}
        canCheck={answered}
        answerKey={answerKey}
        solutionKey={LOST_ROOT_ANSWER}
        onReveal={() => {
          setAnsA(solA)
          setAnsB(solB)
        }}
        hintKey="quad.lostrootHint"
      >
        <Tex block tex="x^2 = 3x" />
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('quad.lostrootAnswer1')}</span>
            <input
              className="answer-input"
              type="number"
              value={ansA}
              onChange={(e) => setAnsA(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('quad.lostrootAnswer2')}</span>
            <input
              className="answer-input"
              type="number"
              value={ansB}
              onChange={(e) => setAnsB(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
