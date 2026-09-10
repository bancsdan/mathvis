import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { MEETING, MODEL_ANSWER, meetingTime, plainValue, positions } from '../lib/linear'
import { parseDecimal } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const HEIGHT = 170
const MARGIN = 34
const AXIS_Y = 96
const BAR1_Y = 74
const BAR2_Y = 118
/** Whole hours are enough for the slider; tenths keep it off floating point. */
const MAX_TENTHS = 30
const TICKS = [0, 60, 120, 180]

/**
 * Szöveges feladat: a matematikai modell. The slider and the equation are the
 * same statement twice — the two covered stretches add up to the whole road
 * exactly where 60t + 30t = 180 comes out true.
 */
export function LinModelCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [tenths, setTenths] = useState(10)
  const [answer, setAnswer] = useState('')

  const time = tenths / 10
  const { car1, car2, gap } = positions(time)
  const sum = MEETING.v1 * time + MEETING.v2 * time
  const x = (km: number) => MARGIN + ((width - 2 * MARGIN) * km) / MEETING.distance
  const typed = parseDecimal(answer)

  const lineKey = gap === 0 ? 'lin.modelMet' : gap < 0 ? 'lin.modelPassed' : 'lin.modelLine'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.modelIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="lin.modelDef" />
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('lin.modelPickT')}{' '}
            <strong>
              {plainValue(time, sep)} {t('lin.unit_h')}
            </strong>
          </span>
          <input
            type="range"
            min={0}
            max={MAX_TENTHS}
            step={1}
            value={tenths}
            onChange={(e) => setTenths(Number(e.target.value))}
          />
        </label>
      </div>

      <div ref={ref} className="chart-box">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={t('lin.modelAria', {
              t: plainValue(time, sep),
              car1: plainValue(car1, sep),
              car2: plainValue(car2, sep),
            })}
          >
            <line x1={x(0)} y1={AXIS_Y} x2={x(MEETING.distance)} y2={AXIS_Y} stroke="var(--axis)" />
            {TICKS.map((km) => (
              <g key={km}>
                <line x1={x(km)} y1={AXIS_Y - 5} x2={x(km)} y2={AXIS_Y + 5} stroke="var(--axis)" />
                <text x={x(km)} y={AXIS_Y + 22} textAnchor="middle" className="tick-text">
                  {km}
                </text>
              </g>
            ))}

            <line
              x1={x(0)}
              y1={BAR1_Y}
              x2={x(Math.min(car1, MEETING.distance))}
              y2={BAR1_Y}
              stroke="var(--series-1)"
              strokeWidth={6}
              strokeLinecap="round"
            />
            <circle cx={x(Math.min(car1, MEETING.distance))} cy={BAR1_Y} r={6} fill="var(--series-1)" />
            <text x={x(0)} y={BAR1_Y - 12} className="line-label" fill="var(--series-1)">
              {t('lin.modelCar1')}
            </text>

            <line
              x1={x(Math.max(car2, 0))}
              y1={BAR2_Y}
              x2={x(MEETING.distance)}
              y2={BAR2_Y}
              stroke="var(--series-2)"
              strokeWidth={6}
              strokeLinecap="round"
            />
            <circle cx={x(Math.max(car2, 0))} cy={BAR2_Y} r={6} fill="var(--series-2)" />
            <text
              x={x(MEETING.distance)}
              y={BAR2_Y + 22}
              textAnchor="end"
              className="line-label"
              fill="var(--series-2)"
            >
              {t('lin.modelCar2')}
            </text>

            {gap > 0 && (
              <>
                <line
                  x1={x(car1)}
                  y1={AXIS_Y}
                  x2={x(car2)}
                  y2={AXIS_Y}
                  stroke="var(--accent-select)"
                  strokeWidth={4}
                />
                <text
                  x={(x(car1) + x(car2)) / 2}
                  y={AXIS_Y - 10}
                  textAnchor="middle"
                  className="line-label"
                  fill="var(--accent-select)"
                >
                  {`${plainValue(gap, sep)} ${t('lin.unit_km')}`}
                </text>
              </>
            )}
          </svg>
        )}
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={lineKey}
          values={{
            t: plainValue(time, sep),
            sum: plainValue(sum, sep),
            gap: plainValue(gap, sep),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Tex block tex={`${MEETING.v1}t + ${MEETING.v2}t = ${MEETING.distance}`} />
      <Tex block tex={`${MEETING.v1 + MEETING.v2}t = ${MEETING.distance}`} />
      <Tex block tex={`t = ${meetingTime(MEETING.distance, MEETING.v1, MEETING.v2)}`} />

      <p className="card-note lesson-text">
        <Trans i18nKey="lin.modelSteps" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="lin.modelTask"
        isCorrect={typed !== null && Math.abs(typed - MODEL_ANSWER) < 1e-9}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={plainValue(MODEL_ANSWER, sep)}
        onReveal={() => setAnswer(plainValue(MODEL_ANSWER, sep))}
        hintKey="lin.modelHint"
      >
        <label className="field">
          <span className="field-label">{t('lin.modelAnswerLabel')}</span>
          <input
            className="answer-input"
            type="text"
            inputMode="decimal"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
