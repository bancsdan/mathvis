import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  DATA_ANSWER,
  DATA_VARIANTS,
  frac,
  fracPlain,
  MIX,
  mixConcentration,
  MONEY,
  moneySplit,
  plainValue,
  WORK,
  workDone,
  type DataKind,
} from '../lib/linear'
import { texSeparator } from '../lib/numbers'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

const TABS = ['work', 'mix', 'money'] as const
const KINDS: readonly DataKind[] = ['missing', 'redundant', 'contradictory']

/** 13 000 rather than 13000: an amount is easier to read in threes. */
const grouped = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** One stacked bar: the whole box is the whole thing, the parts are the parts. */
function Bar({ parts }: { parts: readonly { width: number; series: 1 | 2 }[] }) {
  return (
    <div className="lin-bar">
      {parts.map((part, i) => (
        <span
          key={i}
          className="lin-bar-part"
          style={{
            width: `${Math.max(Math.min(part.width, 1), 0) * 100}%`,
            background: `var(--series-${part.series})`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Közös munka, keverés, pénz — és a hibás adatok. Each story has one quantity
 * that has to add up, and the slider is a search for the place where it does.
 * The last part is the other half of modelling: noticing that a text cannot be
 * modelled at all.
 */
export function LinProblemsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const tex = (raw: string) => texSeparator(raw, sep)
  const [tab, setTab] = useState<'work' | 'mix' | 'money'>('work')
  /** Halves of an hour, and halves of a litre: sliders that never drift. */
  const [workHalves, setWorkHalves] = useState(2)
  const [mixHalves, setMixHalves] = useState(0)
  const [small, setSmall] = useState(10000)
  const [picks, setPicks] = useState<Record<string, string>>({})

  const workT = workHalves / 2
  const work = workDone(workT)
  const mixX = mixHalves / 2
  const mixRest = MIX.total - mixX
  const mixPct = mixConcentration(mixX)
  const mixAmount = (mixPct * MIX.total) / 100
  const moneySum = 2 * small + MONEY.diff
  const moneyHit = MONEY.total === moneySum
  const solution = moneySplit(MONEY.total, MONEY.diff)

  const answerKey = DATA_VARIANTS.map((v) => picks[v.id] ?? '').join('|')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.problemsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.problemsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.problemsWorkRule" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="lin.problemsMixRule" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('lin.probAria')}>
        {TABS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            className={tab === tabId ? 'pill active' : 'pill'}
            aria-pressed={tab === tabId}
            onClick={() => setTab(tabId)}
          >
            {t(`lin.prob_${tabId}`)}
          </button>
        ))}
      </div>

      {tab === 'work' && (
        <>
          <p className="card-note lesson-text">{t('lin.workText')}</p>
          <div className="controls-inline">
            <label className="field field-wide">
              <span className="field-label">
                {t('lin.workPickT')}{' '}
                <strong>
                  {plainValue(workT, sep)} {t('lin.unit_h')}
                </strong>
              </span>
              <input
                type="range"
                min={0}
                max={8}
                step={1}
                value={workHalves}
                onChange={(e) => setWorkHalves(Number(e.target.value))}
              />
            </label>
          </div>
          <Bar
            parts={[
              { width: work.part1, series: 1 },
              { width: work.part2, series: 2 },
            ]}
          />
          <p className="lin-result lesson-text">
            {workT === 2 ? (
              <Trans i18nKey="lin.workDone" components={{ b: <strong />, i: <em /> }} />
            ) : (
              <Trans
                i18nKey="lin.workLine"
                values={{
                  t: plainValue(workT, sep),
                  p1: fracPlain(frac(workHalves, 2 * WORK.t1), sep),
                  p2: fracPlain(frac(workHalves, 2 * WORK.t2), sep),
                  total: fracPlain(
                    frac(workHalves * (WORK.t1 + WORK.t2), 2 * WORK.t1 * WORK.t2),
                    sep
                  ),
                }}
                components={{ b: <strong />, i: <em /> }}
              />
            )}
          </p>
          <Tex block tex={`\\frac{t}{${WORK.t1}} + \\frac{t}{${WORK.t2}} = 1`} />
          <Tex block tex="t + 2t = 6" />
          <Tex block tex="t = 2" />
        </>
      )}

      {tab === 'mix' && (
        <>
          <p className="card-note lesson-text">{t('lin.mixText')}</p>
          <div className="controls-inline">
            <label className="field field-wide">
              <span className="field-label">
                {t('lin.mixPickX')}{' '}
                <strong>
                  {plainValue(mixX, sep)} {t('lin.unit_l')}
                </strong>
              </span>
              <input
                type="range"
                min={0}
                max={2 * MIX.total}
                step={1}
                value={mixHalves}
                onChange={(e) => setMixHalves(Number(e.target.value))}
              />
            </label>
          </div>
          <Bar
            parts={[
              { width: mixX / MIX.total, series: 1 },
              { width: mixRest / MIX.total, series: 2 },
            ]}
          />
          <p className="lin-result lesson-text">
            {mixX === 2 ? (
              <Trans i18nKey="lin.mixDone" components={{ b: <strong />, i: <em /> }} />
            ) : (
              <Trans
                i18nKey="lin.mixLine"
                values={{
                  x: plainValue(mixX, sep),
                  rest: plainValue(mixRest, sep),
                  amount: plainValue(mixAmount, sep),
                  pct: plainValue(mixPct, sep),
                }}
                components={{ b: <strong />, i: <em /> }}
              />
            )}
          </p>
          <Tex block tex={tex('0.2x + 0.5(6 - x) = 0.4 \\cdot 6')} />
          <Tex block tex={tex('0.2x + 3 - 0.5x = 2.4')} />
          <Tex block tex={tex('-0.3x = -0.6')} />
          <Tex block tex="x = 2" />
        </>
      )}

      {tab === 'money' && (
        <>
          <p className="card-note lesson-text">{t('lin.moneyText')}</p>
          <div className="controls-inline">
            <label className="field field-wide">
              <span className="field-label">
                {t('lin.moneyPickSmall')}{' '}
                <strong>
                  {grouped(small)} {t('lin.ft')}
                </strong>
              </span>
              <input
                type="range"
                min={0}
                max={MONEY.total}
                step={1000}
                value={small}
                onChange={(e) => setSmall(Number(e.target.value))}
              />
            </label>
          </div>
          <Bar
            parts={[
              { width: small / MONEY.total, series: 1 },
              { width: (small + MONEY.diff) / MONEY.total, series: 2 },
            ]}
          />
          <p className="lin-result lesson-text">
            {moneyHit ? (
              <Trans i18nKey="lin.moneyDone" components={{ b: <strong />, i: <em /> }} />
            ) : (
              <Trans
                i18nKey="lin.moneyLine"
                values={{
                  small: grouped(small),
                  diff: grouped(MONEY.diff),
                  sum: grouped(moneySum),
                }}
                components={{ b: <strong />, i: <em /> }}
              />
            )}
          </p>
          <Tex block tex={`x + (x + ${MONEY.diff}) = ${MONEY.total}`} />
          <Tex block tex={`2x = ${MONEY.total - MONEY.diff}`} />
          <Tex block tex={`x = ${solution.small}`} />
        </>
      )}

      <p className="mini-title">{t('lin.dataTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="lin.problemsIntro2" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="lin.problemsTask"
        isCorrect={answerKey === DATA_ANSWER}
        canCheck={DATA_VARIANTS.every((v) => picks[v.id])}
        answerKey={answerKey}
        solutionKey={DATA_ANSWER}
        onReveal={() => setPicks(Object.fromEntries(DATA_VARIANTS.map((v) => [v.id, v.kind])))}
        hintKey="lin.problemsHint"
      >
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>{t('lin.dataThText')}</th>
                <th>{t('lin.dataThVerdict')}</th>
              </tr>
            </thead>
            <tbody>
              {DATA_VARIANTS.map((variant) => (
                <tr key={variant.id}>
                  <td>{t(`lin.data_${variant.id}`)}</td>
                  <td>
                    <select
                      value={picks[variant.id] ?? ''}
                      aria-label={t('lin.dataThVerdict')}
                      onChange={(e) => setPicks({ ...picks, [variant.id]: e.target.value })}
                    >
                      <option value="">{t('lin.dataOpt_pick')}</option>
                      {KINDS.map((kind) => (
                        <option key={kind} value={kind}>
                          {t(`lin.dataOpt_${kind}`)}
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
