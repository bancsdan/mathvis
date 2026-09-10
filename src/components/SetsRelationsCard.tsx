import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { PREDICATES, predicateById, relationOf, selectBy, type Relation } from '../lib/sets'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** Where the two circles sit for each relation, as fractions of the box. */
const LAYOUT: Record<Relation, { a: [number, number, number]; b: [number, number, number] }> = {
  disjoint: { a: [0.27, 0.5, 0.2], b: [0.73, 0.5, 0.2] },
  overlap: { a: [0.4, 0.5, 0.24], b: [0.6, 0.5, 0.24] },
  subsetAB: { a: [0.5, 0.55, 0.14], b: [0.5, 0.5, 0.3] },
  subsetBA: { a: [0.5, 0.5, 0.3], b: [0.5, 0.55, 0.14] },
  equal: { a: [0.5, 0.5, 0.26], b: [0.5, 0.5, 0.26] },
}

const TEX: Record<Relation, string> = {
  disjoint: 'A \\cap B = \\emptyset',
  overlap: 'A \\cap B \\neq \\emptyset',
  subsetAB: 'A \\subseteq B',
  subsetBA: 'B \\subseteq A',
  equal: 'A = B',
}

/** Two circles arranged to show the relation, rather than a fixed Venn. */
function EulerSchematic({ relation }: { relation: Relation }) {
  const { t } = useTranslation()
  const w = 260
  const h = 150
  const { a, b } = LAYOUT[relation]
  const scale = Math.min(w, h)
  const circle = (spec: [number, number, number]) => ({
    cx: spec[0] * w,
    cy: spec[1] * h,
    r: spec[2] * scale,
  })
  const ca = circle(a)
  const cb = circle(b)
  // Draw the larger one first so the nested case reads correctly.
  const order = ca.r >= cb.r ? ([1, 0] as const) : ([0, 1] as const)
  const specs = [
    { c: ca, label: 'A', color: 'var(--series-1)' },
    { c: cb, label: 'B', color: 'var(--series-2)' },
  ]

  return (
    <svg width={w} height={h} role="img" aria-label={t(`sets.rel_${relation}`)}>
      {order.map((i) => (
        <circle
          key={i}
          cx={specs[i].c.cx}
          cy={specs[i].c.cy}
          r={specs[i].c.r}
          fill={specs[i].color}
          fillOpacity={0.12}
          stroke={specs[i].color}
          strokeWidth={2}
        />
      ))}
      {order.map((i) => (
        <text
          key={`l${i}`}
          x={specs[i].c.cx}
          y={specs[i].c.cy - specs[i].c.r + 16}
          textAnchor="middle"
          className="point-label"
          fill={specs[i].color}
        >
          {specs[i].label}
        </text>
      ))}
    </svg>
  )
}

export function SetsRelationsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [aId, setAId] = useState('even')
  const [bId, setBId] = useState('gt6')
  const [exA, setExA] = useState('even')
  const [exB, setExB] = useState('even')

  const setA = selectBy(predicateById(aId))
  const setB = selectBy(predicateById(bId))
  const relation = relationOf(setA, setB)

  const exRelation = relationOf(selectBy(predicateById(exA)), selectBy(predicateById(exB)))
  // The task asks for a proper subset, so equality must not count.
  const exCorrect = exRelation === 'subsetAB'

  const picker = (value: string, onChange: (v: string) => void, labelKey: string) => (
    <label className="field">
      <span className="field-label">{t(labelKey)}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {PREDICATES.map((p) => (
          <option key={p.id} value={p.id}>
            {t(p.labelKey)}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.q2')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.relIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="sets.relDef" />
      </div>

      <div className="controls-inline">
        {picker(aId, setAId, 'sets.relPickA')}
        {picker(bId, setBId, 'sets.relPickB')}
      </div>

      <div className="venn-row">
        <div>
          <EulerSchematic relation={relation} />
        </div>
        <div>
          <div className="stats">
            <div className="stat">
              <span className="stat-label">
                <Tex tex="|A|" />
              </span>
              <span className="stat-value">{setA.size}</span>
            </div>
            <div className="stat">
              <span className="stat-label">
                <Tex tex="|B|" />
              </span>
              <span className="stat-value">{setB.size}</span>
            </div>
            <div className="stat">
              <span className="stat-label">
                <Tex tex="|A \cap B|" />
              </span>
              <span className="stat-value">{[...setA].filter((x) => setB.has(x)).length}</span>
            </div>
          </div>
          <Tex block tex={TEX[relation]} />
          <p className="lin-result">{t(`sets.rel_${relation}`)}</p>
        </div>
      </div>

      <Exercise
        promptKey="sets.relTask"
        isCorrect={exCorrect}
        canCheck
        answerKey={`${exA}|${exB}`}
        solutionKey="div6|even"
        onReveal={() => {
          setExA('div6')
          setExB('even')
        }}
        hintKey="sets.relHint"
      >
        <div className="controls-inline">
          {picker(exA, setExA, 'sets.relPickA')}
          {picker(exB, setExB, 'sets.relPickB')}
        </div>
        <p className="card-note">{t(`sets.rel_${exRelation}`)}</p>
      </Exercise>
    </section>
  )
}
