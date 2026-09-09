import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { DISC_ANSWER, discriminant, quadTex, quadValue, rootTex, solveQuad } from '../lib/quadratic'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'
import { Tex } from './Tex'

/** −6 to 6 in quarter steps: fine enough that the parabola looks smooth. */
const XS = Array.from({ length: 49 }, (_, i) => -6 + i * 0.25)
const Y_DOMAIN: [number, number] = [-12, 12]

/** A number with the typographic minus prose uses, not the hyphen. */
const signed = (v: number): string => (v < 0 ? `−${Math.abs(v)}` : String(v))

/**
 * A diszkrimináns és a parabola.
 *
 * The sign of a slider and the number of crossings on the chart are the same
 * fact told twice. `a` is split into a direction and a size rather than being
 * one slider that must skip zero: a quadratic with a = 0 is not a quadratic,
 * and a control that silently jumps over a value teaches the wrong thing.
 */
export function QuadDiscCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [up, setUp] = useState(true)
  const [size, setSize] = useState(1)
  const [b, setB] = useState(-2)
  const [c, setC] = useState(-3)
  const [answer, setAnswer] = useState('')

  const a = up ? size : -size
  const q = { a, b, c }
  const d = discriminant(q)
  const roots = solveQuad(q)
  const values = useMemo(() => XS.map((x) => quadValue({ a, b, c }, x)), [a, b, c])
  const verdictKey =
    roots.kind === 'two' ? 'quad.verdictTwo' : roots.kind === 'one' ? 'quad.verdictOne' : 'quad.verdictNone'

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('quad.discTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="quad.discIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="quad.discRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="quad.discIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('quad.discSignAria')}>
        <button
          type="button"
          className={up ? 'pill active' : 'pill'}
          aria-pressed={up}
          onClick={() => setUp(true)}
        >
          {t('quad.discSignUp')}
        </button>
        <button
          type="button"
          className={up ? 'pill' : 'pill active'}
          aria-pressed={!up}
          onClick={() => setUp(false)}
        >
          {t('quad.discSignDown')}
        </button>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('quad.discPickA')} <strong>{signed(a)}</strong>
          </span>
          <input type="range" min={1} max={3} step={1} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('quad.discPickB')} <strong>{signed(b)}</strong>
          </span>
          <input type="range" min={-8} max={8} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('quad.discPickC')} <strong>{signed(c)}</strong>
          </span>
          <input type="range" min={-8} max={8} step={1} value={c} onChange={(e) => setC(Number(e.target.value))} />
        </label>
      </div>

      <Tex block tex={`y = ${quadTex(q)}`} />

      <LineChart
        xs={XS}
        height={240}
        xLabel="x"
        yLabel="y"
        yDomain={Y_DOMAIN}
        xStep={1}
        series={[{ name: t('quad.discCurve'), color: 'var(--series-1)', values }]}
      />
      <p className="card-note lesson-text">{t('quad.discReadNote')}</p>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey="quad.discResult"
          values={{ d: signed(d), verdict: t(verdictKey) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      {roots.kind === 'none' ? (
        <p className="card-note lesson-text">{t('quad.discNoRoot')}</p>
      ) : (
        <Tex block tex={rootTex(q)} />
      )}

      <Exercise
        promptKey="quad.discTask"
        isCorrect={Number(answer) === DISC_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(DISC_ANSWER)}
        onReveal={() => setAnswer(String(DISC_ANSWER))}
        hintKey="quad.discHint"
      >
        <Tex block tex={`${quadTex({ a: 1, b: 4, c: 0 })} + c = 0`} />
        <label className="field">
          <span className="field-label">{t('quad.discAnswerLabel')}</span>
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
