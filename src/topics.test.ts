import { describe, expect, it } from 'vitest'
import en from './i18n/locales/en.json'
import hu from './i18n/locales/hu.json'
import { findExplorer, hasLesson, parseHash, SECTIONS, type Topic } from './topics'

type Bundle = Record<string, Record<string, string>>
const BUNDLES: Array<[string, Bundle]> = [
  ['hu', hu as Bundle],
  ['en', en as Bundle],
]

const TOPICS: Topic[] = SECTIONS.flatMap((section) => section.topics)
const LESSONS: Topic[] = TOPICS.filter((topic) => topic.explorers !== undefined)
const lookup = (bundle: Bundle, key: string) => {
  const [ns, entry] = key.split('.')
  return bundle[ns]?.[entry]
}

/**
 * The registry is the only place that knows which explorer a URL means and
 * which DOM id it scrolls to, so the rules the rest of the app assumes are
 * checked here rather than discovered in the browser.
 */
describe('the explorer registry', () => {
  it('gives every lesson a prefix', () => {
    for (const topic of LESSONS) expect(topic.prefix, topic.id).toBeTruthy()
  })

  // A lesson is scaffolded before it is written: the prefix and an empty list
  // of explorers land first, and until the first card arrives the topic has
  // nothing to read — the menu and the home page must still say so.
  it('counts an empty explorer list as no lesson yet', () => {
    for (const topic of LESSONS) expect(hasLesson(topic), topic.id).toBe(topic.explorers!.length > 0)
    expect(hasLesson({ id: 'x', labelKey: 'topics.x', prefix: 'x', explorers: [] })).toBe(false)
  })

  it('keeps slugs unique inside a topic', () => {
    for (const topic of LESSONS) {
      const slugs = topic.explorers!.map((ex) => ex.id)
      expect(new Set(slugs).size, topic.id).toBe(slugs.length)
    }
  })

  it('names its labels and questions in both languages', () => {
    for (const topic of LESSONS) {
      for (const ex of topic.explorers!) {
        for (const [lang, bundle] of BUNDLES) {
          expect(lookup(bundle, ex.navKey), `${lang}: ${ex.navKey}`).toBeTruthy()
          expect(lookup(bundle, ex.questionKey), `${lang}: ${ex.questionKey}`).toBeTruthy()
        }
      }
    }
  })

  it('keeps every key inside the lesson namespace named by the prefix', () => {
    for (const topic of LESSONS) {
      for (const ex of topic.explorers!) {
        expect(ex.navKey.startsWith(`${topic.prefix}.`), ex.navKey).toBe(true)
        expect(ex.questionKey.startsWith(`${topic.prefix}.`), ex.questionKey).toBe(true)
      }
    }
  })

  // The card id is `${prefix}-${slug}`, which the `.card[id^='fn-']` scroll
  // margin rule and `useActiveSection` both match on, so neither half may
  // carry anything but plain lower case.
  it('builds a usable DOM id out of the prefix and the slug', () => {
    for (const topic of LESSONS) {
      expect(topic.prefix, topic.id).toMatch(/^[a-z]+$/)
      for (const ex of topic.explorers!) expect(ex.id, `${topic.id}/${ex.id}`).toMatch(/^[a-z]+$/)
    }
  })

  it('finds an explorer by topic and slug', () => {
    expect(findExplorer('functions', 'transform')?.navKey).toBe('fn.nav5')
    expect(findExplorer('functions', 'nope')).toBeNull()
    expect(findExplorer('nope', 'transform')).toBeNull()
  })
})

describe('parseHash', () => {
  it('reads an empty hash as the home page', () => {
    expect(parseHash('')).toEqual({ section: null, topic: null, explorer: null })
    expect(parseHash('#')).toEqual({ section: null, topic: null, explorer: null })
  })

  it('reads an unknown topic as the home page', () => {
    expect(parseHash('#nope').topic).toBeNull()
    expect(parseHash('#nope/transform').topic).toBeNull()
  })

  it('reads a topic on its own', () => {
    const route = parseHash('#functions')
    expect(route.topic?.id).toBe('functions')
    expect(route.section?.id).toBe('highschool')
    expect(route.explorer).toBeNull()
  })

  it('reads a topic and an explorer, and gives the card id', () => {
    const route = parseHash('#functions/transform')
    expect(route.topic?.id).toBe('functions')
    expect(`${route.topic?.prefix}-${route.explorer?.id}`).toBe('fn-transform')
  })

  it('ignores an unknown slug but keeps the topic', () => {
    const route = parseHash('#functions/nope')
    expect(route.topic?.id).toBe('functions')
    expect(route.explorer).toBeNull()
  })
})
