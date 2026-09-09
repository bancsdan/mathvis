import type { ComponentType } from 'react'
import { CombiPage } from './components/CombiPage'
import { DerivativePage } from './components/DerivativePage'
import { FftPage } from './components/FftPage'
import { IntegralPage } from './components/IntegralPage'
import { LogicPage } from './components/LogicPage'
import { NumPage } from './components/NumPage'
import { PowPage } from './components/PowPage'
import { SetsPage } from './components/SetsPage'

export type SectionId = 'highschool' | 'university'

export interface Topic {
  /** Stable id, also used as the URL hash (`#derivative`). */
  id: string
  /** i18n key of the topic's menu label under `topics.*`. */
  labelKey: string
  /** Lesson page. Topics without one show the "coming soon" placeholder. */
  page?: ComponentType
}

export interface Section {
  id: SectionId
  labelKey: string
  topics: Topic[]
}

/**
 * High school list mirrors the topic overview table of the Hungarian
 * framework curriculum (see README "Curriculum"). Order matters: it is the
 * order they appear in the menu.
 */
export const SECTIONS: Section[] = [
  {
    id: 'highschool',
    labelKey: 'nav.highschool',
    topics: [
      { id: 'sets', labelKey: 'topics.sets', page: SetsPage },
      { id: 'logic', labelKey: 'topics.logic', page: LogicPage },
      { id: 'combinatorics', labelKey: 'topics.combinatorics', page: CombiPage },
      { id: 'number-sets', labelKey: 'topics.numberSets', page: NumPage },
      { id: 'powers-roots', labelKey: 'topics.powersRoots', page: PowPage },
      { id: 'algebraic-expressions', labelKey: 'topics.algebraicExpressions' },
      { id: 'proportionality', labelKey: 'topics.proportionality' },
      { id: 'linear-equations', labelKey: 'topics.linearEquations' },
      { id: 'quadratic-equations', labelKey: 'topics.quadraticEquations' },
      { id: 'functions', labelKey: 'topics.functions' },
      { id: 'geometry-basics', labelKey: 'topics.geometryBasics' },
      { id: 'triangles', labelKey: 'topics.triangles' },
      { id: 'polygons', labelKey: 'topics.polygons' },
      { id: 'circle', labelKey: 'topics.circle' },
      { id: 'transformations', labelKey: 'topics.transformations' },
      { id: 'statistics', labelKey: 'topics.statistics' },
      { id: 'probability', labelKey: 'topics.probability' },
    ],
  },
  {
    id: 'university',
    labelKey: 'nav.university',
    topics: [
      { id: 'derivative', labelKey: 'topics.derivative', page: DerivativePage },
      { id: 'integral', labelKey: 'topics.integral', page: IntegralPage },
      { id: 'fft', labelKey: 'topics.fft', page: FftPage },
    ],
  },
]

// The site opens on the first high school lesson: high school students are the
// main audience.
export const DEFAULT_TOPIC_ID = 'sets'

export function findTopic(id: string): { section: Section; topic: Topic } | null {
  for (const section of SECTIONS) {
    const topic = section.topics.find((tp) => tp.id === id)
    if (topic) return { section, topic }
  }
  return null
}
