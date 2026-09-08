import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { checkAssignment, checkScheme, SCHEMES, UNIVERSE } from '../lib/sets'
import { Exercise } from './Exercise'
import { SetsElementGrid } from './SetsElementGrid'

const MOD3_BINS = ['r0', 'r1', 'r2']
const binForMod3 = (elemId: number) => `r${elemId % 3}`

export function SetsPartitionCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const [schemeId, setSchemeId] = useState('byShape')
  const [activeBin, setActiveBin] = useState(MOD3_BINS[0])
  const [assigned, setAssigned] = useState<ReadonlyMap<number, string>>(new Map())

  const scheme = SCHEMES.find((s) => s.id === schemeId) ?? SCHEMES[0]
  const check = useMemo(() => checkScheme(scheme.bins), [scheme])

  const place = (elemId: number) => {
    const next = new Map(assigned)
    if (next.get(elemId) === activeBin) next.delete(elemId)
    else next.set(elemId, activeBin)
    setAssigned(next)
  }

  const exCheck = checkAssignment(assigned, MOD3_BINS)
  const exCorrect =
    exCheck.ok && UNIVERSE.every((e) => assigned.get(e.id) === binForMod3(e.id))
  const answerKey = [...assigned.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(',')
  const solutionKey = UNIVERSE.map((e) => `${e.id}:${binForMod3(e.id)}`).join(',')

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('sets.partTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="sets.partIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <p className="card-note">
          <Trans i18nKey="sets.partIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <div className="controls-inline">
        <label className="field field-wide">
          <span className="field-label">{t('sets.partScheme')}</span>
          <select value={schemeId} onChange={(e) => setSchemeId(e.target.value)}>
            {SCHEMES.map((s) => (
              <option key={s.id} value={s.id}>
                {t(s.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="bin-row">
        {scheme.bins.map((bin) => {
          const members = UNIVERSE.filter(bin.test)
          return (
            <div key={bin.id} className="bin">
              <div className="bin-title">
                <span>{t(bin.labelKey)}</span>
                <span>{members.length}</span>
              </div>
              <SetsElementGrid selected={new Set()} onToggle={() => {}} only={members.map((e) => e.id)} />
            </div>
          )
        })}
      </div>

      <p className={`alias-verdict ${check.ok ? 'verdict-ok' : 'verdict-bad'}`}>
        {check.ok
          ? t('sets.partIsPartition')
          : [
              check.overlapping.length > 0
                ? t('sets.partBadOverlap', { count: check.overlapping.length, list: check.overlapping.join(', ') })
                : null,
              check.uncovered.length > 0
                ? t('sets.partBadGap', { count: check.uncovered.length, list: check.uncovered.join(', ') })
                : null,
            ]
              .filter(Boolean)
              .join(' ')}
      </p>

      <Exercise
        promptKey="sets.partTask"
        isCorrect={exCorrect}
        canCheck={assigned.size > 0}
        answerKey={answerKey}
        solutionKey={solutionKey}
        onReveal={() => setAssigned(new Map(UNIVERSE.map((e) => [e.id, binForMod3(e.id)])))}
        hintKey="sets.partHint"
      >
        <div className="pill-row" role="group" aria-label={t('sets.partActiveBin')}>
          {MOD3_BINS.map((binId) => (
            <button
              key={binId}
              type="button"
              className={activeBin === binId ? 'pill active' : 'pill'}
              aria-pressed={activeBin === binId}
              onClick={() => setActiveBin(binId)}
            >
              {t(`sets.binMod${binId.slice(1)}`)}
            </button>
          ))}
        </div>

        <p className="card-note">{t('sets.partPool')}</p>
        <SetsElementGrid
          selected={new Set([...assigned.keys()].filter((k) => assigned.get(k) === activeBin))}
          onToggle={place}
        />

        <div className="bin-row">
          {MOD3_BINS.map((binId) => {
            const members = [...assigned.entries()].filter(([, v]) => v === binId).map(([k]) => k)
            return (
              <div key={binId} className={activeBin === binId ? 'bin active' : 'bin'}>
                <div className="bin-title">
                  <span>{t(`sets.binMod${binId.slice(1)}`)}</span>
                  <span>{members.length}</span>
                </div>
                <SetsElementGrid selected={new Set()} onToggle={place} only={members} />
              </div>
            )
          })}
        </div>

        {exCheck.uncovered.length > 0 && (
          <p className="card-note">{t('sets.partRemaining', { count: exCheck.uncovered.length })}</p>
        )}
      </Exercise>
    </section>
  )
}
