/**
 * Plane geometry for the five geometry lessons. No React, no DOM, no pixels:
 * everything here works in math coordinates with **y pointing up**, so a
 * positive `cross` is a counter-clockwise turn and a positive rotation angle
 * turns left. `GeoFigure` is the one place that maps this world onto a screen.
 *
 * Angles are in **degrees** everywhere a lesson can see them — a student reads
 * 60°, not 1.047 — and only the two converters and the trigonometry inside
 * know about radians.
 *
 * Degenerate input is answered with `null` or 0 rather than `NaN` wherever the
 * question has no answer (three points on a line have no circumcentre), so a
 * card can drag a vertex through the degenerate case without the figure
 * blowing up.
 */

import { formatDecimal } from './numbers'

/** A point of the plane, in math coordinates (y up). Also used as a vector. */
export interface Pt {
  x: number
  y: number
}

/** Below this, two lengths or a cross product count as zero. */
const EPS = 1e-9

/* ------------------------------------------------------------------ */
/* Vector basics                                                       */
/* ------------------------------------------------------------------ */

export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y })

export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })

export const scale = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k })

export const dot = (a: Pt, b: Pt): number => a.x * b.x + a.y * b.y

/** The z of the cross product: positive when b is to the left of a. */
export const cross = (a: Pt, b: Pt): number => a.x * b.y - a.y * b.x

export const len = (a: Pt): number => Math.hypot(a.x, a.y)

export const dist = (a: Pt, b: Pt): number => Math.hypot(b.x - a.x, b.y - a.y)

export const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/** The unit vector of the same direction. The zero vector stays zero. */
export const normalize = (a: Pt): Pt => {
  const l = len(a)
  return l < EPS ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l }
}

/** Turned a quarter turn to the left (counter-clockwise). */
export const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x })

export const deg = (radians: number): number => (radians * 180) / Math.PI

export const rad = (degrees: number): number => (degrees * Math.PI) / 180

/* ------------------------------------------------------------------ */
/* Angles and the transformations                                      */
/* ------------------------------------------------------------------ */

/**
 * The angle ∠ABC at the middle point, in degrees between 0 and 180.
 *
 * It is the angle of the figure, not a direction: it never tells clockwise
 * from counter-clockwise. A card that needs the turn direction asks `cross`.
 */
export function angleAt(A: Pt, B: Pt, C: Pt): number {
  const u = sub(A, B)
  const v = sub(C, B)
  const lu = len(u)
  const lv = len(v)
  if (lu < EPS || lv < EPS) return 0
  // Clamped: rounding can push the quotient a hair outside [-1, 1] when the
  // three points are nearly collinear, and acos would answer NaN.
  const cos = Math.min(1, Math.max(-1, dot(u, v) / (lu * lv)))
  return deg(Math.acos(cos))
}

/** P turned around O by `degrees`, counter-clockwise for a positive angle. */
export function rotate(P: Pt, O: Pt, degrees: number): Pt {
  const a = rad(degrees)
  const c = Math.cos(a)
  const s = Math.sin(a)
  const d = sub(P, O)
  return { x: O.x + d.x * c - d.y * s, y: O.y + d.x * s + d.y * c }
}

/** The mirror image of P in the line AB. A degenerate line gives P back. */
export function reflectLine(P: Pt, A: Pt, B: Pt): Pt {
  if (dist(A, B) < EPS) return { ...P }
  const F = foot(P, A, B)
  return { x: 2 * F.x - P.x, y: 2 * F.y - P.y }
}

/** The mirror image of P in the point O: O is the midpoint of P and P'. */
export const reflectPoint = (P: Pt, O: Pt): Pt => ({ x: 2 * O.x - P.x, y: 2 * O.y - P.y })

/** P scaled away from O by the ratio k. Negative k also turns it around. */
export const homothety = (P: Pt, O: Pt, k: number): Pt => add(O, scale(sub(P, O), k))

/**
 * The foot of the perpendicular dropped from P onto the line AB — the point of
 * the line nearest to P, wherever it falls, including outside the segment.
 */
