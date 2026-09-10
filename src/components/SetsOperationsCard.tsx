import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { EXPRESSIONS, inR, nameRegionSet, regionTex, type RegionSet } from '../lib/sets'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

const TASK_ID = 'onlyA3'

/** Buttons for every region, so the diagram can be operated without a mouse. */
function RegionPills({
  n,
  value,
  onToggle,
  onHover,
}: {
  n: 2 | 3
  value: RegionSet
  onToggle: (sig: number) => void
  onHover?: (sig: number | null) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="pill-row" role="group" aria-label={t('sets.regionPickerAria')}>
      {Array.from({ length: 1 << n }, (_, sig) => (
        <button
          key={sig}
          type="button"
          className={inR(value, sig) ? 'pill active' : 'pill'}
          aria-pressed={inR(value, sig)}
          onMouseEnter={() => onHover?.(sig)}
          onMouseLeave={() => onHover?.(null)}
          onClick={() => onToggle(sig)}
        >
          <Tex tex={regionTex(sig, n)} />
        </button>
      ))}
    </div>
  )
}

export function SetsOperationsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [n, setN] = useState<2 | 3>(2)
  const [exprId, setExprId] = useState('union2')
  const [freeDraw, setFreeDraw] = useState(false)
  const [painted, setPainted] = useState<RegionSet>(0)
  const [answer, setAnswer] = useState<RegionSet>(0)
  const [hovered, setHovered] = useState<number | null>(null)

  const available = EXPRESSIONS.filter((e) => e.n === n)
  const expr = available.find((e) => e.id === exprId) ?? available[0]
  const shown = freeDraw ? painted : expr.value
  const paintedName = nameRegionSet(painted, n)

  const task = EXPRESSIONS.find((e) => e.id === TASK_ID)!

  const toggleIn = (current: RegionSet, setter: (v: RegionSet) => void) => (sig: number) =>
    setter(current ^ (1 << sig))

  const switchN = (next: 2 | 3) => {
    setN(next)
    setExprId(EXPRESSIONS.find((e) => e.n === next)!.id)
    setPainted(0)
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.opsIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['sets.opsDef1', 'sets.opsDef2', 'sets.opsDef3', 'sets.opsDef4']} />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('sets.opsSetCount')}</span>
          <select value={n} onChange={(e) => switchN(Number(e.target.value) as 2 | 3)}>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t('sets.opsExpr')}</span>
          <select value={expr.id} onChange={(e) => setExprId(e.target.value)} disabled={freeDraw}>
            {available.map((e) => (
              <option key={e.id} value={e.id}>
                {e.plain}
              </option>
            ))}
          </select>
        </label>
        <label className="field checkbox-field">
          <span className="field-label">{t('sets.opsFreeDraw')}</span>
          <input type="checkbox" checked={freeDraw} onChange={(e) => setFreeDraw(e.target.checked)} />
        </label>
      </div>

      <VennDiagram
        n={n}
        shaded={shown}
        highlight={hovered}
        onToggleRegion={freeDraw ? toggleIn(painted, setPainted) : undefined}
        onHoverRegion={setHovered}
      />

      {freeDraw && (
        <RegionPills n={n} value={painted} onToggle={toggleIn(painted, setPainted)} onHover={setHovered} />
      )}

      {!freeDraw ? (
        <p className="lin-result">
          {t('sets.opsShowing')} <Tex tex={expr.tex} />
        </p>
      ) : paintedName ? (
        <p className="lin-result">
          {t('sets.opsYouShaded')} <Tex tex={paintedName.tex} />
        </p>
      ) : (
        <p className="lin-result">{t('sets.opsNoName')}</p>
      )}

      <Exercise
        promptKey="sets.opsTask"
        isCorrect={answer === task.value}
        canCheck={answer !== 0}
        answerKey={String(answer)}
        solutionKey={String(task.value)}
        onReveal={() => {
          switchN(3)
          setAnswer(task.value)
        }}
        hintKey="sets.opsHint"
      >
        <Tex block tex={task.tex} />
        <VennDiagram n={3} shaded={answer} onToggleRegion={toggleIn(answer, setAnswer)} height={260} />
        <RegionPills n={3} value={answer} onToggle={toggleIn(answer, setAnswer)} />
      </Exercise>
    </section>
  )
}
