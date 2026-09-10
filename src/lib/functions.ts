/**
 * Functions and their properties, for the "A függvény fogalma,
 * függvénytulajdonságok" lesson. No React, no DOM — everything here is pure so
 * it can be unit tested.
 *
 * Three ideas shape the file. First, an assignment between two finite sets is
 * just a list of arrows, and whether it is a function at all is a property of
 * that list, so `classify` and `whyNot` decide it once and the card only draws
 * the verdict. Second, a graph the student reads properties off is a polyline:
 * the zeros, the extremes and the increasing stretches are computed from the
 * points, never typed into the copy. Third, every exercise answer of the lesson
 * lives here as an exported constant, so the tests own it rather than the page.
 *
 * Nothing in this file emits a word in any language: labels are ids the page
 * translates, and decimals are written with a point until `fmt` swaps in the
 * reader's separator.
 */

import { polyTex } from './algebra'
import { formatDecimal } from './numbers'

/** A real function of one real variable. Non-finite means "not defined here". */
export type Fn = (x: number) => number

/**
 * A number for prose: at most two decimals, with the reader's separator.
 *
 * A rounded −0 is written as 0, because "−0 °C" is not a temperature anybody
 * reports.
 */
export function fmt(x: number, sep: string): string {
  const rounded = Math.round(x * 100) / 100
  return formatDecimal(rounded === 0 ? '0' : String(rounded), sep, false)
}

/* ------------------------------------------------------------------ */
/* 1. Assignments between two finite sets                              */
/* ------------------------------------------------------------------ */

/**
 * One everyday assignment drawn as arrows.
 *
 * `left` and `right` are node ids; the page renders their labels from
 * `fn.node_<id>`, so no name is spelled out here. Ids are unique across both
 * columns even where the label repeats (a sibling called Feri is a person on
 * the left and somebody's sibling on the right), so an arrow can never be
 * ambiguous. `arrows[leftId]` lists the right ids that node points to — none,
 * one, or several.
 */
export interface AssignPreset {
  id: string
  left: readonly string[]
  right: readonly string[]
  arrows: Readonly<Record<string, readonly string[]>>
}

export const ASSIGN_PRESETS: readonly AssignPreset[] = [
  {
    id: 'shoes',
    left: ['anna', 'bence', 'csilla', 'dani'],
    right: ['s37', 's38', 's40'],
    arrows: { anna: ['s38'], bence: ['s40'], csilla: ['s38'], dani: ['s37'] },
  },
  {
    id: 'capitals',
    left: ['hu', 'at', 'sk'],
    right: ['budapest', 'vienna', 'bratislava'],
    arrows: { hu: ['budapest'], at: ['vienna'], sk: ['bratislava'] },
  },
  {
    id: 'siblings',
    left: ['eva', 'feri', 'gabi'],
    right: ['sFeri', 'sGabi', 'sHanna'],
    arrows: { eva: [], feri: ['sGabi', 'sHanna'], gabi: ['sFeri'] },
  },
]

/** Not a function; a function; a function that can be turned around. */
export type AssignKind = 'notFunction' | 'function' | 'oneToOne'

/**
 * What kind of assignment a set of arrows is.
 *
 * Exactly one arrow out of every left node makes it a function; no two arrows
 * into the same right node on top of that makes it one-to-one.
 */
export function classify(
  left: readonly string[],
  arrows: Readonly<Record<string, readonly string[]>>
): AssignKind {
  for (const id of left) {
    if ((arrows[id] ?? []).length !== 1) return 'notFunction'
  }
  const seen = new Set<string>()
  for (const id of left) {
    const target = (arrows[id] ?? [])[0]
    if (seen.has(target)) return 'function'
    seen.add(target)
  }
  return 'oneToOne'
}

/**
 * The first node that spoils the stronger property, so the page can light it
 * and say what is wrong with it. `null` once the assignment is one-to-one.
 */
export function whyNot(
  left: readonly string[],
  arrows: Readonly<Record<string, readonly string[]>>
): { leftId: string; reason: 'none' | 'many' } | { rightId: string; reason: 'shared' } | null {
  for (const id of left) {
    const outs = arrows[id] ?? []
    if (outs.length === 0) return { leftId: id, reason: 'none' }
    if (outs.length > 1) return { leftId: id, reason: 'many' }
  }
  const seen = new Set<string>()
  for (const id of left) {
    const target = (arrows[id] ?? [])[0]
    if (seen.has(target)) return { rightId: target, reason: 'shared' }
    seen.add(target)
  }
  return null
}