export function foot(P: Pt, A: Pt, B: Pt): Pt {
  const d = sub(B, A)
  const dd = dot(d, d)
  if (dd < EPS * EPS) return { ...A }
  return add(A, scale(d, dot(sub(P, A), d) / dd))
}

/**
 * Where the lines AB and CD cross, or null if they are parallel (the same line
 * included: a whole line of answers is no answer). Lines, not segments — the
 * crossing may lie beyond either pair of points.
 */
export function lineIntersect(A: Pt, B: Pt, C: Pt, D: Pt): Pt | null {
  const r = sub(B, A)
  const s = sub(D, C)
  const den = cross(r, s)
  if (Math.abs(den) < EPS) return null
  return add(A, scale(r, cross(sub(C, A), s) / den))
}

/**
 * Whether AB and CD point the same way (or exactly opposite ways).
 *
 * `tol` is measured on the sine of the angle between them, so it does not
 * change with the size of the figure: 0.02 is "within about a degree", which
 * is the kind of tolerance a dragged figure needs. A point-sized "segment" has
 * no direction and is never parallel to anything.
 */
export function segmentsParallel(A: Pt, B: Pt, C: Pt, D: Pt, tol = 1e-9): boolean {
  const r = sub(B, A)
  const s = sub(D, C)
  const lr = len(r)
  const ls = len(s)
  if (lr < EPS || ls < EPS) return false
  return Math.abs(cross(r, s)) / (lr * ls) <= tol
}

/* ------------------------------------------------------------------ */
/* The notable points of a triangle                                    */
/* ------------------------------------------------------------------ */

/** The centre of the circle through all three vertices; null if collinear. */
export function circumcenter(A: Pt, B: Pt, C: Pt): Pt | null {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y))
  if (Math.abs(d) < EPS) return null
  const a = A.x * A.x + A.y * A.y
  const b = B.x * B.x + B.y * B.y
  const c = C.x * C.x + C.y * C.y
  return {
    x: (a * (B.y - C.y) + b * (C.y - A.y) + c * (A.y - B.y)) / d,
    y: (a * (C.x - B.x) + b * (A.x - C.x) + c * (B.x - A.x)) / d,
  }
}

/**
 * The centre of the inscribed circle: the weighted average of the vertices,
 * each weighted by the side facing it. It always exists — a flattened triangle
 * simply has it on the line.
 */
export function incenter(A: Pt, B: Pt, C: Pt): Pt {
  const a = dist(B, C)
  const b = dist(C, A)
  const c = dist(A, B)
  const sum = a + b + c
  if (sum < EPS) return { ...A }
  return scale(add(add(scale(A, a), scale(B, b)), scale(C, c)), 1 / sum)
}

/** Where the medians meet: the plain average of the three vertices. */
export const centroid = (A: Pt, B: Pt, C: Pt): Pt => scale(add(add(A, B), C), 1 / 3)

/**
 * Where the three altitudes meet; null if the triangle is degenerate.
 *
 * Read off Euler's line rather than intersected: H = A + B + C − 2·O, which is
 * exact and needs no second intersection.
 */
export function orthocenter(A: Pt, B: Pt, C: Pt): Pt | null {
  const O = circumcenter(A, B, C)
  if (!O) return null
  return sub(add(add(A, B), C), scale(O, 2))
}

/** The radius of the inscribed circle: area over half the perimeter. */
export function inradius(A: Pt, B: Pt, C: Pt): number {
  const s = (dist(B, C) + dist(C, A) + dist(A, B)) / 2
  return s < EPS ? 0 : triangleArea(A, B, C) / s
}

/* ------------------------------------------------------------------ */
/* Areas and polygons                                                  */
/* ------------------------------------------------------------------ */

/** Always positive: half the cross product of two sides. */
export const triangleArea = (A: Pt, B: Pt, C: Pt): number =>
  Math.abs(cross(sub(B, A), sub(C, A))) / 2

/** The shoelace area, absolute, so the order of the vertices does not matter. */
export function polygonArea(pts: readonly Pt[]): number {
  if (pts.length < 3) return 0
  let sum = 0
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    sum += cross(a, b)
  }
  return Math.abs(sum) / 2
}

