import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  backOptions,
  DEFINE_ANSWER,
  fmt,
  preimages,
  rangeOf,
  RULES,
  valueTable,
  type Rule,
} from '../lib/functions'
import { texSeparator } from '../lib/numbers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const HEIGHT = 230
const M = { top: 16, right: 18, bottom: 28, left: 54 }

/**
 * The chosen pairs as dots on a pair of axes.
 *
 * Its own component so the width observer starts afresh whenever it appears,
 * and because a chart of separate points is not a line chart: joining them up
 * would claim values between the x-es that the function has not got.
 */
function DotPlot({
  rule,
  chosen,
  sep,
  ariaLabel,
}: {
  rule: Rule
  chosen: readonly number[]
  sep: string
  ariaLabel: string
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const plotW = Math.max(width - M.left - M.right, 10)
  const plotH = HEIGHT - M.top - M.bottom

  const xs = rule.domain
  const ys = xs.map((x) => rule.f(x))
  const xLo = Math.min(...xs)
  const xHi = Math.max(...xs)
  const yLo = Math.min(0, ...ys)
  const yHi = Math.max(0, ...ys)
  const padX = (xHi - xLo || 1) * 0.08
  const padY = (yHi - yLo || 1) * 0.12

  const sx = (x: number) => M.left + ((x - (xLo - padX)) / (xHi - xLo + 2 * padX)) * plotW
  const sy = (y: number) => M.top + (1 - (y - (yLo - padY)) / (yHi - yLo + 2 * padY)) * plotH

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel}>
          <line x1={M.left} x2={M.left + plotW} y1={sy(0)} y2={sy(0)} className="fn-axis" />
          <line x1={sx(0)} x2={sx(0)} y1={M.top} y2={M.top + plotH} className="fn-axis" />
          {xs.map((x) => (
            <text key={`t${x}`} x={sx(x)} y={M.top + plotH + 18} textAnchor="middle" className="tick-text">
              {fmt(x, sep)}
            </text>
          ))}
          {chosen.map((x) => (
            <g key={x}>
              <line x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(rule.f(x))} className="fn-stem" />
              <circle cx={sx(x)} cy={sy(rule.f(x))} r={4.5} className="fn-dot" />
              <text
                x={sx(x)}
                y={sy(rule.f(x)) - 9}
                textAnchor="middle"
                className="fn-dot-label"
              >
                {`(${fmt(x, sep)}; ${fmt(rule.f(x), sep)})`}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}

/**
 * A függvény megadása: szabály, táblázat, grafikon.
 *
 * One pair at a time: clicking an x computes it, writes the row and puts the
 * dot on the axes, so the three ways of giving a function are built up side by
 * side out of the same numbers. The picker underneath asks the question the
 * other way round, which is where a value with two x-es — or none — turns up.
 */
export function FnDefineCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [ruleId, setRuleId] = useState(RULES[0].id)
  // One point to begin with, so the plot is never an empty frame.
  const [chosen, setChosen] = useState<number[]>([RULES[0].domain[3]])
  const [back, setBack] = useState('')
  const [answer, setAnswer] = useState('')

  const rule = RULES.find((r) => r.id === ruleId) ?? RULES[0]
  const rows = valueTable(rule).filter((row) => chosen.includes(row.x))
  const values = rangeOf(rule)
  const all = chosen.length === rule.domain.length

  const pickRule = (next: Rule) => {
    setRuleId(next.id)
    setChosen([next.domain[Math.min(3, next.domain.length - 1)]])
    setBack('')
  }

  const toggle = (x: number) =>
    setChosen(chosen.includes(x) ? chosen.filter((v) => v !== x) : [...chosen, x].sort((a, b) => a - b))

  const shown = [...new Set(rows.map((row) => row.y))].sort((a, b) => a - b)
  const listOf = (list: readonly number[]) => list.map((v) => fmt(v, sep)).join('; ')

  const backY = back === '' ? null : Number(back)
  const xs = backY === null ? [] : preimages(rule, backY)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.defineTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.defineIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['fn.defineDef1', 'fn.defineDef2', 'fn.defineDef3', 'fn.defineDef4']} />
        <p className="card-note">
          <Trans i18nKey="fn.defineIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.defineRuleAria')}>
        {RULES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={ruleId === r.id ? 'pill active' : 'pill'}
            aria-pressed={ruleId === r.id}
            onClick={() => pickRule(r)}
          >
            {t(`fn.rule_${r.id}`)}
          </button>
        ))}
      </div>

      <Tex block tex={rule.tex} />

      <p className="mini-title">{t('fn.defineDomainTitle')}</p>
      <div className="num-chip-row" role="group" aria-label={t('fn.defineChipAria')}>
        {rule.domain.map((x) => (
          <button
            key={x}
            type="button"
            className={chosen.includes(x) ? 'num-chip selected' : 'num-chip'}
            aria-pressed={chosen.includes(x)}
            onClick={() => toggle(x)}
          >
            {fmt(x, sep)}
          </button>
        ))}
        <button type="button" className="num-chip" onClick={() => setChosen([...rule.domain])}>
          {t('fn.defineAll')}
        </button>
        <button type="button" className="num-chip" onClick={() => setChosen([])}>
          {t('fn.defineClear')}
        </button>
      </div>

      <DotPlot
        rule={rule}
        chosen={chosen}
        sep={sep}
        ariaLabel={t('fn.defineAria', { rule: t(`fn.rule_${rule.id}`), n: chosen.length })}
      />

      {rows.length > 0 && (
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>x</th>
                <th>f(x)</th>
                <th>{t('fn.defineThWork')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.x}>
                  <td>{fmt(row.x, sep)}</td>
                  <td>{fmt(row.y, sep)}</td>
                  <td>
                    <Tex tex={texSeparator(rule.sub(row.x), sep)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={all ? 'fn.defineRangeAll' : 'fn.defineRange'}
          values={{
            domain: listOf(rule.domain),
            values: shown.length === 0 ? t('fn.defineNothingYet') : listOf(all ? values : shown),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="mini-title">{t('fn.defineBackTitle')}</p>
      <label className="field">
        <span className="field-label">{t('fn.defineBackPick')}</span>
        <select
          className="answer-input fn-select"
          aria-label={t('fn.defineBackAria')}
          value={back}
          onChange={(e) => setBack(e.target.value)}
        >
          <option value="">{t('fn.optPick')}</option>
          {backOptions(rule).map((v) => (
            <option key={v} value={v}>
              {fmt(v, sep)}
            </option>
          ))}
        </select>
      </label>

      {backY !== null && (
        <p className="lin-result lesson-text">
          <Trans
            i18nKey={xs.length === 0 ? 'fn.defineBackNone' : 'fn.defineBack'}
            values={{
              y: fmt(backY, sep),
              xs: xs.map((x) => fmt(x, sep)).join(` ${t('fn.andWord')} `),
            }}
            components={{ b: <strong />, i: <em /> }}
          />
        </p>
      )}

      <Exercise
        promptKey="fn.defineTask"
        isCorrect={Number(answer) === DEFINE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(DEFINE_ANSWER)}
        onReveal={() => setAnswer(String(DEFINE_ANSWER))}
        hintKey="fn.defineHint"
      >
        <Tex block tex="f(x) = 3x - 5" />
        <label className="field">
          <span className="field-label">{t('fn.defineAnswerLabel')}</span>
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
