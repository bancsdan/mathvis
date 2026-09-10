import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { circleRegions, complR, inR, interR, unionR, type RegionSet } from '../lib/sets'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

const A = circleRegions(0, 2)
const B = circleRegions(1, 2)

type Law = 'inter' | 'union'

const LAWS: readonly Law[] = ['inter', 'union']

/**
 * Both sides of both laws, computed from the regions rather than asserted, so
 * the two pictures can only agree if the law really holds.
 */
const SIDES: Record<Law, { left: RegionSet; right: RegionSet; leftTex: string; rightTex: string }> = {
  inter: {
    left: complR(interR(A, B), 2),
    right: unionR(complR(A, 2), complR(B, 2)),
    leftTex: '\\overline{A \\cap B}',
    rightTex: '\\overline{A} \\cup \\overline{B}',
  },
  union: {
    left: complR(unionR(A, B), 2),
    right: interR(complR(A, 2), complR(B, 2)),
    leftTex: '\\overline{A \\cup B}',
    rightTex: '\\overline{A} \\cap \\overline{B}',
  },
}

/** Four multiple-choice options for the exercise, one of them right. */
const CHOICES: Array<{ id: string; tex: string; value: RegionSet }> = [
  { id: 'union', tex: 'A \\cup B', value: unionR(A, B) },
  { id: 'inter', tex: 'A \\cap B', value: interR(A, B) },
  { id: 'nand', tex: '\\overline{A \\cap B}', value: complR(interR(A, B), 2) },
  { id: 'diff', tex: 'A \\setminus B', value: interR(A, complR(B, 2)) },
]
const TASK = CHOICES[2]

export function SetsDeMorganCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [law, setLaw] = useState<Law>('inter')
  const [choice, setChoice] = useState<string | null>(null)

  const sides = SIDES[law]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.dmIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('sets.dmLawAria')}>
        {LAWS.map((l) => (
          <button
            key={l}
            type="button"
            className={law === l ? 'pill active' : 'pill'}
            aria-pressed={law === l}
            onClick={() => setLaw(l)}
          >
            {t(`sets.dmLaw_${l}`)}
          </button>
        ))}
      </div>

      <div className="venn-row">
        <div>
          <Tex block tex={sides.leftTex} />
          <VennDiagram n={2} shaded={sides.left} height={190} labelKey={`sets.dmAria_${law}_left`} />
        </div>
        <div>
          <Tex block tex={sides.rightTex} />
          <VennDiagram n={2} shaded={sides.right} height={190} labelKey={`sets.dmAria_${law}_right`} />
        </div>
      </div>

      <p className="lin-result">{t(sides.left === sides.right ? 'sets.dmSame' : 'sets.dmDiffer')}</p>

      <p className="card-note lesson-text">
        <Trans i18nKey="sets.dmNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="sets.dmTask"
        isCorrect={choice === TASK.id}
        canCheck={choice !== null}
        answerKey={choice ?? ''}
        solutionKey={TASK.id}
        onReveal={() => setChoice(TASK.id)}
        hintKey="sets.dmHint"
      >
        <VennDiagram n={2} shaded={TASK.value} height={210} labelKey="venn.ariaTask" />
        <div className="pill-row" role="group" aria-label={t('sets.dmChoiceAria')}>
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
        <p className="card-note">
          {t('sets.dmRegionsHint', { regions: [0, 1, 2, 3].filter((s) => inR(TASK.value, s)).length })}
        </p>
      </Exercise>
    </section>
  )
}