/**
 * Whether every turn of the outline goes the same way. Collinear vertices are
 * tolerated; a self-crossing outline is not convex, and neither is anything
 * with fewer than three vertices.
 */
export function isConvex(pts: readonly Pt[]): boolean {
  const n = pts.length
  if (n < 3) return false
  let sign = 0
  let turn = 0
  for (let i = 0; i < n; i++) {
    const u = sub(pts[(i + 1) % n], pts[i])
    const v = sub(pts[(i + 2) % n], pts[(i + 1) % n])
    turn += angleAt(pts[i], pts[(i + 1) % n], pts[(i + 2) % n])
    const z = cross(u, v)
    // A vertex sitting on the straight edge between its neighbours turns
    // neither way: it decides nothing about convexity, but its 180° still
    // counts towards the angle sum below.
    if (Math.abs(z) < EPS) continue
    const s = z > 0 ? 1 : -1
    if (sign === 0) sign = s
    else if (s !== sign) return false
  }
  // Every turn the same way still allows a star: the interior angles of a
  // convex n-gon sum to (n − 2)·180°, and nothing else does.
  return sign !== 0 && Math.abs(turn - (n - 2) * 180) < 1e-6
}

/**
 * The vertices of a regular n-gon, first one at the top and going
 * counter-clockwise, so a triangle stands on its base and a square sits
 * diamond-wise — the way the figures of the lesson are drawn.
 */
export function regularPolygon(n: number, r: number, center: Pt = { x: 0, y: 0 }): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (2 * Math.PI * i) / n
    out.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* The circle                                                          */
/* ------------------------------------------------------------------ */

/** The length of the arc cut by a central angle, in degrees. */
export const arcLength = (r: number, degrees: number): number => (2 * r * Math.PI * degrees) / 360

/** The area of the pie slice cut by a central angle, in degrees. */
export const sectorArea = (r: number, degrees: number): number => (r * r * Math.PI * degrees) / 360

/** The sector minus the triangle: the slice cut off by the chord alone. */
export const segmentArea = (r: number, degrees: number): number =>
  ((r * r) / 2) * (rad(degrees) - Math.sin(rad(degrees)))

/**
 * Where the two tangents drawn from P touch the circle (O, r), or null if P is
 * inside it or on it — there the question has no answer or only one. The first
 * of the pair is the one reached by turning counter-clockwise from OP.
 */
export function tangentPoints(O: Pt, r: number, P: Pt): [Pt, Pt] | null {
  const d = dist(O, P)
  if (r <= EPS || d <= r + EPS) return null
  const phi = deg(Math.acos(r / d))
  const base = add(O, scale(normalize(sub(P, O)), r))
  return [rotate(base, O, phi), rotate(base, O, -phi)]
}

/* ------------------------------------------------------------------ */
/* Writing numbers and snapping them                                   */
/* ------------------------------------------------------------------ */

/**
 * A measured number as the lesson prints it: rounded to `digits` decimals,
 * trailing zeros dropped (so 5 is "5", not "5,0"), the separator of the
 * reader's language, and a minus sign rather than a hyphen. A value that
 * rounds to zero from below reads "0", never "−0". A figure dragged into a
 * degenerate position can hand over a NaN; that prints as a dash rather than
 * as the word.
 */
export function fmt(x: number, sep: string, digits = 1): string {
  if (!Number.isFinite(x)) return '—'
  const rounded = Number(x.toFixed(digits))
  return formatDecimal(rounded === 0 ? '0' : String(rounded), sep, false)
}

/**
 * The nearest of the given angles if it is within `tol` degrees, otherwise the
 * value untouched — the "snaps to 90°" behaviour of a dragged figure.
 *
 * Compared around the circle, so 359° snaps to 0° as readily as 1° does.
 */
export function snapAngle(value: number, targets: readonly number[], tol: number): number {
  let best = value
  let bestGap = tol
  for (const target of targets) {
    const raw = Math.abs(((value - target) % 360) + 360) % 360
    const gap = Math.min(raw, 360 - raw)
    if (gap <= bestGap) {
      bestGap = gap
      best = target
    }
  }
  return best
}
