import { useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  belongsTo,
  CLASS_ORDER,
  CLASS_TEX,
  SAMPLE_NUMBERS,
  texSeparator,
  TOWER_ANSWER,
  TOWER_QUIZ,
  type NumberClass,
  type SampleNumber,
} from '../lib/numbers'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const CLASS_KEY: Record<NumberClass, string> = {
  natural: 'num.clsNatural',
  integer: 'num.clsInteger',
  rational: 'num.clsRational',
  irrational: 'num.clsIrrational',
}

/** Where each number belongs, so the boxes can be filled from one list. */
const inClass = (cls: NumberClass): SampleNumber[] => SAMPLE_NUMBERS.filter((s) => s.cls === cls)

/** `5 \in \mathbb{N}, \; 5 \notin \mathbb{Z}, …` — the membership line, symbols only. */
const membershipTex = (s: SampleNumber): string =>
  [
    ...CLASS_ORDER.filter((c) => c !== 'irrational').map(
      (set) => `${s.tex} ${belongsTo(s.cls, set) ? '\\in' : '\\notin'} ${CLASS_TEX[set]}`,
    ),
    `${s.tex} \\in \\mathbb{R}`,
  ].join(', \\; ')

/**
 * Számhalmazok egymásra épülése: the four sets as boxes inside each other,
 * with the sample numbers dropped into the innermost box that holds them.
 *
 * The boxes are ordinary elements rather than an SVG, so the numbers can be
 * real buttons carrying real KaTeX — clickable with a mouse and reachable with
 * a keyboard without a second control doing the same job.
 */
export function NumTowerCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [picked, setPicked] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const sample = SAMPLE_NUMBERS.find((s) => s.id === picked) ?? null
  const answerKey = TOWER_QUIZ.map((q) => answers[q.id] ?? '').join('|')

  const chips = (cls: NumberClass) => (
    <div className="num-chip-row">
      {inClass(cls).map((s) => (
        <button
          key={s.id}
          type="button"
          className={picked === s.id ? 'num-chip selected' : 'num-chip'}
          aria-pressed={picked === s.id}
          onClick={() => setPicked(picked === s.id ? null : s.id)}
        >
          <Tex tex={texSeparator(s.tex, sep)} />
        </button>
      ))}
    </div>
  )

  /** One box of the tower: its label, the box it contains, then its own numbers. */
  const box = (cls: NumberClass, inner: ReactNode) => (
    <div className={sample && sample.cls === cls ? 'num-box active' : 'num-box'}>
      <span className="num-box-label">{t(CLASS_KEY[cls])}</span>
      {inner}
      {chips(cls)}
    </div>
  )

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('num.towerTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="num.towerIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="num.towerIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="num-tower">
        <span className="num-box-label">{t('num.clsReal')}</span>
        {box('rational', box('integer', box('natural', null)))}
        {/* Inside ℝ but outside ℚ: exactly where the irrationals live. */}
        <div className="num-band">
          <span className="num-box-label">{t('num.clsIrrational')}</span>
          {chips('irrational')}
        </div>
      </div>

      {sample ? (
        <>
          <Tex block tex={texSeparator(membershipTex(sample), sep)} />
          <p className="card-note lesson-text">{t(`num.towerSay_${sample.cls}`)}</p>
        </>
      ) : (
        <p className="card-note lesson-text">{t('num.towerNone')}</p>
      )}

      <p className="mini-title">{t('num.towerWhyTitle')}</p>
      <div className="table-wrap">
        <table className="paper-table">
          <tbody>
            <tr>
              <td>
                <Tex tex="3 - 5 = -2" />
              </td>
              <td>{t('num.towerWhyZ')}</td>
            </tr>
            <tr>
              <td>
                <Tex tex="3 : 4 = \frac{3}{4}" />
              </td>
              <td>{t('num.towerWhyQ')}</td>
            </tr>
            <tr>
              <td>
                <Tex tex="x^2 = 2" />
              </td>
              <td>{t('num.towerWhyR')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="card-note lesson-text">
        <Trans i18nKey="num.towerIrrNote" components={{ b: <strong />, i: <em /> }} />
      </p>
      <p className="card-note lesson-text">
        {/* The one link that may be an anchor: changing the topic is exactly
            what the URL hash is for. */}
        <Trans i18nKey="num.towerSetsLink" components={{ b: <strong />, i: <em />, a: <a href="#sets" /> }} />
      </p>

      <Exercise
        promptKey="num.towerTask"
        isCorrect={answerKey === TOWER_ANSWER}
        canCheck={TOWER_QUIZ.every((q) => answers[q.id])}
        answerKey={answerKey}
        solutionKey={TOWER_ANSWER}
        onReveal={() => setAnswers(Object.fromEntries(TOWER_QUIZ.map((q) => [q.id, q.cls])))}
        hintKey="num.towerHint"
      >
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>{t('num.towerThNumber')}</th>
                <th>{t('num.towerThSet')}</th>
              </tr>
            </thead>
            <tbody>
              {TOWER_QUIZ.map((q) => (
                <tr key={q.id}>
                  <td>
                    <Tex tex={texSeparator(q.tex, sep)} />
                  </td>
                  <td>
                    <select
                      value={answers[q.id] ?? ''}
                      aria-label={t('num.towerThSet')}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    >
                      <option value="">{t('num.clsPick')}</option>
                      {CLASS_ORDER.map((cls) => (
                        <option key={cls} value={cls}>
                          {t(CLASS_KEY[cls])}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Exercise>
    </section>
  )
}
