import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  buildPermutationTree,
  deadEnds,
  stillPossible,
  SUBJECTS,
  TIMETABLE_CONSTRAINTS,
  validTimetables,
  type Subject,
} from '../lib/combinatorics'
import { ChoiceTree } from './ChoiceTree'
import { Exercise } from './Exercise'

const SLOTS = SUBJECTS.length

/** PE last and maths not first: 3! orders of the rest, minus the 2! with maths first. */
const ANSWER = 6 - 2

export function CombiTimetableCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [active, setActive] = useState<readonly string[]>([])
  const [answer, setAnswer] = useState('')

  const label = (s: Subject) => t(`combi.subject_${s}`)
  const labels = SUBJECTS.map(label)
  const bySubject = new Map(labels.map((l, i) => [l, SUBJECTS[i]]))

  const constraints = TIMETABLE_CONSTRAINTS.filter((c) => active.includes(c.id)).map((c) => c.constraint)
  const nodes = buildPermutationTree(labels, (prefix) => {
    const order = prefix.map((l) => bySubject.get(l) as Subject)
    return constraints.every((c) => stillPossible(order, c, SLOTS))
  })
  const dead = deadEnds(nodes, SLOTS)
  const valid = validTimetables(constraints)

  const toggle = (cid: string) =>
    setActive(active.includes(cid) ? active.filter((x) => x !== cid) : [...active, cid])

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.ttTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.ttIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="combi.ttIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('combi.ttPickAria')}>
        {TIMETABLE_CONSTRAINTS.map((c) => (
          <label key={c.id} className="checkbox-inline">
            <input type="checkbox" checked={active.includes(c.id)} onChange={() => toggle(c.id)} />
            {t(c.labelKey)}
          </label>
        ))}
      </div>

      <ChoiceTree
        nodes={nodes}
        maxDepth={SLOTS}
        dead={dead}
        ariaLabel={t('combi.ttTreeAria', { total: valid.length })}
        tooManyLabel={t('combi.ttTooMany', { total: valid.length })}
      />

      <p className="card-note lesson-text">{t('combi.ttDead')}</p>

      <p className="mini-title">{t('combi.ttValidTitle')}</p>
      {valid.length === 0 ? (
        <p className="alias-verdict verdict-bad">{t('combi.ttNone')}</p>
      ) : (
        <ul className="sentence-list">
          {valid.map((order) => (
            <li key={order.join('-')} className="sentence-row">
              <span className="sentence-text">
                {order.map((s, i) => (
                  <span key={s} className="tt-slot">
                    {i + 1}. {label(s)}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('combi.ttStatValid')}</span>
          <span className="stat-value">{valid.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('combi.ttStatAll')}</span>
          <span className="stat-value">24</span>
        </div>
      </div>

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.ttSplit" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="combi.ttTask"
        isCorrect={Number(answer) === ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ANSWER)}
        onReveal={() => setAnswer(String(ANSWER))}
        hintKey="combi.ttHint"
      >
        <label className="field">
          <span className="field-label">{t('combi.ttAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
