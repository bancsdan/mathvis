import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { plainValue } from '../lib/linear'
import { BALL, ballHeight, GARDEN, gardenArea, WORD_ANSWER } from '../lib/quadratic'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const TABS = ['garden', 'ball'] as const
/** Half metres, so the slider never drifts off a round number. */
const GARDEN_HALVES = { min: 2, max: 20 }
/** Tenths of a second, for the same reason. */
const BALL_TENTHS = { min: 0, max: 50 }
/** The longest side the garden can reach, so the drawing keeps one scale. */
const MAX_LONG = GARDEN_HALVES.max / 2 + GARDEN.diff
const MAX_SHORT = GARDEN_HALVES.max / 2
const GARDEN_PAD = 46
/** 0 to 5 seconds in tenths: the whole flight and a little past the landing. */
const BALL_XS = Array.from({ length: 51 }, (_, i) => i * 0.1)
const BALL_Y: [number, number] = [-5, 25]

/**
 * The garden drawn to scale, one rectangle that grows with the slider.
 *
 * It is its own component so that its width observer starts afresh every time
 * the tab is opened, rather than keeping the width the page happened to have
 * when it was last on screen.
 */
function GardenFigure({ x, long, area, sep }: { x: number; long: number; area: number; sep: string }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const unit = Math.max(Math.min((width - 2 * GARDEN_PAD) / MAX_LONG, 17), 4)
  const boxHeight = MAX_SHORT * unit + 44

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg
          width={width}
          height={boxHeight}
          role="img"
          aria-label={t('quad.wordGardenAria', {
            x: plainValue(x, sep),
            long: plainValue(long, sep),
            area: plainValue(area, sep),
          })}
        >
          <rect
            x={GARDEN_PAD}
            y={26}
            width={long * unit}
            height={x * unit}
            fill="var(--series-1)"
            fillOpacity={0.22}
            stroke="var(--series-1)"
            strokeWidth={2}
          />
          <text
            x={GARDEN_PAD + (long * unit) / 2}
            y={18}
            textAnchor="middle"
            className="line-label"
            fill="var(--series-1)"
          >
            {`${plainValue(long, sep)} ${t('quad.unit_m')}`}
          </text>
          <text
            x={GARDEN_PAD - 8}
            y={26 + (x * unit) / 2 + 4}
            textAnchor="end"
            className="line-label"
            fill="var(--series-1)"
          >
            {`${plainValue(x, sep)} ${t('quad.unit_m')}`}
          </text>
          <text
            x={GARDEN_PAD + (long * unit) / 2}
            y={26 + (x * unit) / 2 + 5}
            textAnchor="middle"
            className="line-label"
            fill={area === GARDEN.area ? 'var(--accent-select)' : 'var(--text-secondary)'}
          >
            {`${plainValue(area, sep)} ${t('quad.unit_m2')}`}
          </text>
        </svg>
      )}
    </div>
  )
}

/**
 * Szöveges feladatok: melyik gyök a válasz?
 *
 * Both stories end with two roots and one answer. The picture is where the
 * filtering becomes obvious rather than a rule: a side of −8 metres is not a
 * rectangle anyone can draw, and the ball is already lying on the grass by the
 * time the formula starts returning negative heights.
 */
