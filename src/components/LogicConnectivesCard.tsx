import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { applyConnective, connectiveRegions, idsWhere, logicPredicateById, type Connective } from '../lib/logic'
import { bucketByRegion, inR, setsEqual } from '../lib/sets'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LogicPredicateSelect } from './LogicPredicateSelect'
import { SetsElementGrid } from './SetsElementGrid'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

const CONNECTIVES: readonly Connective[] = ['and', 'or', 'xor']

const SYMBOL: Record<Connective, string> = {
  and: '\\land',
  or: '\\lor',
  xor: '\\oplus',
  imp: '\\Rightarrow',
  iff: '\\Leftrightarrow',
}

/** The set operation each connective turns into on the diagram. */
const SET_TEX: Record<Connective, string> = {
  and: 'A \\cap B',
  or: 'A \\cup B',
  xor: '(A \\setminus B) \\cup (B \\setminus A)',
  imp: '\\overline{A} \\cup B',
  iff: '\\overline{(A \\setminus B) \\cup (B \\setminus A)}',
}

/** Exercise: even XOR divisible by 3. Six and twelve satisfy both, so they drop out. */
const TASK_ANSWER = new Set(idsWhere((e) => applyConnective('xor', e.id % 2 === 0, e.id % 3 === 0)))
const keyOf = (s: ReadonlySet<number>) => [...s].sort((a, b) => a - b).join(',')

export function LogicConnectivesCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [aId, setAId] = useState('even')
  const [bId, setBId] = useState('div3')
  const [conn, setConn] = useState<Connective>('and')
  const [hovered, setHovered] = useState<number | null>(null)
  const [answer, setAnswer] = useState<ReadonlySet<number>>(new Set())

  const pa = logicPredicateById(aId)
  const pb = logicPredicateById(bId)
  const shaded = connectiveRegions(conn)
  const buckets = bucketByRegion([pa, pb])
  const result = idsWhere((e) => applyConnective(conn, pa.test(e), pb.test(e)))

  const toggleAnswer = (elemId: number) => {
    const next = new Set(answer)
    if (next.has(elemId)) next.delete(elemId)
    else next.add(elemId)
    setAnswer(next)
  }

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.connTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.connIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['logic.connDef1', 'logic.connDef2', 'logic.connDef3']} />
        <p className="card-note">
          <Trans i18nKey="logic.connIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <LogicPredicateSelect value={aId} onChange={setAId} labelKey="logic.connPickA" />
        <LogicPredicateSelect value={bId} onChange={setBId} labelKey="logic.connPickB" />
      </div>
      <div className="pill-row" role="group" aria-label={t('logic.connPickAria')}>
        {CONNECTIVES.map((c) => (
          <button
            key={c}
            type="button"
            className={conn === c ? 'pill active' : 'pill'}
            aria-pressed={conn === c}
            onClick={() => setConn(c)}
          >
            {t(`logic.conn_${c}`)}
          </button>
        ))}
      </div>

      <p className="alias-verdict">{t(`logic.connSentence_${conn}`, { a: t(pa.labelKey), b: t(pb.labelKey) })}</p>

      <div className="venn-row">
        <VennDiagram
          n={2}
          shaded={shaded}
          elements={buckets}
          highlight={hovered}
          onHoverRegion={setHovered}
          height={250}
          labelKey="logic.vennConnAria"
        />
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                <th>
                  <Tex tex={`A ${SYMBOL[conn]} B`} />
                </th>
                <th>{t('logic.connColElems')}</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3].map((sig) => (
                <tr
                  key={sig}
                  onMouseEnter={() => setHovered(sig)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ background: hovered === sig ? 'var(--hover-wash)' : undefined }}
                >
                  <td>{t(sig & 1 ? 'logic.true' : 'logic.false')}</td>
                  <td>{t(sig & 2 ? 'logic.true' : 'logic.false')}</td>
                  <td className={inR(shaded, sig) ? 'cell-ok' : 'cell-bad'}>{t(inR(shaded, sig) ? 'logic.true' : 'logic.false')}</td>
                  <td>{buckets[sig].length ? buckets[sig].join(', ') : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="card-note">{t('logic.connRowHint')}</p>
        </div>
      </div>

      <p className="card-note lesson-text">
        <Trans i18nKey="logic.connSetLink" components={{ b: <strong /> }} />
      </p>
      <Tex block tex={`A ${SYMBOL[conn]} B \\;\\longleftrightarrow\\; ${SET_TEX[conn]}`} />
      <p className="card-note">{t('logic.connResult', { list: result.length ? result.join(', ') : '–' })}</p>

      <Exercise
        promptKey="logic.connTask"
        isCorrect={setsEqual(answer, TASK_ANSWER)}
        canCheck={answer.size > 0}
        answerKey={keyOf(answer)}
        solutionKey={keyOf(TASK_ANSWER)}
        onReveal={() => setAnswer(new Set(TASK_ANSWER))}
        hintKey="logic.connHint"
      >
        <SetsElementGrid selected={answer} onToggle={toggleAnswer} />
      </Exercise>
    </section>
  )
}
