import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  DAY_TEMPS,
  extremes,
  fmt,
  HIKE,
  interpolate,
  monotoneRuns,
  READ_ANSWER,
  READ_OPTIONS,
  zerosOf,
} from '../lib/functions'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'

/** Midnight to midnight in quarter hours. */
const XS = Array.from({ length: 97 }, (_, i) => i * 0.25)
const Y_DOMAIN: [number, number] = [-6, 10]
/** The exercise graph, sampled finely enough to look like straight segments. */
const HIKE_XS = Array.from({ length: 81 }, (_, i) => -3 + i * 0.1)
const HIKE_Y: [number, number] = [-3, 5]

const PROPS = ['zeros', 'max', 'min', 'up', 'down', 'range'] as const
type Prop = (typeof PROPS)[number]

/**
 * Tulajdonságok leolvasása a grafikonról.
 *
 * Every property is a place on the picture, so each pill lights that place and
 * says it in words: the two crossings, the highest and the lowest point, and
 * the stretches where the line climbs or falls. The numbers all come from the
 * data through `functions.ts`, never from the copy.
 */
export function FnReadCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [prop, setProp] = useState<Prop>('zeros')
  const [halfHours, setHalfHours] = useState(28)
  const [answer, setAnswer] = useState('')

  const hour = halfHours / 2
  const temps = useMemo(() => XS.map((x) => interpolate(DAY_TEMPS, x)), [])
  const hikeValues = useMemo(() => HIKE_XS.map((x) => interpolate(HIKE, x)), [])

  const runs = monotoneRuns(DAY_TEMPS)
  const { min, max } = extremes(DAY_TEMPS)
  const zeros = zerosOf(DAY_TEMPS)
  const from = DAY_TEMPS[0][0]
  const to = DAY_TEMPS[DAY_TEMPS.length - 1][0]

  const inRuns = (x: number, dir: 'up' | 'down') =>
    runs.some((r) => r.dir === dir && x >= r.from && x <= r.to)

  const spansOf = (dir: 'up' | 'down') =>
    runs
      .filter((r) => r.dir === dir)
      .map((r) => t('fn.readSpan', { from: fmt(r.from, sep), to: fmt(r.to, sep) }))
      .join(t('fn.readJoin'))

  const extra =
    prop === 'up' || prop === 'down'
      ? [
          {
            name: t(`fn.prop_${prop}`),
            color: prop === 'up' ? 'var(--series-3)' : 'var(--series-2)',
            values: XS.map((x, i) => (inRuns(x, prop) ? temps[i] : NaN)),
            area: true,
          },
        ]
      : []

  const lineValues: Record<Prop, Record<string, string>> = {
    zeros: { list: zeros.map((x) => `x = ${fmt(x, sep)}`).join(` ${t('fn.andWord')} `) },
    max: { value: fmt(max[1], sep), at: fmt(max[0], sep) },
    min: { value: fmt(min[1], sep), at: fmt(min[0], sep) },
    up: { spans: spansOf('up') },
    down: { spans: spansOf('down') },
    range: {
      domain: `[${fmt(from, sep)}; ${fmt(to, sep)}]`,
      range: `[${fmt(min[1], sep)}; ${fmt(max[1], sep)}]`,
    },
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.readTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.readIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['fn.readDef1', 'fn.readDef2', 'fn.readDef3']} />
        <p className="card-note">
          <Trans i18nKey="fn.readIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.readPropAria')}>
        {PROPS.map((p) => (
          <button
            key={p}
            type="button"
            className={prop === p ? 'pill active' : 'pill'}
            aria-pressed={prop === p}
            onClick={() => setProp(p)}
          >
            {t(`fn.prop_${p}`)}
          </button>
        ))}
      </div>

      <LineChart
        xs={XS}
        height={250}
        xLabel={t('fn.readXLabel')}
        yLabel={t('fn.unit_c')}
        yDomain={Y_DOMAIN}
        xStep={4}
        format={(v) => fmt(v, sep)}
        series={[{ name: t('fn.readCurve'), color: 'var(--series-1)', values: temps }, ...extra]}
      />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`fn.read_${prop}`}
          values={lineValues[prop]}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">
            {t('fn.readPickHour')} <strong>{fmt(hour, sep)}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={48}
            step={1}
            value={halfHours}
            onChange={(e) => setHalfHours(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="fn.readAt"
          values={{ hour: fmt(hour, sep), temp: fmt(interpolate(DAY_TEMPS, hour), sep) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="fn.readTask"
        isCorrect={answer === READ_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={READ_ANSWER}
        onReveal={() => setAnswer(READ_ANSWER)}
        hintKey="fn.readHint"
      >
        <LineChart
          xs={HIKE_XS}
          height={200}
          xLabel="x"
          yLabel="f(x)"
          yDomain={HIKE_Y}
          xStep={1}
          format={(v) => fmt(v, sep)}
          series={[{ name: t('fn.readTaskCurve'), color: 'var(--series-1)', values: hikeValues }]}
        />
        <div className="pill-row" role="group" aria-label={t('fn.readOptAria')}>
          {READ_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={answer === option.id ? 'pill active' : 'pill'}
              aria-pressed={answer === option.id}
              onClick={() => setAnswer(option.id)}
            >
              {`[${fmt(option.from, sep)}; ${fmt(option.to, sep)}]`}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