/** The four everyday assignments of the exercise, with their kind. */
export const ASSIGN_QUIZ: readonly { id: string; kind: AssignKind }[] = [
  { id: 'mother', kind: 'function' },
  { id: 'sibling', kind: 'notFunction' },
  { id: 'plate', kind: 'oneToOne' },
  { id: 'square', kind: 'function' },
]

export const ASSIGN_ANSWER = ASSIGN_QUIZ.map((q) => q.kind).join('|')

/* ------------------------------------------------------------------ */
/* 2. Reading properties off a graph                                   */
/* ------------------------------------------------------------------ */

/** One point of a polyline: `[x, y]`. */
export type Pt = readonly [number, number]

/** A winter day, hour by hour: [hour, °C]. */
export const DAY_TEMPS: readonly Pt[] = [
  [0, -2],
  [4, -4],
  [7, 0],
  [14, 8],
  [20, 3],
  [23, 0],
  [24, -1],
]

/** The value of the polyline at `x`, flat outside its ends. */
export function interpolate(pts: readonly Pt[], x: number): number {
  if (x <= pts[0][0]) return pts[0][1]
  const last = pts[pts.length - 1]
  if (x >= last[0]) return last[1]
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    if (x >= x1 && x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1)
  }
  return last[1]
}

/** Where the polyline crosses or touches y = 0, each x once, in order. */
export function zerosOf(pts: readonly Pt[]): number[] {
  const found: number[] = []
  const add = (x: number) => {
    if (!found.some((v) => Math.abs(v - x) < 1e-9)) found.push(x)
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    if (y1 === 0) add(x1)
    if (y2 === 0) add(x2)
    if (y1 * y2 < 0) add(x1 + ((0 - y1) * (x2 - x1)) / (y2 - y1))
  }
  return found.sort((a, b) => a - b)
}

/**
 * The lowest and the highest point.
 *
 * A polyline takes its extremes at a vertex, so the corners are the only
 * candidates and no sampling is needed.
 */
export function extremes(pts: readonly Pt[]): { min: Pt; max: Pt } {
  let min = pts[0]
  let max = pts[0]
  for (const p of pts) {
    if (p[1] < min[1]) min = p
    if (p[1] > max[1]) max = p
  }
  return { min, max }
}

/** Neighbouring segments that climb, fall or stay level, merged into runs. */
export function monotoneRuns(pts: readonly Pt[]): { from: number; to: number; dir: 'up' | 'down' | 'flat' }[] {
  const runs: { from: number; to: number; dir: 'up' | 'down' | 'flat' }[] = []
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const dir = y2 > y1 ? 'up' : y2 < y1 ? 'down' : 'flat'
    const open = runs[runs.length - 1]
    if (open && open.dir === dir) open.to = x2
    else runs.push({ from: x1, to: x2, dir })
  }
  return runs
}

/** The second graph, an abstract one, for the exercise. */
export const HIKE: readonly Pt[] = [
  [-3, 2],
  [-1, -2],
  [2, 4],
  [5, 1],
]

export const READ_OPTIONS: readonly { id: string; from: number; to: number }[] = [
  { id: 'a', from: -3, to: -1 },
  { id: 'b', from: -1, to: 2 },
  { id: 'c', from: 2, to: 5 },
  { id: 'd', from: -3, to: 5 },
]

/** The one interval `HIKE` increases on. */
export const READ_ANSWER = 'b'

/* ------------------------------------------------------------------ */
/* 3. The linear function                                              */
/* ------------------------------------------------------------------ */

export function linear(m: number, b: number): Fn {
  return (x) => m * x + b
}

/** `f(x) = 2x - 1`, `f(x) = -x`, `f(x) = 3`. */
export function linearTex(m: number, b: number): string {
  return `f(x) = ${polyTex([
    { coef: m, part: 'x' },
    { coef: b, part: '' },
  ])}`
}

