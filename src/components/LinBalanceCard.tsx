import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  applyOp,
  BALANCE_ANSWER,
  BALANCE_START,
  balanceTex,
  canApply,
  equationTex,
  evalSide,
  isSolved,
  type Balance,
  type BalanceOp,
  type Pan,
} from '../lib/linear'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'
import { useWidth } from './useWidth'

const HEIGHT = 210
const BEAM_Y = 30
const PAN_Y = 160
const BOX = 24
const UNIT = 14
const GAP = 5
const ROW_H = 29

/** The equation of the exercise, kept next to the answer it expects. */
const TASK = { l: { a: 5, b: -7 }, r: { a: 2, b: 8 } }

/** The three moves, in the order the buttons offer them. */
const MOVES: readonly { id: string; op: BalanceOp }[] = [
  { id: 'RemoveUnit', op: { kind: 'removeUnits', n: 1 } },
  { id: 'RemoveX', op: { kind: 'removeX', n: 1 } },
  { id: 'Halve', op: { kind: 'divide', n: 2 } },
]

interface Placed {
  kind: 'x' | 'unit'
  x: number
  y: number
}

/**
 * Where every box and weight sits on one pan, measured from the middle of the
 * pan's surface. A row that would run off the pan starts a new one above it.
 */
function layoutPan(pan: Pan, panW: number): Placed[] {
  const kinds = [
    ...Array.from({ length: pan.x }, () => 'x' as const),
    ...Array.from({ length: pan.units }, () => 'unit' as const),
  ]
  const widthOf = (kind: 'x' | 'unit') => (kind === 'x' ? BOX : UNIT)

  const rows: ('x' | 'unit')[][] = []
  let row: ('x' | 'unit')[] = []
  let used = 0
  for (const kind of kinds) {
    if (used + widthOf(kind) + GAP > panW && row.length > 0) {
      rows.push(row)
      row = []
      used = 0
    }
    row.push(kind)
    used += widthOf(kind) + GAP
  }
  if (row.length > 0) rows.push(row)

  const placed: Placed[] = []
  rows.forEach((items, ri) => {
    const total = items.reduce((sum, kind) => sum + widthOf(kind) + GAP, -GAP)
    let x = -total / 2
    const y = -(rows.length - 1 - ri) * ROW_H
    for (const kind of items) {
      placed.push({ kind, x: x + widthOf(kind) / 2, y })
      x += widthOf(kind) + GAP
    }
  })
  return placed
}

/**
 * A mérlegelv. The balance is the equation, and the only moves on offer are
 * the ones that can be made on both pans — so no sequence of clicks can ever
 * reach a wrong answer, and the reader is free to try.
 */
export function LinBalanceCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const [balance, setBalance] = useState<Balance>(BALANCE_START)
  const [log, setLog] = useState<{ noteKey: string; tex: string }[]>([])
  const [answer, setAnswer] = useState('')

  const solved = isSolved(balance)
  const value = balance.left.x === 1 ? balance.right.units : balance.left.units
  const panW = Math.max(Math.min(width * 0.4, 210), 90)
  const leftX = width * 0.27
  const rightX = width * 0.73
  const anyDisabled = MOVES.some((move) => !canApply(balance, move.op))

  const play = (move: { id: string; op: BalanceOp }) => {
    const next = applyOp(balance, move.op)
    setBalance(next)
    setLog([...log, { noteKey: `lin.balanceStep${move.id}`, tex: balanceTex(next) }])
  }

  const pans: { pan: Pan; cx: number }[] = [
    { pan: balance.left, cx: leftX },
    { pan: balance.right, cx: rightX },
  ]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('lin.balanceTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="lin.balanceIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="lin.balanceDef" />
        <p className="card-note">
          <Trans i18nKey="lin.balanceIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <Tex block tex={balanceTex(balance)} />

      <div ref={ref} className="chart-box">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={t('lin.balanceAria', { equation: balanceTex(balance) })}
          >
            <path
              d={`M${width / 2},${BEAM_Y} L${width / 2 - 18},${HEIGHT - 8} L${width / 2 + 18},${HEIGHT - 8} Z`}
              fill="var(--grid)"
              stroke="var(--axis)"
            />
            <line
              x1={leftX}
              y1={BEAM_Y}
              x2={rightX}
              y2={BEAM_Y}
              stroke="var(--axis)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            {pans.map(({ pan, cx }, i) => (
              <g key={i === 0 ? 'left' : 'right'}>
                <line x1={cx} y1={BEAM_Y} x2={cx - panW / 2} y2={PAN_Y} stroke="var(--axis)" />
                <line x1={cx} y1={BEAM_Y} x2={cx + panW / 2} y2={PAN_Y} stroke="var(--axis)" />
                <line
                  x1={cx - panW / 2}
                  y1={PAN_Y}
                  x2={cx + panW / 2}
                  y2={PAN_Y}
                  stroke="var(--axis)"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                {layoutPan(pan, panW).map((item, j) =>
                  item.kind === 'x' ? (
                    <g key={j}>
                      <rect
                        className="lin-box"
                        x={cx + item.x - BOX / 2}
                        y={PAN_Y + item.y - BOX}
                        width={BOX}
                        height={BOX}
                        rx={4}
                      />
                      <text
                        className="lin-box-label"
                        x={cx + item.x}
                        y={PAN_Y + item.y - BOX / 2 + 4}
                        textAnchor="middle"
                      >
                        x
                      </text>
                    </g>
                  ) : (
                    <circle
                      key={j}
                      className="lin-unit"
                      cx={cx + item.x}
                      cy={PAN_Y + item.y - UNIT / 2}
                      r={UNIT / 2}
                    />
                  )
                )}
              </g>
            ))}
          </svg>
        )}
      </div>

      <div className="pill-row">
        {MOVES.map((move) => (
          <button
            key={move.id}
            type="button"
            className="btn"
            disabled={!canApply(balance, move.op)}
            onClick={() => play(move)}
          >
            {t(`lin.balance${move.id}`)}
          </button>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => {
            setBalance(BALANCE_START)
            setLog([])
          }}
        >
          {t('lin.balanceReset')}
        </button>
      </div>

      {anyDisabled && <p className="card-note lesson-text">{t('lin.balanceWhyDisabled')}</p>}

      <p className="mini-title">{t('lin.balanceLogTitle')}</p>
      <ul className="step-list">
        <li className="step-row">
          <span>{t('lin.stepStart')}</span>
          <Tex tex={balanceTex(BALANCE_START)} />
        </li>
        {log.map((entry, i) => (
          <li key={i} className="step-row">
            <span>{t(entry.noteKey)}</span>
            <Tex tex={entry.tex} />
          </li>
        ))}
      </ul>

      {solved && (
        <p className="lin-result lesson-text">
          <Trans
            i18nKey="lin.balanceSolved"
            values={{
              x: value,
              left: evalSide({ a: BALANCE_START.left.x, b: BALANCE_START.left.units }, value),
            }}
            components={{ b: <strong />, i: <em /> }}
          />
        </p>
      )}

      <Exercise
        promptKey="lin.balanceTask"
        isCorrect={Number(answer) === BALANCE_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(BALANCE_ANSWER)}
        onReveal={() => setAnswer(String(BALANCE_ANSWER))}
        hintKey="lin.balanceHint"
      >
        <Tex block tex={equationTex(TASK.l, TASK.r)} />
        <label className="field">
          <span className="field-label">{t('lin.balanceAnswerLabel')}</span>
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
