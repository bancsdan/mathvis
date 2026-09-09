import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { formatDecimal } from '../lib/numbers'
import {
  isPerfectSquare,
  ROOT_LAW_CHOICES,
  ROOT_SUM_TRAP,
  SIMPLIFY_ANSWER,
  SIMPLIFY_CHOICES,
  simplifyRoot,
  sqrtText,
} from '../lib/powers'
import { Definition } from './Definition'
import { Exercise } from './Exercise'
import { Tex } from './Tex'

/** `6` for a whole root, `2{,}236` otherwise — the value, however it comes out. */
const rootTex = (n: number, sep: string): string =>
  isPerfectSquare(n) ? String(Math.sqrt(n)) : formatDecimal(sqrtText(n, 3), sep, true)

/**
 * A gyökvonás azonosságai. Both sides of each law are evaluated side by side,
 * so the student sees that they always meet — and that the sum does not.
 */
export function PowSqrtLawsCard({ id }: { id: string }) {
  const { t } = useTranslation()
  const sep = t('num.decimalSep')
  const [a, setA] = useState(4)
  const [b, setB] = useState(9)
  const [under, setUnder] = useState(48)
  const [outside, setOutside] = useState('')
  const [inside, setInside] = useState('')

  const simple = simplifyRoot(under)
  const eq = isPerfectSquare(a * b) ? '=' : '\\approx'
  // The middle step splits the root, so it is exact only when both parts are.
  const eqParts = isPerfectSquare(a) && isPerfectSquare(b) ? '=' : '\\approx'
  const eqDiv = isPerfectSquare(a / b) ? '=' : '\\approx'
  const answerKey = `${outside}|${inside}`

  return (
    <section className="card" id={id}>
      <div className="card-head">
        <h2>{t('pow.sqrtLawsTitle')}</h2>
      </div>

      <div className="lesson-text">
        <p className="card-note">
          <Trans i18nKey="pow.sqrtLawsIntro1" components={{ b: <strong />, i: <em /> }} />
        </p>
        <Definition i18nKey={['pow.sqrtLawsDef1', 'pow.sqrtLawsDef2']}>
          <Tex block tex="\sqrt{a \cdot b} = \sqrt{a} \cdot \sqrt{b} \qquad \sqrt{\frac{a}{b}} = \frac{\sqrt{a}}{\sqrt{b}}" />
        </Definition>
        <p className="card-note">
          <Trans i18nKey="pow.sqrtLawsIntro2" components={{ b: <strong />, i: <em /> }} />
        </p>
      </div>

      <span className="field-label">{t('pow.sqrtLawsPickA')}</span>
      <div className="pill-row" role="group" aria-label={t('pow.sqrtLawsPickA')}>
        {ROOT_LAW_CHOICES.map((v) => (
          <button
            key={v}
            type="button"
            className={a === v ? 'pill active' : 'pill'}
            aria-pressed={a === v}
            onClick={() => setA(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <span className="field-label">{t('pow.sqrtLawsPickB')}</span>
      <div className="pill-row" role="group" aria-label={t('pow.sqrtLawsPickB')}>
        {ROOT_LAW_CHOICES.map((v) => (
          <button
            key={v}
            type="button"
            className={b === v ? 'pill active' : 'pill'}
            aria-pressed={b === v}
            onClick={() => setB(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <Tex block tex={`\\sqrt{${a} \\cdot ${b}} = \\sqrt{${a * b}} ${eq} ${rootTex(a * b, sep)}`} />
      <Tex
        block
        tex={`\\sqrt{${a}} \\cdot \\sqrt{${b}} ${eqParts} ${rootTex(a, sep)} \\cdot ${rootTex(b, sep)} ${eq} ${rootTex(a * b, sep)}`}
      />
      <Tex
        block
        tex={`\\sqrt{\\frac{${a}}{${b}}} = \\frac{\\sqrt{${a}}}{\\sqrt{${b}}} ${eqDiv} ${rootTex(a / b, sep)}`}
      />

      <p className="mini-title">{t('pow.sqrtLawsTrapTitle')}</p>
      <Tex
        block
        tex={`\\sqrt{${ROOT_SUM_TRAP.a} + ${ROOT_SUM_TRAP.b}} = ${Math.sqrt(ROOT_SUM_TRAP.a + ROOT_SUM_TRAP.b)} \\ne ${Math.sqrt(ROOT_SUM_TRAP.a) + Math.sqrt(ROOT_SUM_TRAP.b)} = \\sqrt{${ROOT_SUM_TRAP.a}} + \\sqrt{${ROOT_SUM_TRAP.b}}`}
      />
      <p className="card-note lesson-text">
        <Trans
          i18nKey="pow.sqrtLawsTrap"
          values={{
            a: ROOT_SUM_TRAP.a,
            b: ROOT_SUM_TRAP.b,
            whole: Math.sqrt(ROOT_SUM_TRAP.a + ROOT_SUM_TRAP.b),
            parts: Math.sqrt(ROOT_SUM_TRAP.a) + Math.sqrt(ROOT_SUM_TRAP.b),
          }}
          components={{ b: <strong />, i: <em /> }}
        />
      </p>

      <p className="mini-title">{t('pow.sqrtLawsSimpTitle')}</p>
      <p className="card-note lesson-text">
        <Trans i18nKey="pow.sqrtLawsSimpIntro" components={{ b: <strong />, i: <em /> }} />
      </p>
      <span className="field-label">{t('pow.sqrtLawsSimpPick')}</span>
      <div className="pill-row" role="group" aria-label={t('pow.sqrtLawsSimpPick')}>
        {SIMPLIFY_CHOICES.map((v) => (
          <button
            key={v}
            type="button"
            className={under === v ? 'pill active' : 'pill'}
            aria-pressed={under === v}
            onClick={() => setUnder(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <Tex
        block
        tex={`\\sqrt{${under}} = \\sqrt{${simple.outside * simple.outside} \\cdot ${simple.inside}} = ${simple.outside}\\sqrt{${simple.inside}}`}
      />
      <p className="alias-verdict">
        {t('pow.sqrtLawsSimpNote', {
          n: under,
          square: simple.outside * simple.outside,
          root: simple.outside,
        })}
      </p>

      <Exercise
        promptKey="pow.sqrtLawsTask"
        isCorrect={Number(outside) === SIMPLIFY_ANSWER.outside && Number(inside) === SIMPLIFY_ANSWER.inside}
        canCheck={outside.trim() !== '' && inside.trim() !== ''}
        answerKey={answerKey}
        solutionKey={`${SIMPLIFY_ANSWER.outside}|${SIMPLIFY_ANSWER.inside}`}
        onReveal={() => {
          setOutside(String(SIMPLIFY_ANSWER.outside))
          setInside(String(SIMPLIFY_ANSWER.inside))
        }}
        hintKey="pow.sqrtLawsHint"
      >
        <div className="controls-inline">
          <label className="field">
            <span className="field-label">{t('pow.sqrtLawsAnswerOut')}</span>
            <input
              className="answer-input"
              type="number"
              value={outside}
              onChange={(e) => setOutside(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('pow.sqrtLawsAnswerIn')}</span>
            <input
              className="answer-input"
              type="number"
              value={inside}
              onChange={(e) => setInside(e.target.value)}
            />
          </label>
        </div>
      </Exercise>
    </section>
  )
}