/** Rise over run between two points. Vertical pairs are not a function. */
export function slopeBetween(p: Pt, q: Pt): number {
  return (q[1] - p[1]) / (q[0] - p[0])
}

/** The line of the exercise: m = 2, b = −1. */
export const LINEAR_TASK: { p: Pt; q: Pt } = { p: [0, -1], q: [2, 3] }

export const LINEAR_ANSWER = '2|-1'

/* ------------------------------------------------------------------ */
/* 4. The three elementary functions                                   */
/* ------------------------------------------------------------------ */

export type ElemId = 'square' | 'root' | 'recip'

export const ELEM_IDS: readonly ElemId[] = ['square', 'root', 'recip']

/**
 * The three graphs worth knowing by heart, with the properties that are read
 * off them. `zeroTex` is empty where there is no zero at all, and the card
 * writes "none" in the reader's language.
 */
export const ELEM: Record<ElemId, { f: Fn; tex: string }> = {
  square: { f: (x) => x * x, tex: 'f(x) = x^2' },
  root: { f: (x) => (x < 0 ? NaN : Math.sqrt(x)), tex: 'f(x) = \\sqrt{x}' },
  recip: { f: (x) => 1 / x, tex: 'f(x) = \\frac{1}{x}' },
}

/** How close to the pole of 1/x the curve is still drawn. */
const POLE_GAP = 0.25

const grid = (from: number, to: number, step: number): number[] =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) =>
    Math.round((from + i * step) * 1000) / 1000
  )

/** A sample grid fine enough that the curve looks smooth. */
export function elemXs(id: ElemId): number[] {
  if (id === 'square') return grid(-4, 4, 0.1)
  if (id === 'root') return grid(0, 8, 0.1)
  return grid(-4, 4, 0.05)
}

/**
 * The value to plot at `x`, or NaN where there is nothing to plot.
 *
 * The x grid of a chart cannot hold a hole, so the hole lives in the values: a
 * negative x under a square root, and the neighbourhood of the pole of 1/x
 * where the curve would shoot off the picture and drag the whole scale with it.
 */
export function elemValue(id: ElemId, x: number): number {
  if (id === 'recip' && Math.abs(x) < POLE_GAP) return NaN
  const v = ELEM[id].f(x)
  return Number.isFinite(v) ? v : NaN
}

export function elemValues(id: ElemId, xs: readonly number[]): number[] {
  return xs.map((x) => elemValue(id, x))
}

/** How many x satisfy f(x) = c. */
export function solutionCount(id: ElemId, c: number): number {
  if (id === 'square') return c > 0 ? 2 : c === 0 ? 1 : 0
  if (id === 'root') return c >= 0 ? 1 : 0
  return c === 0 ? 0 : 1
}

/** Those x themselves, in increasing order. */
export function solutions(id: ElemId, c: number): number[] {
  if (id === 'square') return c > 0 ? [-Math.sqrt(c), Math.sqrt(c)] : c === 0 ? [0] : []
  if (id === 'root') return c >= 0 ? [c * c] : []
  return c === 0 ? [] : [1 / c]
}

/** The one of the three with no zero at all. */
export const ELEM_ANSWER: ElemId = 'recip'

/* ------------------------------------------------------------------ */
/* 5. Transformations                                                  */
/* ------------------------------------------------------------------ */

/** `y = k · f(x + dx) + dy`, then the absolute value of all that if `abs`. */
export interface Transform {
  dx: number
  dy: number
  k: number
  abs: boolean
}

export function transformed(base: Fn, t: Transform): Fn {
  return (x) => {
    const v = t.k * base(x + t.dx) + t.dy
    return t.abs ? Math.abs(v) : v
  }
}

/** `x`, `x + 1`, `x - 2` — what goes in place of x inside the base. */
function innerTex(dx: number): string {
  if (dx === 0) return 'x'
  return dx > 0 ? `x + ${dx}` : `x - ${Math.abs(dx)}`
}

