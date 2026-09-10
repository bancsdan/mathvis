import type { ComponentType } from 'react'
import { DerivativePage } from './components/DerivativePage'
import { FftPage } from './components/FftPage'
import { IntegralPage } from './components/IntegralPage'
import { ALG_EXPLORERS } from './lessons/alg'
import { COMBI_EXPLORERS } from './lessons/combi'
import { FN_EXPLORERS } from './lessons/fn'
import { LIN_EXPLORERS } from './lessons/lin'
import { LOGIC_EXPLORERS } from './lessons/logic'
import { NUM_EXPLORERS } from './lessons/num'
import { POW_EXPLORERS } from './lessons/pow'
import { PROP_EXPLORERS } from './lessons/prop'
import { QUAD_EXPLORERS } from './lessons/quad'
import { SETS_EXPLORERS } from './lessons/sets'

export type SectionId = 'highschool' | 'university'

/**
 * One interactive with just enough words around it: the unit a lesson is made
 * of. Its slug is the second part of the URL hash (`#functions/transform`) and
 * its DOM id is `${topic.prefix}-${explorer.id}` (`fn-transform`).
 */
export interface Explorer {
  /** Slug after the topic in the hash. Unique inside its topic. */
  id: string
  /** i18n key of the short label the in-page section nav shows. */
  navKey: string
  /** i18n key of the question: the card's heading and the home grid entry. */
  questionKey: string
  /** Rendered as `<Card id={`${prefix}-${id}`} />`. */
  Card: ComponentType<{ id: string }>
}

export interface Topic {
  /** Stable id, also the first part of the URL hash (`#derivative`). */
  id: string
  /** i18n key of the topic's menu label under `topics.*`. */
  labelKey: string
  /** Prefix of the lesson's DOM ids and of its locale namespace (`fn`). */
  prefix?: string
  /** The lesson, as the list of explorers it is made of. */
  explorers?: Explorer[]
  /** A whole-page lesson, for topics not split into explorers yet. */
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
      { id: 'sets', labelKey: 'topics.sets', prefix: 'sets', explorers: SETS_EXPLORERS },
      { id: 'logic', labelKey: 'topics.logic', prefix: 'logic', explorers: LOGIC_EXPLORERS },
      {
        id: 'combinatorics',
        labelKey: 'topics.combinatorics',
        prefix: 'combi',
        explorers: COMBI_EXPLORERS,
      },
      { id: 'number-sets', labelKey: 'topics.numberSets', prefix: 'num', explorers: NUM_EXPLORERS },
      {
        id: 'powers-roots',
        labelKey: 'topics.powersRoots',
        prefix: 'pow',
        explorers: POW_EXPLORERS,
      },
      {
        id: 'algebraic-expressions',
        labelKey: 'topics.algebraicExpressions',
        prefix: 'alg',
        explorers: ALG_EXPLORERS,
      },
      {
        id: 'proportionality',
        labelKey: 'topics.proportionality',
        prefix: 'prop',
        explorers: PROP_EXPLORERS,
      },
      {
        id: 'linear-equations',
        labelKey: 'topics.linearEquations',
        prefix: 'lin',
        explorers: LIN_EXPLORERS,
      },
      {
        id: 'quadratic-equations',
        labelKey: 'topics.quadraticEquations',
        prefix: 'quad',
        explorers: QUAD_EXPLORERS,
      },
      { id: 'functions', labelKey: 'topics.functions', prefix: 'fn', explorers: FN_EXPLORERS },
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

/** Whether the topic has anything to read yet, or only the placeholder. */
export function hasLesson(topic: Topic): boolean {
  return topic.page !== undefined || topic.explorers !== undefined
}

export function findTopic(id: string): { section: Section; topic: Topic } | null {
  for (const section of SECTIONS) {
    const topic = section.topics.find((tp) => tp.id === id)
    if (topic) return { section, topic }
  }
  return null
}

export function findExplorer(topicId: string, slug: string): Explorer | null {
  return findTopic(topicId)?.topic.explorers?.find((ex) => ex.id === slug) ?? null
}

/** Where the reader is. A null topic is the home page. */
export interface Route {
  section: Section | null
  topic: Topic | null
  explorer: Explorer | null
}

const HOME: Route = { section: null, topic: null, explorer: null }

/**
 * `#` → home, `#<topic>` → that lesson, `#<topic>/<slug>` → that explorer.
 * Anything unknown falls back to home, so a stale link never shows an error.
 */
export function parseHash(hash: string): Route {
  const [id, slug] = hash.replace(/^#/, '').split('/')
  if (!id) return HOME
  const hit = findTopic(id)
  if (!hit) return HOME
  return { section: hit.section, topic: hit.topic, explorer: slug ? findExplorer(id, slug) : null }
}
