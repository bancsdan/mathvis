import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { buildChoiceTree, productOf } from '../lib/combinatorics'
import { ChoiceTree } from './ChoiceTree'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** What each step of the dressing-up example chooses. */
const LEVEL_KEYS = ['shirt', 'trousers', 'shoes', 'cap'] as const

const SIZES = [2, 3, 4]
const ANSWER = 3 * 4 * 2

export function CombiProductCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [sizes, setSizes] = useState<number[]>([2, 3])
  const [answer, setAnswer] = useState('')

  const levels = sizes.map((size, level) =>
    Array.from({ length: size }, (_, i) => `${t(`combi.prodLevel_${LEVEL_KEYS[level]}`)} ${i + 1}`),
  )
  const nodes = buildChoiceTree(levels)
  const total = productOf(sizes)

  const setSize = (level: number, size: number) => setSizes(sizes.map((s, i) => (i === level ? size : s)))

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.q1')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.prodIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        {sizes.map((size, level) => (
          <label className="field" key={LEVEL_KEYS[level]}>
            <span className="field-label">{t(`combi.prodLevel_${LEVEL_KEYS[level]}`)}</span>
            <select value={size} onChange={(e) => setSize(level, Number(e.target.value))}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="pill-row">
        <button
          type="button"
          className="btn"
          disabled={sizes.length >= LEVEL_KEYS.length}
          onClick={() => setSizes([...sizes, 2])}
        >
          {t('combi.prodAddLevel')}
        </button>
        <button type="button" className="btn" disabled={sizes.length <= 2} onClick={() => setSizes(sizes.slice(0, -1))}>
          {t('combi.prodRemoveLevel')}
        </button>
      </div>

      <ChoiceTree
        nodes={nodes}
        maxDepth={sizes.length}
        ariaLabel={t('combi.prodTreeAria', { steps: sizes.length, total })}
        tooManyLabel={t('combi.prodTooMany', { total })}
      />

      <Tex block tex={`${sizes.join(' \\cdot ')} = ${total}`} />
      <p className="lin-result">{t('combi.prodLeaves', { total })}</p>

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.prodRule" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="combi.prodTask"
        isCorrect={Number(answer) === ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ANSWER)}
        onReveal={() => setAnswer(String(ANSWER))}
        hintKey="combi.prodHint"
      >
        <label className="field">
          <span className="field-label">{t('combi.prodAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
