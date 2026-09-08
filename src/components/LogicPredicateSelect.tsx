import { useTranslation } from 'react-i18next'
import { LOGIC_PREDICATES } from '../lib/logic'

interface Props {
  value: string
  onChange: (id: string) => void
  labelKey: string
  /** Extra leading option, e.g. "every element" for a quantifier's domain. */
  anyKey?: string
}

/** A labelled dropdown over the lesson's predicates. Same look as the sets pickers. */
export function LogicPredicateSelect({ value, onChange, labelKey, anyKey }: Props) {
  const { t } = useTranslation()
  return (
    <label className="field">
      <span className="field-label">{t(labelKey)}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {anyKey && <option value="all">{t(anyKey)}</option>}
        {LOGIC_PREDICATES.map((p) => (
          <option key={p.id} value={p.id}>
            {t(p.labelKey)}
          </option>
        ))}
      </select>
    </label>
  )
}
