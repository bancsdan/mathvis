import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { circleRegions, complR, inR, interR, unionR, type RegionSet } from '../lib/sets'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

const A = circleRegions(0, 2)
const B = circleRegions(1, 2)

/** The expression the three pill groups currently describe. */
function build(notA: boolean, op: 'and' | 'or', notB: boolean): RegionSet {
  const left = notA ? complR(A, 2) : A
  const right = notB ? complR(B, 2) : B
  return op === 'and' ? interR(left, right) : unionR(left, right)
}

const texOf = (notA: boolean, op: 'and' | 'or', notB: boolean) =>
  `${notA ? '\\overline{A}' : 'A'} ${op === 'and' ? '\\cap' : '\\cup'} ${notB ? '\\overline{B}' : 'B'}`

/** Four multiple-choice options for the exercise, one of them right. */
const CHOICES: Array<{ id: string; tex: string; value: RegionSet }> = [
  { id: 'union', tex: 'A \\cup B', value: unionR(A, B) },
  { id: 'inter', tex: 'A \\cap B', value: interR(A, B) },
  { id: 'nand', tex: '\\overline{A \\cap B}', value: complR(interR(A, B), 2) },
  { id: 'diff', tex: 'A \\setminus B', value: interR(A, complR(B, 2)) },
]
const TASK = CHOICES[2]

export function SetsLogicCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [notA, setNotA] = useState(false)
  const [op, setOp] = useState<'and' | 'or'>('and')
  const [notB, setNotB] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const [choice, setChoice] = useState<string | null>(null)

  const value = build(notA, op, notB)

  // The two sides of De Morgan, computed rather than asserted.
  const left = complR(interR(A, B), 2)
  const right = unionR(complR(A, 2), complR(B, 2))

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.logicTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.logicIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="sets.logicIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('sets.logicBuilderAria')}>
        <button type="button" className={notA ? 'pill active' : 'pill'} aria-pressed={notA} onClick={() => setNotA(!notA)}>
          {t('sets.logicNot')} A
        </button>
        <button type="button" className={op === 'and' ? 'pill active' : 'pill'} aria-pressed={op === 'and'} onClick={() => setOp('and')}>
          {t('sets.logicAnd')}
        </button>
        <button type="button" className={op === 'or' ? 'pill active' : 'pill'} aria-pressed={op === 'or'} onClick={() => setOp('or')}>
          {t('sets.logicOr')}
        </button>
        <button type="button" className={notB ? 'pill active' : 'pill'} aria-pressed={notB} onClick={() => setNotB(!notB)}>
          {t('sets.logicNot')} B
        </button>
      </div>

      <div className="venn-row">
        <VennDiagram n={2} shaded={value} highlight={hovered} onHoverRegion={setHovered} height={240} />
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>
                  <Tex tex="x \in A" />
                </th>
                <th>
                  <Tex tex="x \in B" />
                </th>
                <th>
                  <Tex tex={texOf(notA, op, notB)} />
                </th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3].map((sig) => (
                <tr
                  key={sig}
                  onMouseEnter={() => setHovered(sig)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ background: hovered === sig ? 'var(--hover-wash)' : undefined }}
                >
                  <td>{t(sig & 1 ? 'sets.logicTrue' : 'sets.logicFalse')}</td>
                  <td>{t(sig & 2 ? 'sets.logicTrue' : 'sets.logicFalse')}</td>
                  <td>{t(inR(value, sig) ? 'sets.logicTrue' : 'sets.logicFalse')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="card-note">{t('sets.logicRowHint')}</p>
        </div>
      </div>

      <p className="mini-title">{t('sets.logicDeMorganTitle')}</p>
      <div className="venn-row">
        <div>
          <Tex block tex="\overline{A \cap B}" />
          <VennDiagram n={2} shaded={left} height={190} labelKey="venn.ariaDeMorganLeft" />
        </div>
        <div>
          <Tex block tex="\overline{A} \cup \overline{B}" />
          <VennDiagram n={2} shaded={right} height={190} labelKey="venn.ariaDeMorganRight" />
        </div>
      </div>
      <p className="alias-verdict verdict-ok">{t(left === right ? 'sets.logicDeMorganSame' : 'sets.logicDeMorganDiffer')}</p>

      <Exercise
        promptKey="sets.logicTask"
        isCorrect={choice === TASK.id}
        canCheck={choice !== null}
        answerKey={choice ?? ''}
        solutionKey={TASK.id}
        onReveal={() => setChoice(TASK.id)}
        hintKey="sets.logicHint"
      >
        <VennDiagram n={2} shaded={TASK.value} height={210} labelKey="venn.ariaTask" />
        <div className="pill-row" role="group" aria-label={t('sets.logicChoiceAria')}>
          {CHOICES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={choice === c.id ? 'pill active' : 'pill'}
              aria-pressed={choice === c.id}
              onClick={() => setChoice(c.id)}
            >
              <Tex tex={c.tex} />
            </button>
          ))}
        </div>
        <p className="card-note">{t('sets.logicRegionsHint', { regions: [0, 1, 2, 3].filter((s) => inR(TASK.value, s)).length })}</p>
      </Exercise>
    </section>
  )
}
