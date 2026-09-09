import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  ASSIGN_ANSWER,
  ASSIGN_PRESETS,
  ASSIGN_QUIZ,
  classify,
  whyNot,
  type AssignPreset,
} from '../lib/functions'
import { ArrowDiagram } from './ArrowDiagram'
import { Definition } from './Definition'
import { Exercise } from './Exercise'

/** The select value that stands for "two arrows out of this node". */
const TWO = 'two'

/** The kinds the quiz offers, in the order they read best. */
const OPTIONS = ['notFunction', 'function', 'oneToOne'] as const

type Arrows = Record<string, readonly string[]>

const startArrows = (preset: AssignPreset): Arrows => ({ ...preset.arrows })

/**
 * Hozzárendelések: egyértelmű és kölcsönösen egyértelmű.
 *
 * The two properties are one arrow out of every left node, and no two arrows
 * into the same right node. Both are visible in the picture, so the selects
 * are free to break either of them: the verdict line names the node that
 * spoils it and the diagram lights that node.
 */
export function FnAssignCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [presetId, setPresetId] = useState(ASSIGN_PRESETS[0].id)
  const [arrows, setArrows] = useState<Arrows>(startArrows(ASSIGN_PRESETS[0]))
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const preset = ASSIGN_PRESETS.find((p) => p.id === presetId) ?? ASSIGN_PRESETS[0]
  const label = (nodeId: string) => t(`fn.node_${nodeId}`)

  const pick = (p: AssignPreset) => {
    setPresetId(p.id)
    setArrows(startArrows(p))
  }

  const setArrow = (leftId: string, value: string) => {
    const outs = value === '' ? [] : value === TWO ? preset.right.slice(0, 2) : [value]
    setArrows({ ...arrows, [leftId]: outs })
  }

  const valueOf = (leftId: string) => {
    const outs = arrows[leftId] ?? []
    if (outs.length === 0) return ''
    return outs.length === 1 ? outs[0] : TWO
  }

  const kind = classify(preset.left, arrows)
  const fault = whyNot(preset.left, arrows)
  const lit =
    fault === null
      ? undefined
      : 'leftId' in fault
        ? { leftId: fault.leftId }
        : { rightId: fault.rightId }

  const verdictValues =
    fault === null
      ? {}
      : 'leftId' in fault
        ? { node: label(fault.leftId), why: t(fault.reason === 'none' ? 'fn.whyNone' : 'fn.whyMany') }
        : { node: label(fault.rightId) }

  const answerKey = ASSIGN_QUIZ.map((q) => answers[q.id] ?? '').join('|')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('fn.assignTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="fn.assignIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['fn.assignDef1', 'fn.assignDef2', 'fn.assignDef3']} />
        <p className="card-note">
          <Trans i18nKey="fn.assignIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="pill-row" role="group" aria-label={t('fn.assignScAria')}>
        {ASSIGN_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={presetId === p.id ? 'pill active' : 'pill'}
            aria-pressed={presetId === p.id}
            onClick={() => pick(p)}
          >
            {t(`fn.assignSc_${p.id}`)}
          </button>
        ))}
      </div>

      <ArrowDiagram
        left={preset.left.map((nodeId) => ({ id: nodeId, label: label(nodeId) }))}
        right={preset.right.map((nodeId) => ({ id: nodeId, label: label(nodeId) }))}
        arrows={arrows}
        lit={lit}
        ariaLabel={t('fn.assignAria', { scenario: t(`fn.assignSc_${preset.id}`) })}
      />

      <div className="fn-selects" role="group" aria-label={t('fn.assignEditAria')}>
        {preset.left.map((leftId) => (
          <label key={leftId} className="field">
            <span className="field-label">{t('fn.assignFrom', { node: label(leftId) })}</span>
            <select
              className="answer-input fn-select"
              aria-label={t('fn.assignSelectAria', { node: label(leftId) })}
              value={valueOf(leftId)}
              onChange={(e) => setArrow(leftId, e.target.value)}
            >
              <option value="">{t('fn.assignNone')}</option>
              {preset.right.map((rightId) => (
                <option key={rightId} value={rightId}>
                  {label(rightId)}
                </option>
              ))}
              <option value={TWO}>{t('fn.assignTwo')}</option>
            </select>
          </label>
        ))}
      </div>

      <p className="lin-result lesson-text">
        <Trans
          i18nKey={`fn.assignVerdict_${kind}`}
          values={verdictValues}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <Exercise
        promptKey="fn.assignTask"
        isCorrect={answerKey === ASSIGN_ANSWER}
        canCheck={ASSIGN_QUIZ.every((q) => answers[q.id])}
        answerKey={answerKey}
        solutionKey={ASSIGN_ANSWER}
        onReveal={() => setAnswers(Object.fromEntries(ASSIGN_QUIZ.map((q) => [q.id, q.kind])))}
        hintKey="fn.assignHint"
      >
        <div className="table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th>{t('fn.assignThWhat')}</th>
                <th>{t('fn.assignThKind')}</th>
              </tr>
            </thead>
            <tbody>
              {ASSIGN_QUIZ.map((q) => (
                <tr key={q.id}>
                  <td>{t(`fn.quiz_${q.id}`)}</td>
                  <td>
                    <select
                      className="answer-input fn-select"
                      aria-label={t('fn.assignQuizAria', { what: t(`fn.quiz_${q.id}`) })}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    >
                      <option value="">{t('fn.optPick')}</option>
                      {OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {t(`fn.opt_${opt}`)}
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
