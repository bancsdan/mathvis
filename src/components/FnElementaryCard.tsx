import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  ELEM,
  ELEM_ANSWER,
  ELEM_IDS,
  elemValues,
  elemXs,
  fmt,
  solutionCount,
  solutions,
  type ElemId,
} from '../lib/functions'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/**
 * The window each graph is looked at through, and the values the horizontal
 * line may take in it. `c` is kept in half units so the slider never drifts off
 * a round number; the bounds keep the line where it can actually meet the
 * curve, which is the whole point of moving it.
 */
const VIEW: Record<ElemId, { yDomain: [number, number]; cMin: number; cMax: number }> = {
  square: { yDomain: [-1, 9], cMin: -4, cMax: 16 },
  root: { yDomain: [-1, 4], cMin: -4, cMax: 5 },
  recip: { yDomain: [-5, 5], cMin: -8, cMax: 8 },
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

/**
 * Elemi függvények: x², √x és 1/x.
 *
 * The horizontal line asks the reverse question — which x has this value? —
 * and turns it into something you count on the picture: the answer is the
 * number of places the line meets the curve, which is none, one or two
 * depending on the curve and on where the line sits.
 */
export function FnElementaryCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [elemId, setElemId] = useState<ElemId>('square')
  const [halves, setHalves] = useState(8)
  const [answer, setAnswer] = useState('')

  const view = VIEW[elemId]
  const c = clamp(halves, view.cMin, view.cMax) / 2
  const xs = elemXs(elemId)
  const values = elemValues(elemId, xs)
  const roots = solutions(elemId, c)
  const count = solutionCount(elemId, c)

  const pick = (next: ElemId) => {
    setElemId(next)
    setHalves(clamp(halves, VIEW[next].cMin, VIEW[next].cMax))
  }

  /** An irrational solution is written for what it is: an approximation. */
  const root = (v: number) =>
    `${Math.abs(v - Math.round(v * 100) / 100) > 1e-9 ? '≈ ' : ''}${fmt(v, sep)}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.elemIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['fn.elemDef1', 'fn.elemDef2', 'fn.elemDef3']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.elemPickAria')}>
        {ELEM_IDS.map((eid) => (
          <button
            key={eid}
            type="button"
            className={elemId === eid ? 'pill active' : 'pill'}
            aria-pressed={elemId === eid}
            onClick={() => pick(eid)}
          >
            <Tex tex={ELEM[eid].tex} />
          </button>
        ))}
      </div>

      <LineChart
        xs={xs}
        height={250}
        xLabel="x"
        yLabel="y"
        yDomain={view.yDomain}
        xStep={1}
        format={(v) => fmt(v, sep)}
        series={[
          { name: t('fn.elemCurve'), color: 'var(--series-1)', values },
          {
            name: t('fn.elemLevel'),
            color: 'var(--series-2)',
            values: xs.map(() => c),
            dashed: true,
          },
        ]}
      />

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('fn.elemPickC')} <strong>{fmt(c, sep)}</strong>
          </span>
          <input
            type="range"
            min={view.cMin}
            max={view.cMax}
            step={1}
            value={clamp(halves, view.cMin, view.cMax)}
            onChange={(e) => setHalves(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`fn.elemSolutions_${count}`}
          values={{
            c: fmt(c, sep),
            x1: roots[0] === undefined ? '' : root(roots[0]),
            x2: roots[1] === undefined ? '' : root(roots[1]),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="fn.elemTask"
        isCorrect={answer === ELEM_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={ELEM_ANSWER}
        onReveal={() => setAnswer(ELEM_ANSWER)}
        hintKey="fn.elemHint"
      >
        <div className="pill-row" role="group" aria-label={t('fn.elemOptAria')}>
          {ELEM_IDS.map((eid) => (
            <button
              key={eid}
              type="button"
              className={answer === eid ? 'pill active' : 'pill'}
              aria-pressed={answer === eid}
              onClick={() => setAnswer(eid)}
            >
              <Tex tex={ELEM[eid].tex} />
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
