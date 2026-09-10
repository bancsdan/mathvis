import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  completeEdgeCount,
  completeGraphEdges,
  degreeSum,
  degrees,
  toggleEdge,
  type Edge,
} from '../lib/combinatorics'
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

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/**
 * `selectSectionId` defaults to the sibling explorer this card links back to,
 * so the card fits the `ComponentType<{ id: string }>` shape the registry
 * renders every explorer with.
 */
export function CombiGraphCard({
  id,
  selectSectionId = 'combi-select',
}: {
  id: string
  selectSectionId?: string
}) {
  const { t } = useTranslation()
  const [n, setN] = useState(5)
  const [edges, setEdges] = useState<Edge[]>(START)
  const [first, setFirst] = useState<number | null>(null)
  const [second, setSecond] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')

  const vertices = Array.from({ length: n }, (_, i) => i)
  const deg = degrees(n, edges)

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
        <h2>{t('combi.graphTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="combi.graphIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="combi.graphDef" />
        <p className="card-note">
          <Trans i18nKey="combi.graphIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
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
          <span className="stat-label">{t('combi.graphStatDegreeSum')}</span>
          <span className="stat-value">{degreeSum(n, edges)}</span>
        </div>
      </div>
      <p className="card-note lesson-text">
        {t('combi.graphDegreesLine', { list: deg.map((d, i) => `${i + 1}: ${d}`).join(', ') })}
      </p>
      <Tex block tex={`${deg.join(' + ')} = ${degreeSum(n, edges)} = 2 \\cdot ${edges.length}`} />
      <p className="card-note lesson-text">
        <Trans i18nKey="combi.graphHandshake" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('combi.graphCompleteTitle')}</p>
      <Definition i18nKey="combi.graphCompleteDef" />
      <Tex block tex={`\\frac{${n} \\cdot ${n - 1}}{2} = \\binom{${n}}{2} = ${completeEdgeCount(n)}`} />
      <p className="card-note lesson-text">
        <Trans i18nKey="combi.graphCompleteNote" components={{ b: <strong />, i: <em /> }} />
      </p>
      <div className="pill-row">
        <button type="button" className="btn" onClick={() => scrollToSection(selectSectionId)}>
          {t('combi.graphToSelect')}
        </button>
      </div>

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
