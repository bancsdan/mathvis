import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  ELEM,
  ELEM_IDS,
  elemValue,
  fmt,
  TRANSFORM_ANSWER,
  TRANSFORM_OPTIONS,
  transformed,
  transformTex,
  transformWords,
  type ElemId,
} from '../lib/functions'
import { texSeparator } from '../lib/numbers'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/**
 * One grid for all three bases and every shift: a graph moved four to the right
 * has to stay on the picture, so the window is wider than any base's own.
 */
const XS = Array.from({ length: 141 }, (_, i) => Math.round((-6 + i * 0.1) * 10) / 10)
const Y_DOMAIN: [number, number] = [-6, 8]

/**
 * Függvénytranszformációk.
 *
 * The dashed curve is the base and the solid one is what the sliders made of
 * it, so every step is a movement you watch happen. The line underneath names
 * the steps in the order they are applied — including the one that catches
 * everybody out, that adding inside the brackets moves the graph left.
 */
export function FnTransformCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [baseId, setBaseId] = useState<ElemId>('square')
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [up, setUp] = useState(true)
  const [size, setSize] = useState(2)
  const [abs, setAbs] = useState(false)
  const [answer, setAnswer] = useState('')

  // The multiplier is split into a sign and a size rather than being one slider
  // that must skip zero: c = 0 flattens the graph to the axis and is not a
  // transformation of it.
  const k = (up ? 1 : -1) * (size / 2)
  const transform = { dx, dy, k, abs }
  const base = (x: number) => elemValue(baseId, x)
  const g = transformed(base, transform)

  const words = transformWords(transform)
  const steps = words
    .map((word) =>
      t(`fn.w${word.charAt(0).toUpperCase()}${word.slice(1)}`, {
        n: fmt(word === 'up' || word === 'down' ? Math.abs(dy) : Math.abs(dx), sep),
        k: fmt(Math.abs(k), sep),
      })
    )
    .join(t('fn.transformJoin'))

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.transformTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.transformIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="fn.transformRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="fn.transformIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.transformBaseAria')}>
        {ELEM_IDS.map((eid) => (
          <button
            key={eid}
            type="button"
            className={baseId === eid ? 'pill active' : 'pill'}
            aria-pressed={baseId === eid}
            onClick={() => setBaseId(eid)}
          >
            <Tex tex={ELEM[eid].tex} />
          </button>
        ))}
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('fn.transformPickDx')} <strong>{fmt(dx, sep)}</strong>
          </span>
          <input type="range" min={-4} max={4} step={1} value={dx} onChange={(e) => setDx(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('fn.transformPickDy')} <strong>{fmt(dy, sep)}</strong>
          </span>
          <input type="range" min={-4} max={4} step={1} value={dy} onChange={(e) => setDy(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('fn.transformPickK')} <strong>{fmt(k, sep)}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.transformSignAria')}>
        <button
          type="button"
          className={up ? 'pill active' : 'pill'}
          aria-pressed={up}
          onClick={() => setUp(true)}
        >
          {t('fn.transformSignUp')}
        </button>
        <button
          type="button"
          className={up ? 'pill' : 'pill active'}
          aria-pressed={!up}
          onClick={() => setUp(false)}
        >
          {t('fn.transformSignDown')}
        </button>
        <button
          type="button"
          className={abs ? 'pill active' : 'pill'}
          aria-pressed={abs}
          onClick={() => setAbs(!abs)}
        >
          {t('fn.transformAbs')}
        </button>
      </div>

      <Tex block tex={`g(x) = ${texSeparator(transformTex(baseId, transform), sep)}`} />

      <LineChart
        xs={XS}
        height={260}
        xLabel="x"
        yLabel="y"
        yDomain={Y_DOMAIN}
        xStep={1}
        format={(v) => fmt(v, sep)}
        series={[
          {
            name: t('fn.transformBaseCurve'),
            color: 'var(--series-2)',
            values: XS.map((x) => base(x)),
            dashed: true,
          },
          { name: t('fn.transformCurve'), color: 'var(--series-1)', values: XS.map((x) => g(x)) },
        ]}
      />

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={words.length === 0 ? 'fn.transformNone' : 'fn.transformLine'}
          values={{ steps }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="fn.transformTask"
        isCorrect={answer === TRANSFORM_ANSWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={TRANSFORM_ANSWER}
        onReveal={() => setAnswer(TRANSFORM_ANSWER)}
        hintKey="fn.transformHint"
      >
        <div className="pill-row" role="group" aria-label={t('fn.transformOptAria')}>
          {TRANSFORM_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={answer === option.id ? 'pill active' : 'pill'}
              aria-pressed={answer === option.id}
              onClick={() => setAnswer(option.id)}
            >
              <Tex tex={option.tex} />
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
