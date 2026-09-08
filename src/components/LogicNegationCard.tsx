import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { idsWhere, logicPredicateById, negate } from '../lib/logic'
import { UNIVERSE, type Elem } from '../lib/sets'
import { Exercise } from './Exercise'
import { LogicPredicateSelect } from './LogicPredicateSelect'
import { SetsElementGrid } from './SetsElementGrid'
import { Tex } from './Tex'

/** The exercise: pick the negation of "greater than 6". Only one selects the complement. */
const CHOICES: ReadonlyArray<{ id: string; labelKey: string; test: (e: Elem) => boolean }> = [
  { id: 'lt6', labelKey: 'logic.negChoiceLt6', test: (e) => e.id < 6 },
  { id: 'le6', labelKey: 'logic.negChoiceLe6', test: (e) => e.id <= 6 },
  { id: 'notGt7', labelKey: 'logic.negChoiceNotGt7', test: (e) => !(e.id > 7) },
  { id: 'lt7', labelKey: 'logic.negChoiceLt7', test: (e) => e.id < 7 },
]
const ORIGINAL = logicPredicateById('gt6')
const TASK_ID = 'le6'

/** The common phrasings of a negation, side by side with the naive guess. */
const PAIRS = ['gt', 'and', 'all', 'some'] as const

export function LogicNegationCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [predId, setPredId] = useState('even')
  const [nots, setNots] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)

  const base = logicPredicateById(predId)
  const current = nots === 1 ? negate(base) : base
  const selected = new Set(idsWhere(current.test))

  const prefix = '\\neg '.repeat(nots)
  const chosen = CHOICES.find((c) => c.id === choice) ?? null

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.negTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.negIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="logic.negIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <LogicPredicateSelect value={predId} onChange={setPredId} labelKey="logic.negPick" />
        <div className="pill-row" role="group" aria-label={t('logic.negNotsAria')}>
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              type="button"
              className={nots === n ? 'pill active' : 'pill'}
              aria-pressed={nots === n}
              onClick={() => setNots(n)}
            >
              {t(`logic.negNots${n}`)}
            </button>
          ))}
        </div>
      </div>

      <Tex block tex={`${prefix}P${nots === 2 ? ' = P' : ''}`} />
      <p className="alias-verdict">
        {nots === 0 && t('logic.negSentence0', { p: t(base.labelKey) })}
        {nots === 1 && t('logic.negSentence1', { p: t(base.labelKey) })}
        {nots === 2 && t('logic.negSentence2', { p: t(base.labelKey) })}
      </p>
      <SetsElementGrid framed selected={selected} onToggle={() => {}} />
      <p className="card-note lesson-text">
        <Trans
          i18nKey="logic.negCount"
          values={{ n: selected.size, rest: UNIVERSE.length - selected.size }}
          components={{ b: <strong /> }}
        />
      </p>

      <p className="mini-title">{t('logic.negPairsTitle')}</p>
      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('logic.negColStatement')}</th>
              <th>{t('logic.negColWrong')}</th>
              <th>{t('logic.negColRight')}</th>
            </tr>
          </thead>
          <tbody>
            {PAIRS.map((k) => (
              <tr key={k}>
                <td>{t(`logic.negPair_${k}_s`)}</td>
                <td className="cell-bad">{t(`logic.negPair_${k}_w`)}</td>
                <td className="cell-ok">{t(`logic.negPair_${k}_r`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Exercise
        promptKey="logic.negTask"
        isCorrect={choice === TASK_ID}
        canCheck={choice !== null}
        answerKey={choice ?? ''}
        solutionKey={TASK_ID}
        onReveal={() => setChoice(TASK_ID)}
        hintKey="logic.negHint"
      >
        <div className="pill-row" role="group" aria-label={t('logic.negChoiceAria')}>
          {CHOICES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={choice === c.id ? 'pill active' : 'pill'}
              aria-pressed={choice === c.id}
              onClick={() => setChoice(c.id)}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
        <p className="card-note">{t('logic.negTaskOriginal')}</p>
        <SetsElementGrid selected={new Set(idsWhere(ORIGINAL.test))} onToggle={() => {}} />
        {chosen && (
          <>
            <p className="card-note">{t('logic.negTaskChosen', { text: t(chosen.labelKey) })}</p>
            <SetsElementGrid selected={new Set(idsWhere(chosen.test))} onToggle={() => {}} />
          </>
        )}
      </Exercise>
    </section>
  )
}
