import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { NIM_MAX_TAKE, nimComputerMove, nimIsLosing, nimWinningMove } from '../lib/logic'
import { Exercise } from './Exercise'
import { useWidth } from './useWidth'

const NIM_SIZES = [10, 11, 12, 13, 14, 15, 16]
const TAKES = Array.from({ length: NIM_MAX_TAKE }, (_, i) => i + 1)

/** The task pile, and the move that leaves a multiple of four behind. */
const TASK_PILE = 13
const TASK_ANSWER = TASK_PILE % (NIM_MAX_TAKE + 1)

interface NimMove {
  who: 'you' | 'cpu'
  take: number
  left: number
}

/** Matches drawn as sticks, grouped in fours so the winning pattern is visible. */
function NimPile({ pile, showHint }: { pile: number; showHint: boolean }) {
  const { t } = useTranslation()
  const [ref, width] = useWidth<HTMLDivElement>()
  const height = 70
  const gap = Math.min(22, width / 20)
  const groupGap = gap * 0.8
  const totalW = pile * gap + Math.floor(Math.max(pile - 1, 0) / 4) * groupGap
  const x0 = Math.max(8, (width - totalW) / 2)

  return (
    <div ref={ref} className="chart-box">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={t('logic.nimPileAria', { count: pile })}>
          {Array.from({ length: pile }, (_, i) => {
            const x = x0 + i * gap + Math.floor(i / 4) * groupGap
            const inFullGroup = showHint && Math.floor(i / 4) < Math.floor(pile / 4)
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={18}
                  x2={x}
                  y2={height - 8}
                  stroke={inFullGroup ? 'var(--series-1)' : 'var(--axis)'}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <circle cx={x} cy={14} r={4} fill={inFullGroup ? 'var(--series-1)' : 'var(--series-2)'} />
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export function LogicNimCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [size, setSize] = useState(13)
  const [pile, setPile] = useState(13)
  const [log, setLog] = useState<NimMove[]>([])
  const [showHint, setShowHint] = useState(false)
  const [answer, setAnswer] = useState('')

  const gameOver = pile === 0
  const winner = gameOver ? log[log.length - 1]?.who : null

  const play = (take: number) => {
    const afterYou = pile - take
    const moves: NimMove[] = [{ who: 'you', take, left: afterYou }]
    let left = afterYou
    if (left > 0) {
      const reply = nimComputerMove(left)
      left -= reply
      moves.push({ who: 'cpu', take: reply, left })
    }
    setPile(left)
    setLog([...log, ...moves])
  }

  const restart = (n: number) => {
    setSize(n)
    setPile(n)
    setLog([])
  }

  const yourWinningMove = nimWinningMove(pile)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.q6')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.nimIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">{t('logic.nimPickSize')}</span>
          <select value={size} onChange={(e) => restart(Number(e.target.value))}>
            {NIM_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="pill-row">
        <button type="button" className="btn" onClick={() => restart(size)}>
          {t('logic.nimRestart')}
        </button>
        <label className="checkbox-inline">
          <input type="checkbox" checked={showHint} onChange={(e) => setShowHint(e.target.checked)} />
          {t('logic.nimShowHint')}
        </label>
      </div>

      <NimPile pile={pile} showHint={showHint} />

      <div className="pill-row" role="group" aria-label={t('logic.nimTakeAria')}>
        {TAKES.map((k) => (
          <button key={k} type="button" className="btn btn-primary" disabled={gameOver || k > pile} onClick={() => play(k)}>
            {t('logic.nimTake', { count: k })}
          </button>
        ))}
      </div>

      <p className="lin-result">
        {gameOver
          ? t(winner === 'you' ? 'logic.nimYouWin' : 'logic.nimCpuWins')
          : t('logic.nimLeft', { count: pile })}
        {!gameOver &&
          showHint &&
          ` ${
            yourWinningMove === null
              ? t('logic.nimHintLosing')
              : t('logic.nimHintTake', { count: yourWinningMove, left: pile - yourWinningMove })
          }`}
      </p>

      {log.length > 0 && (
        <ol className="nim-log">
          {log.map((m, i) => (
            <li key={i}>
              {t(m.who === 'you' ? 'logic.nimLogYou' : 'logic.nimLogCpu', {
                count: m.take,
                left: m.left,
              })}
            </li>
          ))}
        </ol>
      )}

      <p className="card-note lesson-text">
        <Trans
          i18nKey="logic.nimStrategy"
          values={{
            losing: nimIsLosing(size) ? t('logic.nimStartLosing') : t('logic.nimStartWinning'),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="logic.nimTask"
        isCorrect={Number(answer) === TASK_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(TASK_ANSWER)}
        onReveal={() => setAnswer(String(TASK_ANSWER))}
        hintKey="logic.nimHint"
      >
        <label className="field">
          <span className="field-label">{t('logic.nimAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
