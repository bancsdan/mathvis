import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { domainOf, evalQuantified, logicPredicateById, type Quantifier } from '../lib/logic'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { LogicPredicateSelect } from './LogicPredicateSelect'
import { SetsElementGrid } from './SetsElementGrid'
import { Tex } from './Tex'

const QUANTIFIERS: readonly Quantifier[] = ['all', 'some']

/** Exercise: "every element above 6 is even" is false; any odd one above 6 refutes it. */
const TASK_DOMAIN = domainOf('gt6')
const TASK_REPORT = evalQuantified('all', TASK_DOMAIN, logicPredicateById('even'))
const TASK_SOLUTION = TASK_REPORT.counterexamples[0]

export function LogicQuantifierCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [quant, setQuant] = useState<Quantifier>('all')
  const [domainId, setDomainId] = useState('all')
  const [predId, setPredId] = useState('even')
  const [picked, setPicked] = useState<number | null>(null)

  const pred = logicPredicateById(predId)
  const domain = domainOf(domainId)
  const report = evalQuantified(quant, domain, pred)
  const domainText =
    domainId === 'all' ? t('logic.quantDomainAny') : t('logic.quantDomainSome', { d: t(logicPredicateById(domainId).labelKey) })
  const values = { d: domainText, p: t(pred.labelKey) }

  // The negation flips the quantifier and negates the predicate.
  const negated = evalQuantified(quant === 'all' ? 'some' : 'all', domain, { ...pred, test: (e) => !pred.test(e) })

  const verdict = (v: boolean) => t(v ? 'logic.true' : 'logic.false')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('logic.q3')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="logic.quantIntro" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['logic.quantDef1', 'logic.quantDef2']} />
      </div>

      <div className="pill-row" role="group" aria-label={t('logic.quantPickAria')}>
        {QUANTIFIERS.map((q) => (
          <button
            key={q}
            type="button"
            className={quant === q ? 'pill active' : 'pill'}
            aria-pressed={quant === q}
            onClick={() => setQuant(q)}
          >
            {t(`logic.quant_${q}`)}
          </button>
        ))}
      </div>
      <div className="controls-inline">
        <LogicPredicateSelect value={domainId} onChange={setDomainId} labelKey="logic.quantPickDomain" anyKey="logic.quantDomainAll" />
        <LogicPredicateSelect value={predId} onChange={setPredId} labelKey="logic.quantPickPred" />
      </div>

      <Tex block tex={`${quant === 'all' ? '\\forall' : '\\exists'} x\\; P(x)`} />
      <p className="lin-result">
        {t(`logic.quantSentence_${quant}`, values)} {verdict(report.value)}.
        {quant === 'all' && !report.value && ` ${t('logic.quantCounter', { list: report.counterexamples.join(', ') })}`}
        {quant === 'all' && report.value && ` ${t('logic.quantNoCounter')}`}
        {quant === 'some' && report.value && ` ${t('logic.quantWitness', { list: report.examples.join(', ') })}`}
        {quant === 'some' && !report.value && ` ${t('logic.quantNoWitness')}`}
      </p>

      <SetsElementGrid
        framed
        selected={new Set(report.examples)}
        extra={quant === 'all' ? new Set(report.counterexamples) : undefined}
        only={domain.map((e) => e.id)}
        onToggle={() => {}}
      />

      <Tex
        block
        tex={
          quant === 'all'
            ? '\\neg(\\forall x\\; P(x)) \\;=\\; \\exists x\\; \\neg P(x)'
            : '\\neg(\\exists x\\; P(x)) \\;=\\; \\forall x\\; \\neg P(x)'
        }
      />
      <p className={`alias-verdict ${negated.value ? 'verdict-ok' : 'verdict-bad'}`}>
        {t(`logic.quantNegSentence_${quant}`, values)} {verdict(negated.value)}
      </p>
      <p className="card-note lesson-text">
        <Trans i18nKey="logic.quantNegNote" components={{ b: <strong /> }} />
      </p>

      <Exercise
        promptKey="logic.quantTask"
        isCorrect={picked !== null && TASK_REPORT.counterexamples.includes(picked)}
        canCheck={picked !== null}
        answerKey={String(picked ?? '')}
        solutionKey={String(TASK_SOLUTION)}
        onReveal={() => setPicked(TASK_SOLUTION)}
        hintKey="logic.quantHint"
      >
        <SetsElementGrid
          selected={new Set(picked === null ? [] : [picked])}
          only={TASK_DOMAIN.map((e) => e.id)}
          onToggle={(elemId) => setPicked(picked === elemId ? null : elemId)}
        />
      </Exercise>
    </section>
  )
}
