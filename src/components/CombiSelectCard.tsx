import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { allPermutations, combinations, factorial, PEOPLE, subsets, variations } from '../lib/combinatorics'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const N = PEOPLE.length
const SHOWN = 6
const ANSWER = combinations(8, 3)

/** The Hungarian lottery: five numbers out of ninety, one ticket a week. */
const LOTTO = combinations(90, 5)
const LOTTO_YEARS = Math.round(LOTTO / 52)

export function CombiSelectCard({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const [k, setK] = useState(3)
  const [ordered, setOrdered] = useState(false)
  const [picked, setPicked] = useState<readonly string[]>([])
  const [answer, setAnswer] = useState('')

  const name = (p: string) => t(`combi.person_${p}`)
  const teams = subsets([...PEOPLE], k)
  const unordered = combinations(N, k)
  const orderedCount = variations(N, k)

  const complete = picked.length === k
  const pickedKey = [...picked].sort().join('|')
  const arrangements = complete ? allPermutations([...picked].sort()) : []
  const shownArrangements = arrangements.length > 8 ? arrangements.slice(0, SHOWN) : arrangements

  const toggle = (p: string) => {
    if (picked.includes(p)) setPicked(picked.filter((x) => x !== p))
    else if (picked.length < k) setPicked([...picked, p])
  }

  const changeK = (next: number) => {
    setK(next)
    setPicked([])
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.selTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.selIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="combi.selIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('combi.selPickK')} <strong>{k}</strong>
          </span>
          <input type="range" min={1} max={N} step={1} value={k} onChange={(e) => changeK(Number(e.target.value))} />
        </label>
      </div>
      <div className="pill-row" role="group" aria-label={t('combi.selOrderAria')}>
        <button
          type="button"
          className={ordered ? 'pill' : 'pill active'}
          aria-pressed={!ordered}
          onClick={() => setOrdered(false)}
        >
          {t('combi.selOrderNo')}
        </button>
        <button
          type="button"
          className={ordered ? 'pill active' : 'pill'}
          aria-pressed={ordered}
          onClick={() => setOrdered(true)}
        >
          {t('combi.selOrderYes')}
        </button>
      </div>

      <div className="elem-grid" role="group" aria-label={t('combi.selPeopleAria')}>
        {PEOPLE.map((p) => (
          <button
            key={p}
            type="button"
            className={picked.includes(p) ? 'elem-btn elem-wide selected' : 'elem-btn elem-wide'}
            aria-pressed={picked.includes(p)}
            onClick={() => toggle(p)}
          >
            {name(p)}
          </button>
        ))}
        <button type="button" className="btn" onClick={() => setPicked([])}>
          {t('combi.selClear')}
        </button>
      </div>

      <p className="mini-title">{t('combi.selTeamsTitle', { k })}</p>
      <div className="table-wrap">
        <table className="paper-table">
          <tbody>
            {teams.map((team) => {
              const key = [...team].sort().join('|')
              return (
                <tr key={key} className={complete && key === pickedKey ? 'row-ok' : undefined}>
                  <td>{team.map(name).join(', ')}</td>
                </tr>
              )
            })}
            <tr className="total-row">
              <td>{t('combi.selTeamsTotal', { total: unordered })}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Tex block tex={`\\binom{${N}}{${k}} = \\frac{${variations(N, k)}}{${k}!} = ${unordered}`} />

      {ordered && (
        <>
          <p className="mini-title">{t('combi.selOrderedTitle')}</p>
          {complete ? (
            <div className="table-wrap">
              <table className="paper-table">
                <tbody>
                  {shownArrangements.map((a, i) => (
                    <tr key={a.join('-')}>
                      <td>{i + 1}.</td>
                      <td>{a.map(name).join(' – ')}</td>
                    </tr>
                  ))}
                  {shownArrangements.length < arrangements.length && (
                    <tr className="ellipsis-row">
                      <td>…</td>
                      <td>{t('combi.selArrMore', { total: arrangements.length })}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="card-note">{t('combi.selPickPrompt', { k })}</p>
          )}
          <Tex block tex={`${unordered} \\cdot ${k}! = ${unordered} \\cdot ${factorial(k)} = ${orderedCount}`} />
          <p className="card-note lesson-text">
            <Trans
              i18nKey="combi.selBridge"
              values={{ k, teams: unordered, each: factorial(k), total: orderedCount }}
              components={{ b: <strong />, i: <em /> }}
            />
          </p>
        </>
      )}

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.selNames" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('combi.selLottoTitle')}</p>
      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('combi.selLottoTickets')}</span>
          <span className="stat-value">{LOTTO.toLocaleString(i18n.language)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('combi.selLottoYears')}</span>
          <span className="stat-value">{LOTTO_YEARS.toLocaleString(i18n.language)}</span>
        </div>
      </div>
      <p className="card-note lesson-text">{t('combi.selLottoNote')}</p>

      <Exercise
        promptKey="combi.selTask"
        isCorrect={Number(answer) === ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ANSWER)}
        onReveal={() => setAnswer(String(ANSWER))}
        hintKey="combi.selHint"
      >
        <label className="field">
          <span className="field-label">{t('combi.selAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
