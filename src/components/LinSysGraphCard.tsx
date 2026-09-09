import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  rowTex,
  rowY,
  rowYTex,
  solveSystem,
  SYSGRAPH_ANSWER,
  SYSGRAPH_PRESETS,
} from '../lib/linear'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

const XS = Array.from({ length: 25 }, (_, i) => -6 + i * 0.5)
const Y_DOMAIN: [number, number] = [-8, 8]

/** A number for a sentence, with the typographic minus. */
const signed = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n))

/** `2 + 3 = 5`: one row with the pair written into it, in plain text. */
function checkText(a: number, b: number, c: number, x: number, y: number): string {
  const term = (coef: number, value: number) =>
    Math.abs(coef) === 1 ? String(value) : `${Math.abs(coef)}·${value}`
  const head = a === 0 ? '' : a < 0 ? `−${term(a, x)}` : term(a, x)
  const tail =
    b === 0 ? '' : head === '' ? `${b < 0 ? '−' : ''}${term(b, y)}` : ` ${b < 0 ? '−' : '+'} ${term(b, y)}`
  return `${head}${tail} = ${signed(c)}`
}

/**
 * Egyenletrendszer grafikusan. One two-unknown equation is a whole line of
 * solutions; the system asks for the point both lines agree on. Crossing,
 * parallel and coincident are then three pictures rather than three rules.
 */
export function LinSysGraphCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [presetId, setPresetId] = useState('meet')
  const [ansX, setAnsX] = useState('')
  const [ansY, setAnsY] = useState('')

  const preset = SYSGRAPH_PRESETS.find((p) => p.id === presetId) ?? SYSGRAPH_PRESETS[0]
  const meet = SYSGRAPH_PRESETS[0]
  const result = solveSystem(preset.s)
  const answerKey = `${ansX}|${ansY}`
  const [solX, solY] = SYSGRAPH_ANSWER.split('|')

  const chart = (s: typeof preset.s, dashSecond: boolean) => (
    <LineChart
      xs={XS}
      height={240}
      xLabel="x"
      yLabel="y"
      yDomain={Y_DOMAIN}
      xStep={1}
      series={[
        {
          name: t('lin.sysgraphRow1'),
          color: 'var(--series-1)',
          values: XS.map((x) => rowY(s.a1, s.b1, s.c1, x)),
        },
        {
          name: t('lin.sysgraphRow2'),
          color: 'var(--series-2)',
          values: XS.map((x) => rowY(s.a2, s.b2, s.c2, x)),
          dashed: dashSecond,
        },
      ]}
    />
  )

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.sysgraphTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.sysgraphIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.sysgraphIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.sysgraphRule" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('lin.sysgraphEqAria')}>
        {SYSGRAPH_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => setPresetId(p.id)}
          >
            {t(`lin.sysgraphEq_${p.id}`)}
          </button>
        ))}
      </div>

      <Tex
        block
        tex={`${rowTex(preset.s.a1, preset.s.b1, preset.s.c1)} \\qquad \\Longleftrightarrow \\qquad ${rowYTex(
          preset.s.a1,
          preset.s.b1,
          preset.s.c1
        )}`}
      />
      <Tex
        block
        tex={`${rowTex(preset.s.a2, preset.s.b2, preset.s.c2)} \\qquad \\Longleftrightarrow \\qquad ${rowYTex(
          preset.s.a2,
          preset.s.b2,
          preset.s.c2
        )}`}
      />

      {chart(preset.s, presetId === 'same')}

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`lin.sysgraphResult_${result.kind}`}
          values={
            result.kind === 'one'
              ? {
                  x: signed(result.x.p),
                  y: signed(result.y.p),
                  check1: checkText(
                    preset.s.a1,
                    preset.s.b1,
                    preset.s.c1,
                    result.x.p,
                    result.y.p
                  ),
                  check2: checkText(
                    preset.s.a2,
                    preset.s.b2,
                    preset.s.c2,
                    result.x.p,
                    result.y.p
                  ),
                }
              : {}
          }
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="lin.sysgraphDigital" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="lin.sysgraphTask"
        isCorrect={answerKey === SYSGRAPH_ANSWER}
        canCheck={ansX.trim() !== '' && ansY.trim() !== ''}
        answerKey={answerKey}
        solutionKey={SYSGRAPH_ANSWER}
        onReveal={() => {
          setAnsX(solX)
          setAnsY(solY)
        }}
        hintKey="lin.sysgraphHint"
      >
        <Tex block tex={rowTex(meet.s.a1, meet.s.b1, meet.s.c1)} />
        <Tex block tex={rowTex(meet.s.a2, meet.s.b2, meet.s.c2)} />
        {chart(meet.s, false)}
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('lin.sysgraphAnswerX')}</span>
            <input
              className="answer-input"
              type="number"
              value={ansX}
              onChange={(e) => setAnsX(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('lin.sysgraphAnswerY')}</span>
            <input
              className="answer-input"
              type="number"
              value={ansY}
              onChange={(e) => setAnsY(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