export function QuadWordCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [tab, setTab] = useState<(typeof TABS)[number]>('garden')
  const [halves, setHalves] = useState(8)
  const [tenths, setTenths] = useState(10)
  const [ansA, setAnsA] = useState('')
  const [ansB, setAnsB] = useState('')

  const x = halves / 2
  const long = x + GARDEN.diff
  const area = gardenArea(x)
  const time = tenths / 10
  const height = ballHeight(time)

  const heights = useMemo(() => BALL_XS.map((s) => ballHeight(s)), [])
  const [solA, solB] = WORD_ANSWER.split('|')
  const typed = [ansA, ansB].map(Number)
  const answered = ansA.trim() !== '' && ansB.trim() !== '' && typed.every(Number.isFinite)
  const answerKey = answered ? [...typed].sort((a, b) => a - b).join('|') : `${ansA}|${ansB}`

  const gardenKey = area === GARDEN.area ? 'quad.gardenDone' : 'quad.gardenLine'
  const ballKey = time === 4 ? 'quad.ballDone' : time > 4 ? 'quad.ballBelow' : 'quad.ballLine'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.q7')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.wordIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.wordTabAria')}>
        {TABS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            className={tab === tabId ? 'pill active' : 'pill'}
            aria-pressed={tab === tabId}
            onClick={() => setTab(tabId)}
          >
            {t(`quad.word_${tabId}`)}
          </button>
        ))}
      </div>

      {tab === 'garden' && (
        <>
          <div className="controls-inline">
            <label className="field field-wide">
              <span className="field-label">
                {t('quad.gardenPickX')}{' '}
                <strong>
                  {plainValue(x, sep)} {t('quad.unit_m')}
                </strong>
              </span>
              <input
                type="range"
                min={GARDEN_HALVES.min}
                max={GARDEN_HALVES.max}
                step={1}
                value={halves}
                onChange={(e) => setHalves(Number(e.target.value))}
              />
            </label>
          </div>

          <GardenFigure x={x} long={long} area={area} sep={sep} />

          <p className="lin-result lesson-text">
            <Trans
              i18nKey={gardenKey}
              values={{
                x: plainValue(x, sep),
                long: plainValue(long, sep),
                area: plainValue(area, sep),
              }}
              components={{ b: <strong />, i: <em /> }}
            />
          </p>

          <Tex block tex={`x(x + ${GARDEN.diff}) = ${GARDEN.area}`} />
          <Tex block tex={`x^2 + ${GARDEN.diff}x - ${GARDEN.area} = 0`} />
          <Tex block tex="x_1 = 5,\ x_2 = -8" />
          <p className="card-note lesson-text">{t('quad.gardenReject')}</p>
        </>
      )}

      {tab === 'ball' && (
        <>
          <div className="controls-inline">
            <label className="field field-wide">
              <span className="field-label">
                {t('quad.ballPickT')}{' '}
                <strong>
                  {plainValue(time, sep)} {t('quad.unit_s')}
                </strong>
              </span>
              <input
                type="range"
                min={BALL_TENTHS.min}
                max={BALL_TENTHS.max}
                step={1}
                value={tenths}
                onChange={(e) => setTenths(Number(e.target.value))}
              />
            </label>
          </div>

          <LineChart
            xs={BALL_XS}
            height={240}
            xLabel="t"
            yLabel="h"
            yDomain={BALL_Y}
            xStep={1}
            series={[{ name: t('quad.ballCurve'), color: 'var(--series-1)', values: heights }]}
          />

          <p className="lin-result lesson-text">
            <Trans
              i18nKey={ballKey}
              values={{ t: plainValue(time, sep), h: plainValue(height, sep) }}
              components={{ b: <strong />, i: <em /> }}
            />
          </p>

          <Tex block tex={`${BALL.v0}t - ${BALL.g / 2}t^2 = 0`} />
          <Tex block tex={`${BALL.g / 2}t(4 - t) = 0`} />
          <Tex block tex={`t = 0 \\text{ ${t('quad.orWord')} } t = 4`} />
          <p className="card-note lesson-text">{t('quad.ballStart')}</p>
        </>
      )}

      <Exercise
        promptKey="quad.wordTask"
        isCorrect={answerKey === WORD_ANSWER}
        canCheck={answered}
        answerKey={answerKey}
        solutionKey={WORD_ANSWER}
        onReveal={() => {
          setAnsA(solA)
          setAnsB(solB)
        }}
        hintKey="quad.wordHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('quad.wordAnswer1')}</span>
            <input className="answer-input" type="number" value={ansA} onChange={(e) => setAnsA(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('quad.wordAnswer2')}</span>
            <input className="answer-input" type="number" value={ansB} onChange={(e) => setAnsB(e.target.value)} />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