/** `2(x + 1)^2 - 3`, `\left|\sqrt{x - 2}\right|`, `-\frac{1}{x} + 1`. */
export function transformTex(baseId: ElemId, t: Transform): string {
  const inner = innerTex(t.dx)
  let body =
    baseId === 'square'
      ? t.dx === 0
        ? 'x^2'
        : `(${inner})^2`
      : baseId === 'root'
        ? `\\sqrt{${inner}}`
        : `\\frac{1}{${inner}}`

  const size = Math.abs(t.k)
  if (size !== 1) body = `${size}${body}`
  if (t.k < 0) body = `-${body}`
  if (t.dy !== 0) body = `${body} ${t.dy > 0 ? '+' : '-'} ${Math.abs(t.dy)}`
  return t.abs ? `\\left|${body}\\right|` : body
}

/** The step a transformation is, one word each, in the order they happen. */
export type TransformWord = 'left' | 'right' | 'up' | 'down' | 'stretch' | 'shrink' | 'flip' | 'abs'

/**
 * The moves that turn the base graph into this one.
 *
 * The inside shift comes first because it happens to x before anything else,
 * and a positive `dx` moves the graph *left*: `f(x + 3)` is at −3 what `f` is
 * at 0. That surprise is the point of the section, so the word says "left".
 */
export function transformWords(t: Transform): TransformWord[] {
  const words: TransformWord[] = []
  if (t.dx > 0) words.push('left')
  if (t.dx < 0) words.push('right')
  const size = Math.abs(t.k)
  if (size > 1) words.push('stretch')
  if (size < 1) words.push('shrink')
  if (t.k < 0) words.push('flip')
  if (t.dy > 0) words.push('up')
  if (t.dy < 0) words.push('down')
  if (t.abs) words.push('abs')
  return words
}

export const TRANSFORM_OPTIONS: readonly { id: string; tex: string }[] = [
  { id: 'plus3in', tex: '(x + 3)^2' },
  { id: 'minus3in', tex: '(x - 3)^2' },
  { id: 'minus3out', tex: 'x^2 - 3' },
  { id: 'plus3out', tex: 'x^2 + 3' },
]

/** x² moved three to the right. */
export const TRANSFORM_ANSWER = 'minus3in'

/* ------------------------------------------------------------------ */
/* 6. Turning an assignment around                                     */
/* ------------------------------------------------------------------ */

/** The steps of `mx + b` undone: subtract b, then divide by m. `m` ≠ 0. */
export function inverseLinear(m: number, b: number): { m: number; b: number } {
  return { m: 1 / m, b: -b / m }
}

/**
 * `f^{-1}(x) = \frac{x - 6}{2}`.
 *
 * Written as one fraction rather than as `0.5x - 3`, because that is the shape
 * of the undoing: take the 6 off, then share what is left between the two.
 */
export function inverseTex(m: number, b: number): string {
  const top = b === 0 ? 'x' : b > 0 ? `x - ${b}` : `x + ${Math.abs(b)}`
  return `f^{-1}(x) = ${m === 1 ? top : `\\frac{${top}}{${m}}`}`
}

export const INVERSE_PRESETS: readonly { id: string; m: number; b: number }[] = [
  { id: 'fahrenheit', m: 1.8, b: 32 },
  { id: 'double', m: 2, b: 6 },
  { id: 'vat', m: 1.27, b: 0 },
]

/** What the inverse of 2x + 6 assigns to 10. */
export const INVERSE_ANSWER = 2

/* ------------------------------------------------------------------ */
/* 7. Functions in practice                                            */
/* ------------------------------------------------------------------ */

/** Getting to school: [minutes, metres from home]. */
export const TRIP: readonly Pt[] = [
  [0, 0],
  [6, 400],
  [10, 400],
  [18, 2400],
  [22, 2400],
  [25, 2700],
]

/** How fast the segment containing `t` goes, in metres per minute. */
export function tripSpeed(pts: readonly Pt[], t: number): number {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    if (t >= x1 && t < x2) return (y2 - y1) / (x2 - x1)
  }
  const n = pts.length
  return (pts[n - 1][1] - pts[n - 2][1]) / (pts[n - 1][0] - pts[n - 2][0])
}

/** Twenty metres of string around a rectangle. */
export const FENCE = { perimeter: 20 }

/** The area of the rectangle whose one side is `x`. */
export function fenceArea(x: number, f = FENCE): number {
  return x * (f.perimeter / 2 - x)
}

/** The largest area those twenty metres can fence in. */
export const FENCE_ANSWER = 25
