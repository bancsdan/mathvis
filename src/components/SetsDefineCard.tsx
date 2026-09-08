import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { PREDICATES, selectBy, setsEqual, UNIVERSE, predicateById } from '../lib/sets'
import { Exercise } from './Exercise'
import { SetsElementGrid } from './SetsElementGrid'
import { Tex } from './Tex'

const rosterTex = (ids: readonly number[]) =>
  ids.length === 0 ? '\\emptyset' : `\\{${[...ids].sort((a, b) => a - b).join(',\\ ')}\\}`

const keyOf = (s: ReadonlySet<number>) => [...s].sort((a, b) => a - b).join(',')

/** The task: pick the elements divisible by three and greater than six. */
const TASK_ANSWER = new Set(UNIVERSE.filter((e) => e.id % 3 === 0 && e.id > 6).map((e) => e.id))

export function SetsDefineCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<ReadonlySet<number>>(() => selectBy(PREDICATES[0]))
  const [answer, setAnswer] = useState<ReadonlySet<number>>(new Set())

  const toggle = (setter: (next: Set<number>) => void, current: ReadonlySet<number>) => (elemId: number) => {
    const next = new Set(current)
    if (next.has(elemId)) next.delete(elemId)
    else next.add(elemId)
    setter(next)
  }

  // A set given by listing may also happen to be describable by a rule. Saying
  // so is the whole point of the section.
  const matchingRule = useMemo(
    () => PREDICATES.find((p) => setsEqual(selectBy(p), picked)) ?? null,
    [picked],
  )

  const answerKey = keyOf(answer)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.defineTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.defineIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="sets.defineIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">{t('sets.defineRuleSelect')}</span>
          <select
            value={matchingRule?.id ?? ''}
            onChange={(e) => {
              if (e.target.value) setPicked(selectBy(predicateById(e.target.value)))
            }}
          >
            <option value="">{t('sets.defineNoRuleOption')}</option>
            {PREDICATES.map((p) => (
              <option key={p.id} value={p.id}>
                {t(p.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <SetsElementGrid framed selected={picked} onToggle={toggle(setPicked, picked)} />

      <p className="card-note">{t('sets.defineRosterLabel')}</p>
      <Tex block tex={`A = ${rosterTex([...picked])}`} />

      {matchingRule ? (
        <>
          <p className="card-note">{t('sets.defineRuleLabel')}</p>
          <Tex block tex={`A = \\{\\, x \\in U \\;:\\; \\text{${t(matchingRule.labelKey)}} \\,\\}`} />
        </>
      ) : (
        <p className="card-note lesson-text">{t('sets.defineNoRule')}</p>
      )}

      <p className="card-note lesson-text">
        <Trans i18nKey="sets.defineCardinality" values={{ size: picked.size }} components={{ b: <strong /> }} />
      </p>

      <Exercise
        promptKey="sets.defineTask"
        isCorrect={setsEqual(answer, TASK_ANSWER)}
        canCheck={answer.size > 0}
        answerKey={answerKey}
        solutionKey={keyOf(TASK_ANSWER)}
        onReveal={() => setAnswer(new Set(TASK_ANSWER))}
        hintKey="sets.defineHint"
      >
        <SetsElementGrid selected={answer} onToggle={toggle(setAnswer, answer)} />
      </Exercise>
    </section>
  )
}
