import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  FENCE,
  FENCE_ANSWER,
  fenceArea,
  fmt,
  interpolate,
  TRIP,
  tripSpeed,
} from '../lib/functions'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { useWidth } from './useWidth'

const TABS = ['trip', 'fence'] as const

/** The whole journey in half minutes. */
const TRIP_XS = Array.from({ length: 51 }, (_, i) => i * 0.5)
const TRIP_Y: [number, number] = [0, 3000]
/** Both sides of the rectangle, in half metres. */
const FENCE_XS = Array.from({ length: 21 }, (_, i) => i * 0.5)
const FENCE_Y: [number, number] = [0, 30]
const HALF = FENCE.perimeter / 2
/** Above 200 metres a minute nobody is walking. */
const BUS_SPEED = 200
const FENCE_PAD = 44

/**
 * The rectangle drawn to scale, one shape that changes with the slider.
 *
 * It is its own component so that its width observer starts afresh every time
 * the tab is opened, rather than keeping the width the page happened to have
 * when it was last on screen.
 */
function FenceFigure({ x, other, area, sep }: { x: number; other: number; area: number; sep: string }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const unit = Math.max(Math.min((width - 2 * FENCE_PAD) / HALF, 26), 5)
  const boxHeight = HALF * unit + 44

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg
          width={width}
          height={boxHeight}
          role="img"
          aria-label={t('fn.fenceAria', {
            x: fmt(x, sep),
            other: fmt(other, sep),
            area: fmt(area, sep),
          })}
        >
          <rect
            x={FENCE_PAD}
            y={26}
            width={x * unit}
            height={other * unit}
            fill="var(--series-1)"
            fillOpacity={0.22}
            stroke="var(--series-1)"
            strokeWidth={2}
          />
          <text
            x={FENCE_PAD + (x * unit) / 2}
            y={18}
            textAnchor="middle"
            className="line-label"
            fill="var(--series-1)"
          >
            {`${fmt(x, sep)} ${t('fn.unit_m')}`}
          </text>
          <text
            x={FENCE_PAD - 8}
            y={26 + (other * unit) / 2 + 4}
            textAnchor="end"
            className="line-label"
            fill="var(--series-1)"
          >
            {`${fmt(other, sep)} ${t('fn.unit_m')}`}
          </text>
          <text
            x={FENCE_PAD + (x * unit) / 2}
            y={26 + (other * unit) / 2 + 5}
            textAnchor="middle"
            className="line-label"
            fill={area === FENCE_ANSWER ? 'var(--accent-select)' : 'var(--text-secondary)'}
          >
            {`${fmt(area, sep)} ${t('fn.unit_m2')}`}
          </text>
        </svg>
      )}
    </div>
  )
}

/**
 * Függvények a gyakorlatban: út–idő és a legnagyobb terület.
 *
 * Two everyday functions where the shape of the graph is the answer. On the
 * distance–time graph the slope is the speed, so a flat stretch is standing
 * still; on the area graph the top of the parabola is the best the twenty
 * metres of string can do.
 */
export function FnModelCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [tab, setTab] = useState<(typeof TABS)[number]>('trip')
  const [halfMinutes, setHalfMinutes] = useState(16)
  const [halves, setHalves] = useState(6)
  const [answer, setAnswer] = useState('')

  const time = halfMinutes / 2
  const x = halves / 2
  const other = HALF - x
  const area = fenceArea(x)
  const speed = tripSpeed(TRIP, time)

  const distances = useMemo(() => TRIP_XS.map((v) => interpolate(TRIP, v)), [])
  const areas = useMemo(() => FENCE_XS.map((v) => fenceArea(v)), [])

  const what = speed === 0 ? 'tripWait' : speed > BUS_SPEED ? 'tripBus' : 'tripWalk'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.modelTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.modelIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="fn.modelRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="fn.modelIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.modelTabAria')}>
        {TABS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            className={tab === tabId ? 'pill active' : 'pill'}
            aria-pressed={tab === tabId}
            onClick={() => setTab(tabId)}
          >
            {t(`fn.model_${tabId}`)}
          </button>
        ))}
      </div>

      {tab === 'trip' && (
        <>
          <LineChart
            xs={TRIP_XS}
            height={250}
            xLabel={t('fn.unit_min')}
            yLabel={t('fn.unit_m')}
            yDomain={TRIP_Y}
            xStep={5}
            format={(v) => `${fmt(v, sep)} ${t('fn.unit_m')}`}
            series={[{ name: t('fn.tripCurve'), color: 'var(--series-1)', values: distances }]}
          />

          <div className="controls-inline">
            <label className="field field-wide">
              <span className="field-label">
                {t('fn.tripPickT')} <strong>{fmt(time, sep)}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={halfMinutes}
                onChange={(e) => setHalfMinutes(Number(e.target.value))}
              />
            </label>
          </div>

          <p className="lin-result lesson-text">
            <Trans
              i18nKey="fn.tripLine"
              values={{
                t: fmt(time, sep),
                d: fmt(interpolate(TRIP, time), sep),
                v: fmt(speed, sep),
                what: t(`fn.${what}`),
              }}
              components={{ b: <strong />, i: <em /> }}
            />
          </p>
        </>
      )}

      {tab === 'fence' && (
        <>
          <div className="controls-inline">
            <label className="field field-wide">
              <span className="field-label">
                {t('fn.fencePickX')} <strong>{fmt(x, sep)}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={halves}
                onChange={(e) => setHalves(Number(e.target.value))}
              />
            </label>
          </div>

          <FenceFigure x={x} other={other} area={area} sep={sep} />

          <LineChart
            xs={FENCE_XS}
            height={230}
            xLabel="x"
            yLabel={t('fn.unit_m2')}
            yDomain={FENCE_Y}
            xStep={1}
            format={(v) => fmt(v, sep)}
            series={[{ name: t('fn.fenceCurve'), color: 'var(--series-1)', values: areas }]}
          />

          <p className="lin-result lesson-text">
            <Trans
              i18nKey={area === FENCE_ANSWER ? 'fn.fenceMax' : 'fn.fenceLine'}
              values={{ x: fmt(x, sep), other: fmt(other, sep), area: fmt(area, sep) }}
              components={{ b: <strong />, i: <em /> }}
            />
          </p>
        </>
      )}

      <Exercise
        promptKey="fn.modelTask"
        isCorrect={Number(answer) === FENCE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(FENCE_ANSWER)}
        onReveal={() => setAnswer(String(FENCE_ANSWER))}
        hintKey="fn.modelHint"
      >
        <label className="field">
          <span className="field-label">{t('fn.modelAnswerLabel')}</span>
          <input
            className="answer-input"
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      </Exercise>
    </section>
  )
}
