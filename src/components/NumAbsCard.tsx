import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ABS_ANSWER, ABS_QUIZ, absValue, distance, formatDecimal, opposite } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { NumberLine } from './NumberLine'
import { Tex } from './Tex'

const MIN = -5
const MAX = 5

/**
 * Mit jelent az abszolút érték a számegyenesen: |x| drawn as the stretch from
 * 0 to x, with the opposite mirrored on the other side of 0.
 */
export function NumAbsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [x, setX] = useState(2.5)
  const [answer, setAnswer] = useState('')

  const opp = opposite(x)
  const plain = (v: number) => formatDecimal(String(v), sep, false)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.q5')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.absIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['num.absDef1', 'num.absDef2']} />
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            x = <strong>{plain(x)}</strong>
          </span>
          <input
            type="range"
            min={-4}
            max={4}
            step={0.25}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
          />
        </label>
      </div>

      <NumberLine
        min={MIN}
        max={MAX}
        height={150}
        tickText={(v) => plain(v)}
        bars={[{ from: 0, to: x, color: 'var(--accent-select)', label: `|x| = ${plain(absValue(x))}` }]}
        points={[
          { id: 'x', value: x, label: `x = ${plain(x)}`, color: 'var(--series-1)' },
          { id: 'opp', value: opp, label: `−x = ${plain(opp)}`, color: 'var(--series-2)' },
        ]}
        ariaLabel={t('num.absAria', { x: plain(x), opposite: plain(opp) })}
      />

      <div className="legend">
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--series-1)' }} />
          {t('num.absLegendX')}
        </span>
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--series-2)' }} />
          {t('num.absLegendOpp')}
        </span>
        <span className="legend-item">
          <span className="chip" style={{ background: 'var(--accent-select)' }} />
          {t('num.absLegendAbs')}
        </span>
      </div>

      <p className="lin-result lesson-text">
        {t('num.absResult', { abs: plain(absValue(x)), opposite: plain(opp) })}
      </p>

      <p className="card-note lesson-text">
        <Trans i18nKey="num.absDistanceNote" components={{ b: <strong />, i: <em /> }} />
      </p>
      <Tex block tex={`|3 - (-2)| = |5| = ${distance(3, -2)}`} />

      <Exercise
        promptKey="num.absTask"
        promptValues={{ a: plain(ABS_QUIZ.a), b: plain(ABS_QUIZ.b) }}
        isCorrect={Number(answer) === ABS_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(ABS_ANSWER)}
        onReveal={() => setAnswer(String(ABS_ANSWER))}
        hintKey="num.absHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('num.absAnswer')}</span>
            <input
              className="answer-input"
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
