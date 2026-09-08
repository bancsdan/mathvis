import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import hu from './locales/hu.json'

type Bundle = Record<string, Record<string, string>>

/** Every `ns.key` of a bundle, sorted, so two bundles can be compared as sets. */
const flatKeys = (bundle: Bundle): string[] =>
  Object.entries(bundle)
    .flatMap(([ns, entries]) => Object.keys(entries).map((key) => `${ns}.${key}`))
    .sort()

const BUNDLES: Array<[string, Bundle]> = [
  ['hu', hu as Bundle],
  ['en', en as Bundle],
]

/**
 * The one rule the UI depends on: a key present in one language must exist in
 * the other, or that language silently falls back and the page reads half
 * translated. Cheap to check, easy to break when adding a lesson.
 */
describe('locale files', () => {
  it('carry exactly the same keys', () => {
    const [huKeys, enKeys] = BUNDLES.map(([, bundle]) => flatKeys(bundle))
    expect(huKeys).toEqual(enKeys)
  })

  it('are flat and exactly two levels deep', () => {
    for (const [lang, bundle] of BUNDLES) {
      for (const [ns, entries] of Object.entries(bundle)) {
        expect(typeof entries, `${lang}: ${ns}`).toBe('object')
        for (const [key, value] of Object.entries(entries)) {
          expect(typeof value, `${lang}: ${ns}.${key}`).toBe('string')
        }
      }
    }
  })

  it('have no empty strings', () => {
    for (const [lang, bundle] of BUNDLES) {
      for (const [ns, entries] of Object.entries(bundle)) {
        for (const [key, value] of Object.entries(entries)) {
          expect(value.trim(), `${lang}: ${ns}.${key}`).not.toBe('')
        }
      }
    }
  })

  it('use the same interpolation variables in both languages', () => {
    const vars = (s: string) => [...s.matchAll(/\{\{(\w+)[^}]*\}\}/g)].map((m) => m[1]).sort()
    for (const [ns, entries] of Object.entries(hu as Bundle)) {
      for (const [key, value] of Object.entries(entries)) {
        const other = (en as Bundle)[ns][key]
        expect(vars(other), `${ns}.${key}`).toEqual(vars(value))
      }
    }
  })
})
