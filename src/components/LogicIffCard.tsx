import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { implicationReport, logicPredicateById } from '../lib/logic'
import { bucketByRegion } from '../lib/sets'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LogicPredicateSelect } from './LogicPredicateSelect'
import { Tex } from './Tex'
import { VennDiagram } from './VennDiagram'

/** A only and B only: the two regions that refute "P if and only if Q". */
const DIFFERENCE_REGIONS = (1 << 1) | (1 << 2)

/** Exercise: find two differently worded properties that pick the same elements. */
const SOLUTION = ['div6', 'evenDiv3'] as const

export function LogicIffCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [pId, setPId] = useState('div6')
  const [qId, setQId] = useState('even')
  const [exP, setExP] = useState('even')
  const [exQ, setExQ] = useState('div3')

  const p = logicPredicateById(pId)
  const q = logicPredicateById(qId)
  const report = implicationReport(p, q)
  const values = { p: t(p.labelKey), q: t(q.labelKey) }
  const verdict = (v: boolean) => t(v ? 'logic.true' : 'logic.false')

  const exReport = implicationReport(logicPredicateById(exP), logicPredicateById(exQ))
  const exCorrect = exP !== exQ && exReport.iff

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.iffTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.iffIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey="logic.iffDef" />
        <p className="card-note">
          <Trans i18nKey="logic.iffIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <LogicPredicateSelect value={pId} onChange={setPId} labelKey="logic.impPickP" />
        <LogicPredicateSelect value={qId} onChange={setQId} labelKey="logic.impPickQ" />
      </div>

      <Tex block tex="P \Leftrightarrow Q \;=\; (P \Rightarrow Q) \land (Q \Rightarrow P)" />

      <div className="venn-row">
        <VennDiagram n={2} shaded={DIFFERENCE_REGIONS} elements={bucketByRegion([p, q])} height={230} labelKey="logic.vennIffAria" />
        <div>
          <p className={`alias-verdict ${report.forward ? 'verdict-ok' : 'verdict-bad'}`}>
            <Tex tex="P \Rightarrow Q" /> {verdict(report.forward)}
            {!report.forward && ` (${t('logic.iffBreaks', { list: report.counterForward.join(', ') })})`}
          </p>
          <p className={`alias-verdict ${report.converse ? 'verdict-ok' : 'verdict-bad'}`}>
            <Tex tex="Q \Rightarrow P" /> {verdict(report.converse)}
            {!report.converse && ` (${t('logic.iffBreaks', { list: report.counterConverse.join(', ') })})`}
          </p>
          <p className={`alias-verdict ${report.iff ? 'verdict-ok' : 'verdict-bad'}`}>
            {t('logic.iffSentence', values)} {verdict(report.iff)}
          </p>
          <p className="card-note">{t(report.iff ? 'logic.iffSame' : 'logic.iffDiffer')}</p>
        </div>
      </div>

      <p className="card-note lesson-text">
        <Trans i18nKey="logic.iffSetLink" components={{ b: <strong /> }} />
      </p>
      <Tex block tex="P \Leftrightarrow Q \;\longleftrightarrow\; A = B" />

      <Exercise
        promptKey="logic.iffTask"
        isCorrect={exCorrect}
        canCheck
        answerKey={`${exP}|${exQ}`}
        solutionKey={`${SOLUTION[0]}|${SOLUTION[1]}`}
        onReveal={() => {
          setExP(SOLUTION[0])
          setExQ(SOLUTION[1])
        }}
        hintKey="logic.iffHint"
      >
        <div className="controls-inline">
          <LogicPredicateSelect value={exP} onChange={setExP} labelKey="logic.impPickP" />
          <LogicPredicateSelect value={exQ} onChange={setExQ} labelKey="logic.impPickQ" />
        </div>
        <p className="card-note">
          {t('logic.iffSentence', { p: t(logicPredicateById(exP).labelKey), q: t(logicPredicateById(exQ).labelKey) })}{' '}
          {verdict(exReport.iff)}
        </p>
      </Exercise>
    </section>
  )
}
