import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  ALL_ASSIGNMENTS,
  assignmentKey,
  claimHolds,
  isConsistent,
  NIM_MAX_TAKE,
  nimComputerMove,
  nimIsLosing,
  nimWinningMove,
  puzzleById,
  PUZZLES,
  solutions,
  statementFits,
  type Assignment,
  type Islander,
  type Kind,
} from '../lib/logic'
import { Exercise } from './Exercise'
import { useWidth } from './useWidth'

const KINDS: readonly Kind[] = ['knight', 'knave']
const ISLANDERS: readonly Islander[] = ['A', 'B']

/** The first puzzle is worked in full; the rest are the exercise. */
const WORKED = PUZZLES[0]
const TASK_PUZZLES = PUZZLES.slice(1)

const NIM_SIZES = [10, 11, 12, 13, 14, 15, 16]
const TAKES = Array.from({ length: NIM_MAX_TAKE }, (_, i) => i + 1)

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

export function LogicGamesCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [puzzleId, setPuzzleId] = useState(TASK_PUZZLES[0].id)
  const [guess, setGuess] = useState<Partial<Record<Islander, Kind>>>({})

  const [size, setSize] = useState(13)
  const [pile, setPile] = useState(13)
  const [log, setLog] = useState<NimMove[]>([])
  const [showHint, setShowHint] = useState(false)

  const puzzle = puzzleById(puzzleId)
  const complete = guess.A !== undefined && guess.B !== undefined
  const guessed: Assignment | null = complete ? { A: guess.A as Kind, B: guess.B as Kind } : null
  const sols = solutions(puzzle)

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
        <h2>{t('logic.gamesTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.gamesIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <p className="mini-title">{t('logic.islandTitle')}</p>
      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.islandIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="logic.islandIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <ul className="sentence-list">
        {WORKED.statements.map((s) => (
          <li key={s.labelKey} className="sentence-row">
            <span className="sentence-text">
              <strong>{s.speaker}:</strong> {t(s.labelKey)}
            </span>
          </li>
        ))}
      </ul>
      <div className="table-wrap">
        <table className="paper-table">
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              <th>{t('logic.islandColClaim')}</th>
              <th>{t('logic.islandColShould')}</th>
              <th>{t('logic.islandColFits')}</th>
            </tr>
          </thead>
          <tbody>
            {ALL_ASSIGNMENTS.map((a) => {
              const s = WORKED.statements[0]
              const fits = isConsistent(WORKED, a)
              return (
                <tr key={assignmentKey(a)} className={fits ? 'row-ok' : undefined}>
                  <td>{t(`logic.kind_${a.A}`)}</td>
                  <td>{t(`logic.kind_${a.B}`)}</td>
                  <td>{t(claimHolds(s.claim, a) ? 'logic.true' : 'logic.false')}</td>
                  <td>{t(a[s.speaker] === 'knight' ? 'logic.true' : 'logic.false')}</td>
                  <td className={fits ? 'cell-ok' : 'cell-bad'}>{t(fits ? 'logic.islandFits' : 'logic.islandContradiction')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="card-note lesson-text">
        <Trans i18nKey="logic.islandWorkedMoral" components={{ b: <strong /> }} />
      </p>

      <Exercise
        promptKey="logic.islandTask"
        isCorrect={guessed !== null && isConsistent(puzzle, guessed)}
        canCheck={complete}
        answerKey={`${puzzleId}|${guess.A ?? ''}|${guess.B ?? ''}`}
        solutionKey={`${puzzleId}|${assignmentKey(sols[0])}`}
        onReveal={() => setGuess({ A: sols[0].A, B: sols[0].B })}
        hintKey="logic.islandHint"
      >
        <div className="controls-inline">
          <label className="field field-wide">
            <span className="field-label">{t('logic.islandPickPuzzle')}</span>
            <select
              value={puzzleId}
              onChange={(e) => {
                setPuzzleId(e.target.value)
                setGuess({})
              }}
            >
              {TASK_PUZZLES.map((p, i) => (
                <option key={p.id} value={p.id}>
                  {t('logic.islandPuzzleN', { n: i + 1 })}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="sentence-list">
          {puzzle.statements.map((s) => (
            <li key={s.labelKey} className="sentence-row">
              <span className="sentence-text">
                <strong>{s.speaker}:</strong> {t(s.labelKey)}
              </span>
              {guessed && (
                <span className={`sentence-badge ${statementFits(s, guessed) ? 'kind-true' : 'kind-false'}`}>
                  {t(statementFits(s, guessed) ? 'logic.islandFits' : 'logic.islandContradiction')}
                </span>
              )}
            </li>
          ))}
        </ul>
        {ISLANDERS.map((who) => (
          <div key={who} className="pill-row" role="group" aria-label={t('logic.islandWhoAria', { who })}>
            <span className="field-label">{who}:</span>
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={guess[who] === k ? 'pill active' : 'pill'}
                aria-pressed={guess[who] === k}
                onClick={() => setGuess({ ...guess, [who]: k })}
              >
                {t(`logic.kind_${k}`)}
              </button>
            ))}
          </div>
        ))}
        {sols.length > 1 && <p className="card-note">{t('logic.islandManySolutions', { count: sols.length })}</p>}
      </Exercise>

      <p className="mini-title">{t('logic.nimTitle')}</p>
      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.nimIntro1" components={{ b: <strong />, i: <em /> }} />
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

      {gameOver ? (
        <p className={`alias-verdict ${winner === 'you' ? 'verdict-ok' : 'verdict-bad'}`}>
          {t(winner === 'you' ? 'logic.nimYouWin' : 'logic.nimCpuWins')}
        </p>
      ) : (
        <p className="alias-verdict">
          {t('logic.nimLeft', { count: pile })}
          {showHint &&
            ` ${
              yourWinningMove === null
                ? t('logic.nimHintLosing')
                : t('logic.nimHintTake', {
                    count: yourWinningMove,
                    left: pile - yourWinningMove,
                  })
            }`}
        </p>
      )}

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
          components={{ b: <strong /> }}
        />
      </p>
    </section>
  )
}
