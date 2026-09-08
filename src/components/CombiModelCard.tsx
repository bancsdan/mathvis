import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  circulantEdges,
  completeEdgeCount,
  degrees,
  GRAPH_STORIES,
  GRAPH_STORY_ANSWER,
  regularGraphPossible,
  STORY_GRAPH_EDGES,
  STORY_GRAPH_PEOPLE,
} from '../lib/combinatorics'
import { Exercise } from './Exercise'
import { GraphDiagram } from './GraphDiagram'
import { Tex } from './Tex'

const ANSWER = completeEdgeCount(6)

export function CombiModelCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [n, setN] = useState(5)
  const [d, setD] = useState(2)
  const [story, setStory] = useState('')
  const [answer, setAnswer] = useState('')

  const verdict = regularGraphPossible(n, d)
  const edges = circulantEdges(n, d)

  const storyLabels = STORY_GRAPH_PEOPLE.map((p) => t(`combi.person_${p}`))
  const storyDegrees = degrees(STORY_GRAPH_PEOPLE.length, [...STORY_GRAPH_EDGES])

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.modelTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.modelIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <p className="mini-title">{t('combi.modelParityTitle')}</p>
      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('combi.modelPickN')}</span>
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {[3, 4, 5, 6, 7, 8].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('combi.modelPickD')}</span>
          <select value={d} onChange={(e) => setD(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="card-note lesson-text">{t('combi.modelParityQuestion', { n, d })}</p>

      <p className={`alias-verdict ${verdict.possible ? 'verdict-ok' : 'verdict-bad'}`} role="status" aria-live="polite">
        {t(`combi.modelReason_${verdict.reason}`, { n, d, sum: n * d, edges: (n * d) / 2 })}
      </p>

      {verdict.possible ? (
        <>
          <GraphDiagram
            n={n}
            edges={edges}
            showDegrees
            ariaLabel={t('combi.modelParityAria', { n, d })}
          />
          <Tex block tex={`\\frac{${n} \\cdot ${d}}{2} = ${(n * d) / 2}`} />
        </>
      ) : (
        <Tex block tex={`${n} \\cdot ${d} = ${n * d}`} />
      )}

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.modelParityNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('combi.modelStoryTitle')}</p>
      <p className="card-note lesson-text">{t('combi.modelStoryIntro')}</p>
      <GraphDiagram
        n={STORY_GRAPH_PEOPLE.length}
        edges={[...STORY_GRAPH_EDGES]}
        labels={storyLabels}
        showDegrees
        ariaLabel={t('combi.modelStoryAria')}
        height={260}
      />
      <p className="card-note lesson-text">
        {t('combi.modelDegreeList', {
          list: storyLabels.map((name, i) => `${name}: ${storyDegrees[i]}`).join(', '),
        })}
      </p>

      <Exercise
        promptKey="combi.modelStoryTask"
        isCorrect={story === GRAPH_STORY_ANSWER}
        canCheck={story !== ''}
        answerKey={story}
        solutionKey={GRAPH_STORY_ANSWER}
        onReveal={() => setStory(GRAPH_STORY_ANSWER)}
        hintKey="combi.modelStoryHint"
      >
        <div className="pill-row" role="group" aria-label={t('combi.modelStoryAriaPick')}>
          {GRAPH_STORIES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={story === s.id ? 'pill active' : 'pill'}
              aria-pressed={story === s.id}
              onClick={() => setStory(s.id)}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      </Exercise>

      <Exercise
        promptKey="combi.modelTask"
        isCorrect={Number(answer) === ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ANSWER)}
        onReveal={() => setAnswer(String(ANSWER))}
        hintKey="combi.modelHint"
      >
        <label className="field">
          <span className="field-label">{t('combi.modelAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
