import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { popcount, regionTex, sieveTerms, sieveTotal, timesCounted, unionSize } from '../lib/sets'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

const START_2 = [4, 5, 6, 3]
const START_3 = [2, 4, 3, 2, 5, 1, 2, 3]

/** Circle names for a subset mask, e.g. 0b011 becomes "A ∩ B". */
const maskTex = (mask: number): string =>
  ['A', 'B', 'C'].filter((_, i) => (mask >> i) & 1).join(' \\cap ')

export function SetsCountingCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [n, setN] = useState<2 | 3>(2)
  const [counts2, setCounts2] = useState(START_2)
  const [counts3, setCounts3] = useState(START_3)
  const [depth, setDepth] = useState(0)

  // The word problem: 30 students, 18 football, 15 swimming, 7 both.
  const [neither, setNeither] = useState('')

  const counts = n === 2 ? counts2 : counts3
  const setCounts = n === 2 ? setCounts2 : setCounts3

  const terms = sieveTerms(counts, n)
  const shownTerms = terms.filter((term) => popcount(term.mask) <= depth)
  const running = shownTerms.reduce((acc, term) => acc + term.sign * term.size, 0)

  // What each region's running count is after the terms revealed so far. At full
  // depth every one of them must read exactly 1.
  const badges = Array.from({ length: 1 << n }, (_, sig) =>
    depth === 0 || sig === 0 ? null : `×${timesCounted(sig, depth)}`,
  )

  const setCount = (sig: number, value: number) => {
    const next = [...counts]
    next[sig] = Math.max(0, value)
    setCounts(next)
  }

  const total = sieveTotal(counts, n)
  const plain = unionSize(counts, n)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.countIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('sets.opsSetCount')}</span>
          <select
            value={n}
            onChange={(e) => {
              setN(Number(e.target.value) as 2 | 3)
              setDepth(0)
            }}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">
            {t('sets.countStep')} <strong>{depth}</strong> / {n}
          </span>
          <input type="range" min={0} max={n} step={1} value={depth} onChange={(e) => setDepth(Number(e.target.value))} />
        </label>
      </div>

      <VennDiagram n={n} shaded={0} counts={counts} badges={badges} height={300} />


      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>{t('sets.countThRegion')}</th>
              <th>{t('sets.countThCount')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 1 << n }, (_, sig) => (
              <tr key={sig}>
                <td>
                  <Tex tex={regionTex(sig, n)} />
                </td>
                <td>
                  <input
                    className="count-input"
                    type="number"
                    min={0}
                    value={counts[sig]}
                    aria-label={t('sets.countInputAria', { region: sig })}
                    onChange={(e) => setCount(sig, Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Tex
        block
        tex={
          shownTerms.length === 0
            ? '\\ ?'
            : shownTerms
                .map((term, i) => `${i === 0 ? '' : term.sign === 1 ? '+' : '-'}\\,|${maskTex(term.mask)}|`)
                .join(' ') +
              ` = ${shownTerms.map((term, i) => `${i === 0 ? '' : term.sign === 1 ? '+' : '-'}\\,${term.size}`).join(' ')} = ${running}`
        }
      />

      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('sets.countSieveTotal')}</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('sets.countPlainTotal')}</span>
          <span className="stat-value">{plain}</span>
        </div>
      </div>
      <p className="lin-result">
        {t(depth === 0 ? 'sets.countStep0' : depth < n ? 'sets.countStepMid' : 'sets.countStepDone')}
      </p>

      <Exercise
        promptKey="sets.countTask"
        promptValues={{ all: 30, foot: 18, swim: 15, both: 7 }}
        isCorrect={Number(neither) === 30 - (18 + 15 - 7)}
        canCheck={neither.trim() !== ''}
        answerKey={neither}
        solutionKey={String(30 - (18 + 15 - 7))}
        onReveal={() => setNeither(String(30 - (18 + 15 - 7)))}
        hintKey="sets.countHint"
      >
        <label className="field">
          <span className="field-label">{t('sets.countAnswerLabel')}</span>
          <input
            className="answer-input"
            type="number"
            value={neither}
            onChange={(e) => setNeither(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
