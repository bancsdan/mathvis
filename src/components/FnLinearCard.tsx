import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { fmt, LINEAR_ANSWER, LINEAR_TASK, linear, linearTex, slopeBetween } from '../lib/functions'
import { texSeparator } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/** −6 to 6 in half steps: enough points for a straight line to look straight. */
const XS = Array.from({ length: 25 }, (_, i) => -6 + i * 0.5)
const Y_DOMAIN: [number, number] = [-10, 10]
/** The exercise graph keeps both named points comfortably inside it. */
const TASK_XS = Array.from({ length: 17 }, (_, i) => -4 + i * 0.5)
const TASK_Y: [number, number] = [-6, 6]

/**
 * A lineáris függvény.
 *
 * Two numbers, two readings: b is where the line meets the vertical axis, m is
 * how much it climbs for one step to the right. The line under the sliders says
 * both in words, and the two-row table shows the step itself — f(0) and f(1)
 * differ by exactly m.
 */
export function FnLinearCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [halves, setHalves] = useState(2)
  const [b, setB] = useState(2)
  const [mAnswer, setMAnswer] = useState('')
  const [bAnswer, setBAnswer] = useState('')

  const m = halves / 2
  const f = linear(m, b)
  const values = useMemo(() => XS.map((x) => m * x + b), [m, b])
  const taskSlope = slopeBetween(LINEAR_TASK.p, LINEAR_TASK.q)
  const taskValues = useMemo(
    () => TASK_XS.map((x) => taskSlope * x + LINEAR_TASK.p[1]),
    [taskSlope]
  )

  const [solM, solB] = LINEAR_ANSWER.split('|')
  const answered = mAnswer.trim() !== '' && bAnswer.trim() !== ''
  const answerKey = answered ? `${Number(mAnswer)}|${Number(bAnswer)}` : `${mAnswer}|${bAnswer}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.linearTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.linearIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['fn.linearDef1', 'fn.linearDef2']} />
        <p className="card-note">
          <Trans i18nKey="fn.linearIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('fn.linearPickM')} <strong>{fmt(m, sep)}</strong>
          </span>
          <input
            type="range"
            min={-6}
            max={6}
            step={1}
            value={halves}
            onChange={(e) => setHalves(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('fn.linearPickB')} <strong>{fmt(b, sep)}</strong>
          </span>
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
          />
        </label>
      </div>

      <Tex block tex={texSeparator(linearTex(m, b), sep)} />

      <LineChart
        xs={XS}
        height={250}
        xLabel="x"
        yLabel="y"
        yDomain={Y_DOMAIN}
        xStep={1}
        format={(v) => fmt(v, sep)}
        series={[{ name: t('fn.linearCurve'), color: 'var(--series-1)', values }]}
      />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={m === 0 ? 'fn.linearResultFlat' : 'fn.linearResult'}
          values={{
            b: fmt(b, sep),
            m: fmt(m, sep),
            step: fmt(Math.abs(m), sep),
            dir: t(m > 0 ? 'fn.dirUp' : 'fn.dirDown'),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>x</th>
              <th>f(x)</th>
              <th>{t('fn.linearThWhy')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>{fmt(f(0), sep)}</td>
              <td>{t('fn.linearWhyB')}</td>
            </tr>
            <tr>
              <td>1</td>
              <td>{fmt(f(1), sep)}</td>
              <td>{t('fn.linearWhyM')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Exercise
        promptKey="fn.linearTask"
        isCorrect={answerKey === LINEAR_ANSWER}
        canCheck={answered}
        answerKey={answerKey}
        solutionKey={LINEAR_ANSWER}
        onReveal={() => {
          setMAnswer(solM)
          setBAnswer(solB)
        }}
        hintKey="fn.linearHint"
      >
        <LineChart
          xs={TASK_XS}
          height={200}
          xLabel="x"
          yLabel="y"
          yDomain={TASK_Y}
          xStep={1}
          format={(v) => fmt(v, sep)}
          series={[{ name: t('fn.linearTaskCurve'), color: 'var(--series-1)', values: taskValues }]}
        />
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('fn.linearAnswerM')}</span>
            <input
              className="answer-input"
              type="number"
              value={mAnswer}
              onChange={(e) => setMAnswer(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('fn.linearAnswerB')}</span>
            <input
              className="answer-input"
              type="number"
              value={bAnswer}
              onChange={(e) => setBAnswer(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
