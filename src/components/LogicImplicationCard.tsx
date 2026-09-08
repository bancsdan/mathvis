import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { connectiveRegions, implicationReport, logicPredicateById } from '../lib/logic'
import { bucketByRegion, inR } from '../lib/sets'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LogicPredicateSelect } from './LogicPredicateSelect'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

const IMP = connectiveRegions('imp')
/** Inside A but outside B: the only region that can refute "if A then B". */
const DANGER_REGION = 1 << 1

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
  const verdict = (v: boolean) => t(v ? 'logic.true' : 'logic.false')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.impTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.impIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="logic.impDef" />
        <p className="card-note">
          <Trans i18nKey="logic.impIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <LogicPredicateSelect value={pId} onChange={setPId} labelKey="logic.impPickP" />
        <LogicPredicateSelect value={qId} onChange={setQId} labelKey="logic.impPickQ" />
      </div>

      <Tex block tex="P \Rightarrow Q" />
      <p className={`alias-verdict ${report.forward ? 'verdict-ok' : 'verdict-bad'}`}>
        {t('logic.impSentence', values)} {verdict(report.forward)}
        {report.forward ? ` ${t('logic.impHolds')}` : ` ${t('logic.impCounter', { list: report.counterForward.join(', ') })}`}
      </p>

      <div className="venn-row">
        <VennDiagram
          n={2}
          shaded={DANGER_REGION}
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
                  <Tex tex="P \Rightarrow Q" />
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
                  <td className={inR(IMP, sig) ? 'cell-ok' : 'cell-bad'}>{t(inR(IMP, sig) ? 'logic.true' : 'logic.false')}</td>
                  <td>{buckets[sig].length ? buckets[sig].join(', ') : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="card-note">{t('logic.impRowHint')}</p>
        </div>
      </div>

      <p className="card-note lesson-text">
        <Trans i18nKey="logic.impSetLink" components={{ b: <strong /> }} />
      </p>
      <Tex block tex="P \Rightarrow Q \;\longleftrightarrow\; A \subseteq B" />

      <p className="mini-title">{t('logic.impConverseTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="logic.impConverseIntro" components={{ b: <strong />, i: <em /> }} />
      </p>
      <Definition i18nKey="logic.impConverseDef" />
      <Tex block tex="Q \Rightarrow P" />
      <p className={`alias-verdict ${report.converse ? 'verdict-ok' : 'verdict-bad'}`}>
        {t('logic.impConverseSentence', values)} {verdict(report.converse)}
        {report.converse ? ` ${t('logic.impHolds')}` : ` ${t('logic.impCounter', { list: report.counterConverse.join(', ') })}`}
      </p>
      <Tex block tex="\neg Q \Rightarrow \neg P" />
      <p className={`alias-verdict ${report.forward ? 'verdict-ok' : 'verdict-bad'}`}>
        {t('logic.impContraSentence', values)} {verdict(report.forward)}
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="logic.impContraNote" components={{ b: <strong /> }} />
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
