import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { curve, GRAPH_KINDS, graphXs, SITUATIONS, SITUATIONS_ANSWER, type GraphKind } from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LineChart } from './LineChart'

/** The six situations the small multiples are explored with. */
const PILL_IDS = ['apples', 'taxi', 'speedTime', 'squareArea', 'areaSide', 'ageHeight'] as const

/** Every answer the select offers, in the order they read best. */
const OPTIONS = ['direct', 'inverse', 'linear', 'square', 'root', 'none'] as const

/**
 * Arányosságok grafikonja. Five shapes side by side, and a situation that
 * lights the one it belongs to — including the everyday pair that lights
 * nothing, because two quantities may grow together with no formula at all.
 */
export function PropGraphsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const lit = SITUATIONS.find((s) => s.id === picked)?.kind ?? ''
  const answerKey = SITUATIONS.map((s) => answers[s.id] ?? '').join('|')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.graphsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.graphsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['prop.graphsDef1', 'prop.graphsDef2']} />
        <p className="card-note">
          <Trans i18nKey="prop.graphsIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="prop-multiples">
        {GRAPH_KINDS.map((kind: GraphKind) => {
          const xs = graphXs(kind)
          return (
            <div
              key={kind}
              className={lit === kind ? 'prop-multiple lit' : 'prop-multiple'}
              role="img"
              aria-label={`${t(`prop.graphKind_${kind}`)} — ${t(`prop.graphAria_${kind}`)}`}
            >
              <LineChart
                xs={xs}
                compact
                height={120}
                xLabel="x"
                yLabel="y"
                series={[{ name: t(`prop.graphKind_${kind}`), color: 'var(--series-1)', values: curve(kind, xs) }]}
              />
              <p className="prop-multiple-caption">{t(`prop.graphKind_${kind}`)}</p>
            </div>
          )
        })}
      </div>

      <div className="pill-row" role="group" aria-label={t('prop.graphsAria')}>
        {PILL_IDS.map((sid) => (
          <button
            key={sid}
            type="button"
            className={picked === sid ? 'pill active' : 'pill'}
            aria-pressed={picked === sid}
            onClick={() => setPicked(picked === sid ? '' : sid)}
          >
            {t(`prop.sit_${sid}`)}
          </button>
        ))}
      </div>

      <p className="card-note lesson-text">
        {picked === '' ? t('prop.graphsPickPrompt') : t(`prop.sitWhy_${picked}`)}
      </p>

      <Exercise
        promptKey="prop.graphsTask"
        isCorrect={answerKey === SITUATIONS_ANSWER}
        canCheck={SITUATIONS.every((s) => answers[s.id])}
        answerKey={answerKey}
        solutionKey={SITUATIONS_ANSWER}
        onReveal={() => setAnswers(Object.fromEntries(SITUATIONS.map((s) => [s.id, s.kind])))}
        hintKey="prop.graphsHint"
      >
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>{t('prop.graphsThSituation')}</th>
                <th>{t('prop.graphsThKind')}</th>
              </tr>
            </thead>
            <tbody>
              {SITUATIONS.map((s) => (
                <tr key={s.id}>
                  <td>{t(`prop.sit_${s.id}`)}</td>
                  <td>
                    <select
                      className="answer-input"
                      aria-label={t('prop.graphsSelectAria', { what: t(`prop.sit_${s.id}`) })}
                      value={answers[s.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [s.id]: e.target.value })}
                    >
                      <option value="">{t('prop.optPick')}</option>
                      {OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {t(`prop.opt${opt.charAt(0).toUpperCase()}${opt.slice(1)}`)}
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
