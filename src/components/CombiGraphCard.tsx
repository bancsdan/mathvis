import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { completeEdgeCount, completeGraphEdges, toggleEdge, type Edge } from '../lib/combinatorics'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { GraphDiagram } from './GraphDiagram'
import { Tex } from './Tex'

const START: Edge[] = [
  [0, 1],
  [1, 2],
  [2, 3],
]

const ANSWER = completeEdgeCount(7)

export function CombiGraphCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [n, setN] = useState(5)
  const [edges, setEdges] = useState<Edge[]>(START)
  const [first, setFirst] = useState<number | null>(null)
  const [second, setSecond] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')

  const vertices = Array.from({ length: n }, (_, i) => i)

  const changeN = (next: number) => {
    setN(next)
    setEdges(edges.filter(([a, b]) => a < next && b < next))
    setFirst(null)
    setSecond(null)
  }

  const clickVertex = (i: number) => {
    if (first === null) setFirst(i)
    else if (first === i) setFirst(null)
    else {
      setEdges(toggleEdge(edges, first, i))
      setFirst(null)
    }
  }

  const canToggle = first !== null && second !== null && first !== second

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('combi.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.graphIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="combi.graphDef" />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('combi.graphPickN')} <strong>{n}</strong>
          </span>
          <input type="range" min={3} max={8} step={1} value={n} onChange={(e) => changeN(Number(e.target.value))} />
        </label>
      </div>

      <GraphDiagram
        n={n}
        edges={edges}
        showDegrees
        selected={first}
        onVertexClick={clickVertex}
        ariaLabel={t('combi.graphDiagramAria', { n, total: edges.length })}
      />

      <div className="pill-row" role="group" aria-label={t('combi.graphFirstVertex')}>
        <span className="field-label">{t('combi.graphFirstVertex')}</span>
        {vertices.map((i) => (
          <button
            key={i}
            type="button"
            className={first === i ? 'pill active' : 'pill'}
            aria-pressed={first === i}
            onClick={() => setFirst(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="pill-row" role="group" aria-label={t('combi.graphSecondVertex')}>
        <span className="field-label">{t('combi.graphSecondVertex')}</span>
        {vertices.map((i) => (
          <button
            key={i}
            type="button"
            className={second === i ? 'pill active' : 'pill'}
            aria-pressed={second === i}
            onClick={() => setSecond(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="pill-row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canToggle}
          onClick={() => {
            if (first !== null && second !== null) setEdges(toggleEdge(edges, first, second))
          }}
        >
          {t('combi.graphToggle')}
        </button>
        <button type="button" className="btn" onClick={() => setEdges(completeGraphEdges(n))}>
          {t('combi.graphComplete')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEdges([])
            setFirst(null)
            setSecond(null)
          }}
        >
          {t('combi.graphClear')}
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">{t('combi.graphStatEdges')}</span>
          <span className="stat-value">{edges.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('combi.graphStatComplete')}</span>
          <span className="stat-value">{completeEdgeCount(n)}</span>
        </div>
      </div>
      <Tex block tex={`\\frac{${n} \\cdot ${n - 1}}{2} = \\binom{${n}}{2} = ${completeEdgeCount(n)}`} />
      <p className="lin-result">
        {t('combi.graphResult', { edges: edges.length, complete: completeEdgeCount(n), n })}
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="combi.graphCompleteNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="combi.graphTask"
        isCorrect={Number(answer) === ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ANSWER)}
        onReveal={() => setAnswer(String(ANSWER))}
        hintKey="combi.graphHint"
      >
        <label className="field">
          <span className="field-label">{t('combi.graphAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
