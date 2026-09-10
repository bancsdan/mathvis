import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { implicationReport, logicPredicateById } from '../lib/logic'
import { bucketByRegion, complR, inR, type RegionSet } from '../lib/sets'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LogicPredicateSelect } from './LogicPredicateSelect'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

/** Which statement about P and Q the diagram and the table are showing. */
type Mode = 'imp' | 'conv' | 'iff'

const MODES: readonly Mode[] = ['imp', 'conv', 'iff']

/**
 * The regions that refute each statement: P but not Q for the implication, Q
 * but not P for the converse, and both for the equivalence — which is why
 * "if and only if" is the two implications at once.
 */
const REFUTING: Record<Mode, RegionSet> = {
  imp: 1 << 1,
  conv: 1 << 2,
  iff: (1 << 1) | (1 << 2),
}

const TEX: Record<Mode, string> = {
  imp: 'P \\Rightarrow Q',
  conv: 'Q \\Rightarrow P',
  iff: 'P \\Leftrightarrow Q',
}

const SENTENCE_KEY: Record<Mode, string> = {
  imp: 'logic.impSentence',
  conv: 'logic.impConverseSentence',
  iff: 'logic.iffSentence',
}

/**
 * Exercise: the converse of "if divisible by 6 then even". The distractors are
 * its inverse and its contrapositive, the two classic mix-ups.
 */
const CONVERSE_CHOICES = ['converse', 'inverse', 'contrapositive'] as const
const CONVERSE_ANSWER = 'converse'
/** The converse "if even then divisible by 6" is false: 2 is a counterexample. */
const TRUTH_ANSWER = 'false'

export function LogicImplicationCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('imp')
  const [pId, setPId] = useState('div6')
  const [qId, setQId] = useState('even')
  const [hovered, setHovered] = useState<number | null>(null)
  const [converse, setConverse] = useState<string | null>(null)
  const [truth, setTruth] = useState<string | null>(null)

  const p = logicPredicateById(pId)
  const q = logicPredicateById(qId)
  const report = implicationReport(p, q)
  const buckets = bucketByRegion([p, q])
  const values = { p: t(p.labelKey), q: t(q.labelKey) }

  const holds = mode === 'imp' ? report.forward : mode === 'conv' ? report.converse : report.iff
  const counters =
    mode === 'imp'
      ? report.counterForward
      : mode === 'conv'
        ? report.counterConverse
        : [...report.counterForward, ...report.counterConverse].sort((a, b) => a - b)

  const refuting = REFUTING[mode]
  // Everything the refuting regions leave over is where the statement holds.
  const trueRegions = complR(refuting, 2)

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.q4')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.impIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['logic.impDef', 'logic.impConverseDef']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('logic.impModeAria')}>
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'pill active' : 'pill'}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {t(`logic.impMode_${m}`)}
          </button>
        ))}
      </div>
      <div className="controls-inline">
        <LogicPredicateSelect value={pId} onChange={setPId} labelKey="logic.impPickP" />
        <LogicPredicateSelect value={qId} onChange={setQId} labelKey="logic.impPickQ" />
      </div>

      <Tex block tex={TEX[mode]} />
      <p className="lin-result">
        {t(SENTENCE_KEY[mode], values)} {t(holds ? 'logic.true' : 'logic.false')}.
        {holds ? ` ${t('logic.impHolds')}` : ` ${t('logic.impCounter', { list: counters.join(', ') })}`}
      </p>

      <div className="venn-row">
        <VennDiagram
          n={2}
          shaded={refuting}
          elements={buckets}
          highlight={hovered}
          onHoverRegion={setHovered}
          height={250}
          labelKey="logic.vennImpAria"
        />
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>P</th>
                <th>Q</th>
                <th>
                  <Tex tex={TEX[mode]} />
                </th>
                <th>{t('logic.connColElems')}</th>
              </tr>
            </thead>
            <tbody>
              {[3, 1, 2, 0].map((sig) => (
                <tr
                  key={sig}
                  onMouseEnter={() => setHovered(sig)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ background: hovered === sig ? 'var(--hover-wash)' : undefined }}
                >
                  <td>{t(sig & 1 ? 'logic.true' : 'logic.false')}</td>
                  <td>{t(sig & 2 ? 'logic.true' : 'logic.false')}</td>
                  <td className={inR(trueRegions, sig) ? 'cell-ok' : 'cell-bad'}>
                    {t(inR(trueRegions, sig) ? 'logic.true' : 'logic.false')}
                  </td>
                  <td>{buckets[sig].length ? buckets[sig].join(', ') : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="card-note">{t('logic.impRowHint')}</p>
        </div>
      </div>

      <p className="card-note lesson-text">
        <Trans i18nKey="logic.impContraNote" components={{ b: <strong />, i: <em /> }} />
      </p>

      <Exercise
        promptKey="logic.impTask"
        isCorrect={converse === CONVERSE_ANSWER && truth === TRUTH_ANSWER}
        canCheck={converse !== null && truth !== null}
        answerKey={`${converse ?? ''}|${truth ?? ''}`}
        solutionKey={`${CONVERSE_ANSWER}|${TRUTH_ANSWER}`}
        onReveal={() => {
          setConverse(CONVERSE_ANSWER)
          setTruth(TRUTH_ANSWER)
        }}
        hintKey="logic.impHint"
      >
        <p className="card-note">{t('logic.impTaskStep1')}</p>
        <div className="pill-row" role="group" aria-label={t('logic.impTaskStep1')}>
          {CONVERSE_CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              className={converse === c ? 'pill active' : 'pill'}
              aria-pressed={converse === c}
              onClick={() => setConverse(c)}
            >
              {t(`logic.impChoice_${c}`)}
            </button>
          ))}
        </div>
        <p className="card-note">{t('logic.impTaskStep2')}</p>
        <div className="pill-row" role="group" aria-label={t('logic.impTaskStep2')}>
          {(['true', 'false'] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={truth === v ? 'pill active' : 'pill'}
              aria-pressed={truth === v}
              onClick={() => setTruth(v)}
            >
              {t(`logic.${v}`)}
            </button>
          ))}
        </div>
      </Exercise>
    </section>
  )
}
