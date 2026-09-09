import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  BILL_ANSWER,
  BILL_DEFAULT,
  billLines,
  groupThousands,
  percentRate,
  plainNumber,
  round,
} from '../lib/proportion'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/**
 * Egy háztartási számla elemzése. The energy charge is a direct proportion,
 * the bill as a whole is not — the fixed fee and the VAT sit on top of it.
 * The second column makes the difference impossible to miss: double the
 * consumption and the payable amount does not double with it.
 */
export function PropBillCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [kwh, setKwh] = useState(BILL_DEFAULT.kwh)
  const [unitPrice, setUnitPrice] = useState(BILL_DEFAULT.unitPrice)
  const [fixedFee, setFixedFee] = useState(BILL_DEFAULT.fixedFee)
  const [compare, setCompare] = useState(false)
  const [answer, setAnswer] = useState('')

  const bill = { kwh, unitPrice, fixedFee, vat: BILL_DEFAULT.vat }
  const lines = billLines(bill)
  const doubled = billLines({ ...bill, kwh: 2 * kwh })
  const ratio = lines.gross === 0 ? 0 : round(doubled.gross / lines.gross, 1)
  const share = percentRate(lines.energy, lines.gross)

  const money = (value: number) => `${groupThousands(value)} ${t('prop.ft')}`

  const rows: { label: string; now: string; twice: string; total?: boolean }[] = [
    { label: t('prop.billRowKwh'), now: `${kwh} kWh`, twice: `${2 * kwh} kWh` },
    { label: t('prop.billRowPrice'), now: `${unitPrice} Ft/kWh`, twice: `${unitPrice} Ft/kWh` },
    { label: t('prop.billRowEnergy'), now: money(lines.energy), twice: money(doubled.energy) },
    { label: t('prop.billRowFee'), now: money(fixedFee), twice: money(fixedFee) },
    { label: t('prop.billRowNet'), now: money(lines.net), twice: money(doubled.net) },
    { label: t('prop.billRowVat'), now: money(lines.vatAmount), twice: money(doubled.vatAmount) },
    { label: t('prop.billRowGross'), now: money(lines.gross), twice: money(doubled.gross), total: true },
  ]

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('prop.billTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="prop.billIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['prop.billDef1', 'prop.billDef2']} />
        <p className="card-note">
          <Trans i18nKey="prop.billIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field">
          <span className="field-label">
            {t('prop.billPickKwh')} <strong>{kwh}</strong>
          </span>
          <input type="range" min={0} max={400} step={10} value={kwh} onChange={(e) => setKwh(Number(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">
            {t('prop.billPickPrice')} <strong>{unitPrice}</strong>
          </span>
          <input
            type="range"
            min={30}
            max={50}
            step={1}
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field-label">
            {t('prop.billPickFee')} <strong>{groupThousands(fixedFee)}</strong>
          </span>
          <input
            type="range"
            min={0}
            max={2000}
            step={100}
            value={fixedFee}
            onChange={(e) => setFixedFee(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table className="paper-table prop-bill">
          <thead>
            <tr>
              <th>{t('prop.billThLine')}</th>
              <th>{t('prop.billThValue')}</th>
              {compare && <th>{t('prop.billThDouble')}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={row.total ? 'prop-total' : undefined}>
                <td>{row.total ? <strong>{row.label}</strong> : row.label}</td>
                <td>{row.total ? <strong>{row.now}</strong> : row.now}</td>
                {compare && <td>{row.total ? <strong>{row.twice}</strong> : row.twice}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Tex block tex={`${kwh} \\cdot ${unitPrice} = ${lines.energy}`} />

      <p className="card-note lesson-text">
        <Trans
          i18nKey="prop.billShare"
          values={{ share: plainNumber(share, sep) }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <button type="button" className="btn" onClick={() => setCompare(!compare)}>
        {compare ? t('prop.billCompareHide') : t('prop.billCompare')}
      </button>

      {compare && (
        <p className="card-note lesson-text">
          <Trans
            i18nKey="prop.billCompareNote"
            values={{ ratio: plainNumber(ratio, sep) }}
            components={{ b: <strong />, i: <em /> }}
          />
        </p>
      )}

      <Exercise
        promptKey="prop.billTask"
        isCorrect={Number(answer) === BILL_ANSWER}
        canCheck={answer.trim() !== ''}
        answerKey={answer}
        solutionKey={String(BILL_ANSWER)}
        onReveal={() => setAnswer(String(BILL_ANSWER))}
        hintKey="prop.billHint"
      >
        <label className="field">
          <span className="field-label">{t('prop.billAnswerLabel')}</span>
          <input className="answer-input" type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
      </Exercise>
    </section>
  )
}
