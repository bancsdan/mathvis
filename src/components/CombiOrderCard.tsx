import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  allPermutations,
  buildPermutationTree,
  distinctPermutations,
  factorial,
  multisetPermutationCount,
  PEOPLE,
} from '../lib/combinatorics'
import { ChoiceTree } from './ChoiceTree'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const COUNTS = [2, 3, 4, 5]
const SHOWN = 6
const FACT_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/** Letters only, so it needs no translating: two A's that look alike. */
const WORD = 'ALMA'

/** Five on a bench with two of them glued together: 4! orders of the blocks, and the pair can swap. */
const ANSWER = factorial(4) * 2

export function CombiOrderCard({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const [n, setN] = useState(3)
  const [answer, setAnswer] = useState('')

  const names = PEOPLE.slice(0, n).map((p) => t(`combi.person_${p}`))
  const nodes = buildPermutationTree(names)
  const perms = allPermutations(names)
  const shown = perms.length > 8 ? perms.slice(0, SHOWN) : perms

  const anagrams = distinctPermutations(WORD)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.orderTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.orderIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="combi.orderIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('combi.orderPickN')}>
        <span className="field-label">{t('combi.orderPickN')}</span>
        {COUNTS.map((c) => (
          <button
            key={c}
            type="button"
            className={n === c ? 'pill active' : 'pill'}
            aria-pressed={n === c}
            onClick={() => setN(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <ChoiceTree
        nodes={nodes}
        maxDepth={n}
        ariaLabel={t('combi.orderTreeAria', { n, total: perms.length })}
        tooManyLabel={t('combi.orderTooMany', { total: perms.length })}
      />

      <Tex block tex={`${Array.from({ length: n }, (_, i) => n - i).join(' \\cdot ')} = ${n}! = ${perms.length}`} />

      <p className="mini-title">{t('combi.orderListTitle')}</p>
      <div className="table-wrap">
        <table className="paper-table">
          <tbody>
            {shown.map((p, i) => (
              <tr key={p.join('-')}>
                <td>{i + 1}.</td>
                <td>{p.join(' – ')}</td>
              </tr>
            ))}
            {shown.length < perms.length && (
              <tr className="ellipsis-row">
                <td>…</td>
                <td>{t('combi.orderMore', { total: perms.length })}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.orderRule" components={{ b: <strong />, i: <em /> }} />
      </p>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('combi.orderThN')}</th>
              <th>{t('combi.orderThFact')}</th>
            </tr>
          </thead>
          <tbody>
            {FACT_ROWS.map((k) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{factorial(k).toLocaleString(i18n.language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mini-title">{t('combi.orderWordTitle')}</p>
      <p className="card-note lesson-text">
        <Trans
          i18nKey="combi.orderWordIntro"
          values={{ word: WORD, all: factorial(WORD.length), total: multisetPermutationCount(WORD) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>
      <Tex block tex={`\\frac{${factorial(WORD.length)}}{2} = ${multisetPermutationCount(WORD)}`} />
      <p className="card-note lesson-text">{t('combi.orderWordListTitle')}</p>
      <div className="pill-row">
        {anagrams.map((w) => (
          <span key={w} className="pill word-pill">
            {w}
          </span>
        ))}
      </div>

      <Exercise
        promptKey="combi.orderTask"
        promptValues={{ first: t('combi.person_anna'), second: t('combi.person_bence') }}
        isCorrect={Number(answer) === ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ANSWER)}
        onReveal={() => setAnswer(String(ANSWER))}
        hintKey="combi.orderHint"
      >
        <label className="field">
          <span className="field-label">{t('combi.orderAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
