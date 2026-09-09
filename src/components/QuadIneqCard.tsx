import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { OR_TOKEN } from '../lib/algebra'
import { REL_PLAIN, REL_TEX } from '../lib/linear'
import {
  holdsQuad,
  QINEQ_ANSWER,
  QINEQ_OPTIONS,
  QINEQ_PRESETS,
  QINEQ_TASK,
  quadIneqSetTex,
  quadTex,
  quadValue,
  solveQuadIneq,
  type QuadIneqSet,
} from '../lib/quadratic'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { NumberLine, type LinePointMark, type LineSegmentMark } from './NumberLine'
import { Tex } from './Tex'

const MIN = -6
const MAX = 6
/** −6 to 6 in quarter steps: fine enough that the parabola looks smooth. */
const XS = Array.from({ length: 49 }, (_, i) => -6 + i * 0.25)
const Y_DOMAIN: [number, number] = [-10, 10]
const SET_COLOR = 'var(--series-3)'

/** A number with the typographic minus prose uses, not the hyphen. */
const signed = (v: number): string => (v < 0 ? `−${Math.abs(v)}` : String(v))

/**
 * The solution set drawn on the axis. An end that runs off the picture is given
 * as infinite, so it gets no marker that could be read as a bound.
 */
function marksOf(set: QuadIneqSet): { segments: LineSegmentMark[]; points: LinePointMark[] } {
  const seg = (from: number, to: number, leftClosed: boolean, rightClosed: boolean): LineSegmentMark => ({
    from,
    to,
    leftClosed,
    rightClosed,
    color: SET_COLOR,
  })
  if (set.kind === 'between') return { segments: [seg(set.lo, set.hi, set.closed, set.closed)], points: [] }
  if (set.kind === 'outside') {
    return {
      segments: [seg(-Infinity, set.lo, true, set.closed), seg(set.hi, Infinity, set.closed, true)],
      points: [],
    }
  }
  if (set.kind === 'allBut') {
    return {
      segments: [seg(-Infinity, set.x, true, false), seg(set.x, Infinity, false, true)],
      points: [],
    }
  }
  if (set.kind === 'all') return { segments: [seg(-Infinity, Infinity, true, true)], points: [] }
  if (set.kind === 'only') {
    return { segments: [], points: [{ id: 'only', value: set.x, color: SET_COLOR }] }
  }
  return { segments: [], points: [] }
}

/**
 * Másodfokú egyenlőtlenségek grafikusan.
 *
 * The answer is a stretch of the axis, and the chart says which stretch: the
 * shaded part of the parabola is drawn only where the inequality holds, so the
 * solution set on the number line below it is the same thing seen from
 * underneath. The test point is the check that catches a misread picture.
 */
export function QuadIneqCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [presetId, setPresetId] = useState('below')
  const [test, setTest] = useState(0)
  const [answer, setAnswer] = useState('')

  const preset = QINEQ_PRESETS.find((p) => p.id === presetId) ?? QINEQ_PRESETS[0]
  const set = solveQuadIneq(preset.q, preset.rel)
  const { segments, points } = marksOf(set)
  const isTrue = holdsQuad(preset.q, preset.rel, test)

  const curve = XS.map((x) => quadValue(preset.q, x))
  // A hole wherever the inequality fails: the second series exists only on the
  // stretch that answers the question, and `LineChart` leaves the rest empty.
  const held = XS.map((x) => (holdsQuad(preset.q, preset.rel, x) ? quadValue(preset.q, x) : NaN))

  const withWords = (tex: string) => tex.replaceAll(OR_TOKEN, t('quad.orWord'))

  const plainSet =
    set.kind === 'all'
      ? t('quad.ineqAllPlain')
      : set.kind === 'none'
        ? t('quad.ineqNonePlain')
        : set.kind === 'only'
          ? `x = ${signed(set.x)}`
          : set.kind === 'allBut'
            ? `x ≠ ${signed(set.x)}`
            : set.kind === 'between'
              ? `${signed(set.lo)} ${set.closed ? '≤' : '<'} x ${set.closed ? '≤' : '<'} ${signed(set.hi)}`
              : `x ${set.closed ? '≤' : '<'} ${signed(set.lo)} ${t('quad.orWord')} x ${set.closed ? '≥' : '>'} ${signed(set.hi)}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.ineqTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.ineqIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="quad.ineqRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="quad.ineqIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.ineqEqAria')}>
        {QINEQ_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => setPresetId(p.id)}
          >
            <Tex tex={`${quadTex(p.q)} ${REL_TEX[p.rel]} 0`} />
          </button>
        ))}
      </div>

      <LineChart
        xs={XS}
        height={240}
        xLabel="x"
        yLabel="y"
        yDomain={Y_DOMAIN}
        xStep={1}
        series={[
          { name: t('quad.ineqCurve'), color: 'var(--series-1)', values: curve },
          { name: t('quad.ineqHeld'), color: SET_COLOR, values: held, area: true },
        ]}
      />

      <p className="mini-title">{t('quad.ineqLineTitle')}</p>
      <NumberLine
        min={MIN}
        max={MAX}
        height={86}
        segments={segments}
        points={[...points, { id: 'test', value: test, label: signed(test), color: 'var(--series-2)' }]}
        ariaLabel={t('quad.ineqLineAria', { set: plainSet })}
      />

      <Tex block tex={withWords(quadIneqSetTex(set))} />
      <p className="lin-result lesson-text">
        <Trans i18nKey={`quad.ineqSet_${set.kind}`} components={{ b: <strong />, i: <em /> }} />
      </p>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('quad.ineqTestPick')} <strong>{signed(test)}</strong>
          </span>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={test}
            onChange={(e) => setTest(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="quad.ineqTestLine"
          values={{
            x: signed(test),
            value: signed(quadValue(preset.q, test)),
            rel: REL_PLAIN[preset.rel],
            verdict: t(isTrue ? 'quad.ineqTrue' : 'quad.ineqFalse'),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="quad.ineqTask"
        isCorrect={answer === QINEQ_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={QINEQ_ANSWER}
        onReveal={() => setAnswer(QINEQ_ANSWER)}
        hintKey="quad.ineqHint"
      >
        <Tex block tex={`${quadTex(QINEQ_TASK.q)} ${REL_TEX[QINEQ_TASK.rel]} 0`} />
        <div className="pill-row" role="group" aria-label={t('quad.ineqOptAria')}>
          {QINEQ_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={answer === option.id ? 'pill active' : 'pill'}
              aria-pressed={answer === option.id}
              onClick={() => setAnswer(option.id)}
            >
              <Tex tex={withWords(option.tex)} />
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
