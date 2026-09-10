import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { digitsOf, formatDecimal, nestedIntervals, ROOT10_LOWER, ZOOM_TARGETS } from '../lib/numbers'
import { Exercise } from './Exercise'
import { NumberLine } from './NumberLine'
import { Tex } from './Tex'

const LEVELS = [0, 1, 2, 3, 4, 5]
/** The five tenths offered as answers for where √10 sits. */
const ROOT10_OPTIONS = [2.9, 3.0, 3.1, 3.2, 3.3]

/**
 * Hol van a √2 a számegyenesen: the unit square whose diagonal is swung onto
 * the line, and the zoom that reads one more decimal of a number out of it.
 */
export function NumLineCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [targetId, setTargetId] = useState('root2')
  const [level, setLevel] = useState(2)
  const [answer, setAnswer] = useState('')

  const target = ZOOM_TARGETS.find((z) => z.id === targetId) ?? ZOOM_TARGETS[0]
  const nests = nestedIntervals(target.value, level + 1)
  const here = nests[level]
  const next = nests[level + 1]

  const plain = (v: string) => formatDecimal(v, sep, false)
  const texNum = (v: string) => formatDecimal(v, sep, true)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.lineIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <NumberLine
        min={-1}
        max={5}
        height={210}
        tickText={(v) => plain(String(v))}
        points={[{ id: 'r2', value: Math.SQRT2, label: '√2', color: 'var(--accent-select)' }]}
        ariaLabel={t('num.lineSqrtAria')}
        extra={(x, axisY) => {
          const unit = x(1) - x(0)
          return (
            <g>
              <rect
                x={x(0)}
                y={axisY - unit}
                width={unit}
                height={unit}
                fill="var(--series-1)"
                fillOpacity={0.16}
                stroke="var(--series-1)"
              />
              <line x1={x(0)} y1={axisY} x2={x(1)} y2={axisY - unit} stroke="var(--series-2)" strokeWidth={2} />
              <path
                d={`M${x(1)},${axisY - unit} A${unit * Math.SQRT2},${unit * Math.SQRT2} 0 0 1 ${x(Math.SQRT2)},${axisY}`}
                fill="none"
                stroke="var(--accent-select)"
                strokeDasharray="4 3"
              />
            </g>
          )
        }}
      />
      <p className="card-note lesson-text">
        <Trans i18nKey="num.lineSqrtNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <p className="mini-title">{t('num.lineZoomTitle')}</p>
      <p className="card-note lesson-text">{t('num.lineZoomIntro')}</p>
      <div className="pill-row" role="group" aria-label={t('num.lineZoomPickAria')}>
        {ZOOM_TARGETS.map((z) => (
          <button
            key={z.id}
            type="button"
            className={targetId === z.id ? 'pill active' : 'pill'}
            aria-pressed={targetId === z.id}
            onClick={() => setTargetId(z.id)}
          >
            <Tex tex={z.tex} />
          </button>
        ))}
      </div>
      <div className="pill-row" role="group" aria-label={t('num.lineZoomLevelAria')}>
        {LEVELS.map((k) => (
          <button
            key={k}
            type="button"
            className={level === k ? 'pill active' : 'pill'}
            aria-pressed={level === k}
            onClick={() => setLevel(k)}
          >
            {t('num.lineZoomLevel', { level: k })}
          </button>
        ))}
      </div>

      <NumberLine
        min={here.lo}
        max={here.hi}
        height={92}
        ticks={Array.from({ length: 11 }, (_, i) => here.lo + (i * (here.hi - here.lo)) / 10)}
        tickText={(v) => plain(v.toFixed(level + 1))}
        highlight={{ from: next.lo, to: next.hi }}
        points={[{ id: 'target', value: target.value, label: target.plain, color: 'var(--accent-select)' }]}
        ariaLabel={t('num.lineZoomAria', { name: target.plain, level })}
      />

      <div className="table-wrap">
        <table className="paper-table">
          <tbody>
            {nests.slice(0, level + 1).map((n, k) => (
              <tr key={k}>
                <td>
                  <Tex tex={`${texNum(n.lo.toFixed(k))} < ${target.tex} < ${texNum(n.hi.toFixed(k))}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`num.lineZoomNote_${target.id}`}
          values={{ digits: digitsOf(target.value, 8) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="num.lineTask"
        isCorrect={Number(answer) === ROOT10_LOWER}
        canCheck={answer !== ''}
        answerKey={answer}
        solutionKey={String(ROOT10_LOWER)}
        onReveal={() => setAnswer(String(ROOT10_LOWER))}
        hintKey="num.lineHint"
      >
        <div className="pill-row" role="group" aria-label={t('num.lineOptionsAria')}>
          {ROOT10_OPTIONS.map((v) => (
            <button
              key={v}
              type="button"
              className={Number(answer) === v ? 'pill active' : 'pill'}
              aria-pressed={Number(answer) === v}
              onClick={() => setAnswer(String(v))}
            >
              {plain(v.toFixed(1))}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
