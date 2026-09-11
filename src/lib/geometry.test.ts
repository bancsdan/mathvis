import { describe, expect, it } from 'vitest'
import {
  add,
  angleAt,
  arcLength,
  centroid,
  circumcenter,
  cross,
  deg,
  dist,
  dot,
  fmt,
  foot,
  homothety,
  incenter,
  inradius,
  isConvex,
  len,
  lineIntersect,
  mid,
  normalize,
  orthocenter,
  perp,
  polygonArea,
  type Pt,
  rad,
  reflectLine,
  reflectPoint,
  regularPolygon,
  rotate,
  scale,
  sectorArea,
  segmentArea,
  segmentsParallel,
  snapAngle,
  sub,
  tangentPoints,
  triangleArea,
} from './geometry'

/** The 3-4-5 right triangle, right angle at A. */
const A: Pt = { x: 0, y: 0 }
const B: Pt = { x: 4, y: 0 }
const C: Pt = { x: 0, y: 3 }

/** An equilateral triangle of side 2, standing on the x axis. */
const E1: Pt = { x: 0, y: 0 }
const E2: Pt = { x: 2, y: 0 }
const E3: Pt = { x: 1, y: Math.sqrt(3) }

/** An obtuse triangle: the angle at Q is 135°. */
const P: Pt = { x: 0, y: 0 }
const Q: Pt = { x: 4, y: 0 }
const R: Pt = { x: 6, y: 2 }

const near = (a: Pt, b: Pt, digits = 9) => {
  expect(a.x).toBeCloseTo(b.x, digits)
  expect(a.y).toBeCloseTo(b.y, digits)
}

/**
 * Whether X lies outside the triangle: the three triangles it makes with the
 * sides cover more than the triangle itself exactly when it does.
 */
const outside = (X: Pt, a: Pt, b: Pt, c: Pt): boolean =>
  triangleArea(a, b, X) + triangleArea(b, c, X) + triangleArea(c, a, X) >
  triangleArea(a, b, c) + 1e-9

describe('vector basics', () => {
  it('adds, subtracts and scales', () => {
    near(add({ x: 1, y: 2 }, { x: 3, y: -4 }), { x: 4, y: -2 })
    near(sub({ x: 1, y: 2 }, { x: 3, y: -4 }), { x: -2, y: 6 })
    near(scale({ x: 1, y: -2 }, 2.5), { x: 2.5, y: -5 })
  })

  it('reads the dot product as zero exactly when the vectors are perpendicular', () => {
    expect(dot({ x: 3, y: 0 }, { x: 0, y: 4 })).toBe(0)
    expect(dot({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(25)
    expect(dot({ x: 1, y: 0 }, { x: -1, y: 0 })).toBe(-1)
  })

  it('signs the cross product by the direction of the turn', () => {
    expect(cross({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1)
    expect(cross({ x: 0, y: 1 }, { x: 1, y: 0 })).toBe(-1)
    expect(cross({ x: 2, y: 2 }, { x: 3, y: 3 })).toBe(0)
  })

  it('measures lengths and distances', () => {
    expect(len({ x: 3, y: 4 })).toBe(5)
    expect(dist(A, B)).toBe(4)
    expect(dist(B, C)).toBe(5)
  })

  it('halves a segment', () => {
    near(mid(A, B), { x: 2, y: 0 })
    near(mid(B, C), { x: 2, y: 1.5 })
  })

  it('normalises to length one and leaves the zero vector alone', () => {
    near(normalize({ x: 3, y: 4 }), { x: 0.6, y: 0.8 })
    expect(len(normalize({ x: -7, y: 2 }))).toBeCloseTo(1, 12)
    near(normalize({ x: 0, y: 0 }), { x: 0, y: 0 })
  })

  it('turns a vector a quarter turn to the left', () => {
    near(perp({ x: 1, y: 0 }), { x: 0, y: 1 })
    expect(dot({ x: 3, y: -5 }, perp({ x: 3, y: -5 }))).toBe(0)
  })

  it('converts between degrees and radians', () => {
    expect(deg(Math.PI)).toBe(180)
    expect(rad(90)).toBeCloseTo(Math.PI / 2, 12)
    expect(deg(rad(37))).toBeCloseTo(37, 12)
  })
})

describe('angleAt', () => {
  it('finds the right angle of the 3-4-5 triangle', () => {
    expect(angleAt(B, A, C)).toBeCloseTo(90, 9)
    expect(angleAt(A, B, C)).toBeCloseTo(36.8698976458, 6)
    expect(angleAt(A, C, B)).toBeCloseTo(53.1301023542, 6)
  })

  it('gives 60° everywhere in an equilateral triangle', () => {
    for (const [a, b, c] of [
      [E1, E2, E3],
      [E2, E3, E1],
      [E3, E1, E2],
    ] as const) {
      expect(angleAt(a, b, c)).toBeCloseTo(60, 9)
    }
  })

  it('reads an obtuse angle as more than 90°, whichever way round', () => {
    expect(angleAt(P, Q, R)).toBeCloseTo(135, 9)
    expect(angleAt(R, Q, P)).toBeCloseTo(135, 9)
  })

  it('sums to 180° in every triangle', () => {
    const sum = angleAt(Q, P, R) + angleAt(P, Q, R) + angleAt(P, R, Q)
    expect(sum).toBeCloseTo(180, 9)
  })

  it('answers 0 rather than NaN when two of the points coincide', () => {
    expect(angleAt(A, A, B)).toBe(0)
    expect(angleAt(A, B, B)).toBe(0)
  })

  it('stays inside 0…180 for three points on a line', () => {
    expect(angleAt({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(180, 9)
    expect(angleAt({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(0, 9)
  })
})

describe('the transformations', () => {
  it('rotates counter-clockwise around the given centre', () => {
    near(rotate({ x: 1, y: 0 }, A, 90), { x: 0, y: 1 })
    near(rotate({ x: 1, y: 0 }, A, -90), { x: 0, y: -1 })
    near(rotate({ x: 3, y: 1 }, { x: 3, y: 1 }, 137), { x: 3, y: 1 })
    near(rotate({ x: 4, y: 0 }, { x: 2, y: 0 }, 180), { x: 0, y: 0 })
  })

  it('keeps every distance when it rotates', () => {
    const a = rotate(A, Q, 31)
    const b = rotate(B, Q, 31)
    expect(dist(a, b)).toBeCloseTo(dist(A, B), 9)
  })

  it('reflects in a line, twice bringing the point back', () => {
    near(reflectLine({ x: 2, y: 3 }, A, B), { x: 2, y: -3 })
    near(reflectLine({ x: 2, y: 3 }, A, C), { x: -2, y: 3 })
    near(reflectLine(reflectLine(R, A, R), A, R), R)
  })

  it('leaves a point of the axis where it is', () => {
    near(reflectLine({ x: 2, y: 0 }, A, B), { x: 2, y: 0 })
  })

  it('reflects in a slanted line', () => {
    // The line y = x swaps the coordinates.
    near(reflectLine({ x: 3, y: 1 }, A, { x: 1, y: 1 }), { x: 1, y: 3 })
  })

  it('gives a degenerate axis back unchanged', () => {
    near(reflectLine(R, A, A), R)
  })

  it('reflects in a point', () => {
    near(reflectPoint({ x: 1, y: 2 }, A), { x: -1, y: -2 })
    near(reflectPoint({ x: 1, y: 2 }, { x: 3, y: 3 }), { x: 5, y: 4 })
    near(mid({ x: 1, y: 2 }, reflectPoint({ x: 1, y: 2 }, Q)), Q)
  })

  it('scales away from a centre, and turns it around for a negative ratio', () => {
    near(homothety({ x: 2, y: 1 }, A, 3), { x: 6, y: 3 })
    near(homothety({ x: 2, y: 1 }, A, -1), { x: -2, y: -1 })
    near(homothety({ x: 2, y: 1 }, { x: 1, y: 1 }, 0.5), { x: 1.5, y: 1 })
  })

  it('scales lengths by |k| and areas by k²', () => {
    const k = -2
    const [a, b, c] = [A, B, C].map((p) => homothety(p, R, k))
    expect(dist(a, b)).toBeCloseTo(Math.abs(k) * dist(A, B), 9)
    expect(triangleArea(a, b, c)).toBeCloseTo(k * k * triangleArea(A, B, C), 9)
  })
})

describe('foot, intersection and parallels', () => {
  it('drops the perpendicular onto the line', () => {
    near(foot({ x: 2, y: 5 }, A, B), { x: 2, y: 0 })
    near(foot({ x: 1, y: 1 }, A, { x: 1, y: 1 }), { x: 1, y: 1 })
  })

  it('lands outside the segment when the triangle is obtuse', () => {
    // The altitude from P to the line QR falls beyond Q.
    const f = foot(P, Q, R)
    expect(f.x).toBeLessThan(Q.x)
    expect(angleAt(P, f, Q)).toBeCloseTo(90, 9)
  })

  it('makes a right angle with the line, and keeps a point of the line', () => {
    const f = foot(R, A, B)
    expect(angleAt(R, f, B)).toBeCloseTo(90, 9)
    near(foot({ x: 3, y: 0 }, A, B), { x: 3, y: 0 })
  })

  it('collapses onto A when the line is a point', () => {
    near(foot(R, A, A), A)
  })

  it('crosses two lines', () => {
    near(lineIntersect(A, B, { x: 2, y: -1 }, { x: 2, y: 5 })!, { x: 2, y: 0 })
    // Lines, not segments: the crossing may be beyond both pairs of points.
    near(lineIntersect(A, { x: 1, y: 1 }, { x: 4, y: 0 }, { x: 4, y: 1 })!, { x: 4, y: 4 })
  })

  it('answers null for parallel and for identical lines', () => {
    expect(lineIntersect(A, B, { x: 0, y: 2 }, { x: 4, y: 2 })).toBeNull()
    expect(lineIntersect(A, B, A, B)).toBeNull()
  })

  it('sees parallels whichever way each is drawn', () => {
    expect(segmentsParallel(A, B, { x: 1, y: 2 }, { x: 9, y: 2 })).toBe(true)
    expect(segmentsParallel(A, B, { x: 9, y: 2 }, { x: 1, y: 2 })).toBe(true)
    expect(segmentsParallel(A, B, A, C)).toBe(false)
  })

  it('takes a tolerance in the sine of the angle, not in the size of the figure', () => {
    const tilted = { x: 100, y: 1 }
    expect(segmentsParallel(A, B, A, tilted)).toBe(false)
    expect(segmentsParallel(A, B, A, tilted, 0.02)).toBe(true)
    // The same direction, ten times the length: still just as parallel.
    expect(segmentsParallel(A, B, A, scale(tilted, 10), 0.02)).toBe(true)
  })

  it('calls nothing parallel to a point', () => {
    expect(segmentsParallel(A, B, R, R)).toBe(false)
    expect(segmentsParallel(A, A, B, C)).toBe(false)
  })
})

describe('the notable points', () => {
  it('puts the circumcentre of a right triangle on the hypotenuse', () => {
    near(circumcenter(A, B, C)!, { x: 2, y: 1.5 })
    const O = circumcenter(A, B, C)!
    expect(dist(O, A)).toBeCloseTo(2.5, 9)
    expect(dist(O, B)).toBeCloseTo(2.5, 9)
    expect(dist(O, C)).toBeCloseTo(2.5, 9)
  })

  it('puts the circumcentre of an obtuse triangle outside it', () => {
    const O = circumcenter(P, Q, R)!
    expect(dist(O, P)).toBeCloseTo(dist(O, Q), 9)
    expect(dist(O, R)).toBeCloseTo(dist(O, Q), 9)
    expect(outside(O, P, Q, R)).toBe(true)
    // The right triangle's centre, by contrast, sits on the hypotenuse.
    expect(outside(circumcenter(A, B, C)!, A, B, C)).toBe(false)
  })

  it('has no circumcentre for three points on a line', () => {
    expect(circumcenter(A, { x: 1, y: 0 }, { x: 2, y: 0 })).toBeNull()
    expect(circumcenter(A, A, B)).toBeNull()
  })

  it('finds the incentre at equal distance from all three sides', () => {
    const I = incenter(A, B, C)
    near(I, { x: 1, y: 1 })
    expect(dist(I, foot(I, A, B))).toBeCloseTo(1, 9)
    expect(dist(I, foot(I, A, C))).toBeCloseTo(1, 9)
    expect(dist(I, foot(I, B, C))).toBeCloseTo(1, 9)
  })

  it('sits the incentre of an equilateral triangle on its centroid', () => {
    near(incenter(E1, E2, E3), centroid(E1, E2, E3), 9)
  })

  it('averages the vertices for the centroid, and cuts the median 2:1', () => {
    near(centroid(A, B, C), { x: 4 / 3, y: 1 })
    const G = centroid(P, Q, R)
    const m = mid(Q, R)
    expect(dist(P, G) / dist(G, m)).toBeCloseTo(2, 9)
  })

  it('puts the orthocentre of a right triangle on the right angle', () => {
    near(orthocenter(A, B, C)!, A, 9)
  })

  it('puts the orthocentre of an obtuse triangle outside it', () => {
    const H = orthocenter(P, Q, R)!
    expect(outside(H, P, Q, R)).toBe(true)
    // It is still on all three altitudes: the one from P meets QR at its foot.
    expect(cross(sub(H, P), sub(foot(P, Q, R), P))).toBeCloseTo(0, 6)
  })

  it('has no orthocentre for three points on a line', () => {
    expect(orthocenter(A, { x: 1, y: 0 }, { x: 2, y: 0 })).toBeNull()
  })

  it('measures the inradius as area over half the perimeter', () => {
    expect(inradius(A, B, C)).toBeCloseTo(1, 9)
    expect(inradius(E1, E2, E3)).toBeCloseTo(1 / Math.sqrt(3), 9)
    expect(inradius(A, A, A)).toBe(0)
  })
})

describe('areas', () => {
  it('halves the rectangle for a triangle, whatever the order of the vertices', () => {
    expect(triangleArea(A, B, C)).toBe(6)
    expect(triangleArea(C, B, A)).toBe(6)
    expect(triangleArea(E1, E2, E3)).toBeCloseTo(Math.sqrt(3), 9)
    expect(triangleArea(A, B, { x: 8, y: 0 })).toBe(0)
  })

  it('keeps the area when the apex slides along a parallel', () => {
    expect(triangleArea(A, B, { x: 17, y: 3 })).toBeCloseTo(triangleArea(A, B, C), 9)
  })

  it('shoelaces a polygon, either way round', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]
    expect(polygonArea(square)).toBe(4)
    expect(polygonArea([...square].reverse())).toBe(4)
    expect(polygonArea([A, B, C])).toBe(triangleArea(A, B, C))
    expect(polygonArea([A, B])).toBe(0)
  })

  it('finds the area of a trapezoid as (a + c)·m / 2', () => {
    const trapezoid = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 7, y: 4 },
      { x: 1, y: 4 },
    ]
    expect(polygonArea(trapezoid)).toBeCloseTo(((10 + 6) * 4) / 2, 9)
  })
})

describe('isConvex', () => {
  it('accepts a square and a regular polygon', () => {
    expect(
      isConvex([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ])
    ).toBe(true)
    expect(isConvex(regularPolygon(7, 3))).toBe(true)
    expect(isConvex([A, B, C])).toBe(true)
  })

  it('rejects a dented quadrilateral', () => {
    expect(
      isConvex([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 4 },
      ])
    ).toBe(false)
  })

  it('rejects a crossed outline even though the vertices would make a square', () => {
    expect(
      isConvex([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 2, y: 2 },
      ])
    ).toBe(false)
  })

  it('tolerates a vertex sitting on a straight edge', () => {
    expect(
      isConvex([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ])
    ).toBe(true)
  })

  it('rejects anything that is not a polygon', () => {
    expect(isConvex([A, B])).toBe(false)
    expect(isConvex([A, A, A])).toBe(false)
  })
})

describe('regularPolygon', () => {
  it('spaces n vertices evenly on the circle of radius r', () => {
    const hexagon = regularPolygon(6, 2)
    expect(hexagon).toHaveLength(6)
    for (const v of hexagon) expect(len(v)).toBeCloseTo(2, 9)
    for (let i = 0; i < 6; i++) {
      expect(dist(hexagon[i], hexagon[(i + 1) % 6])).toBeCloseTo(2, 9)
    }
  })

  it('starts at the top and turns counter-clockwise', () => {
    const square = regularPolygon(4, 1)
    near(square[0], { x: 0, y: 1 })
    near(square[1], { x: -1, y: 0 })
  })

  it('moves with its centre', () => {
    const shifted = regularPolygon(5, 1, { x: 10, y: -4 })
    for (const v of shifted) expect(dist(v, { x: 10, y: -4 })).toBeCloseTo(1, 9)
  })

  it('gives the regular hexagon of side r the area of six equilateral triangles', () => {
    expect(polygonArea(regularPolygon(6, 2))).toBeCloseTo(6 * Math.sqrt(3), 9)
  })
})

describe('the circle', () => {
  it('cuts the arc and the sector in the same proportion', () => {
    expect(arcLength(6, 360)).toBeCloseTo(12 * Math.PI, 9)
    expect(arcLength(6, 60)).toBeCloseTo(2 * Math.PI, 9)
    expect(sectorArea(6, 360)).toBeCloseTo(36 * Math.PI, 9)
    expect(sectorArea(6, 90)).toBeCloseTo(9 * Math.PI, 9)
    expect(arcLength(3, 0)).toBe(0)
  })

  it('takes the triangle off the sector for the segment', () => {
    expect(segmentArea(1, 90)).toBeCloseTo(Math.PI / 4 - 0.5, 9)
    expect(segmentArea(2, 180)).toBeCloseTo(2 * Math.PI, 9)
    expect(segmentArea(5, 0)).toBeCloseTo(0, 12)
  })

  it('touches the circle at right angles to the radius', () => {
    const O = { x: 0, y: 0 }
    const [T1, T2] = tangentPoints(O, 3, { x: 5, y: 0 })!
    expect(dist(O, T1)).toBeCloseTo(3, 9)
    expect(dist(O, T2)).toBeCloseTo(3, 9)
    expect(angleAt(O, T1, { x: 5, y: 0 })).toBeCloseTo(90, 9)
    // The two tangent segments from the same point are equal: 3-4-5 again.
    expect(dist(T1, { x: 5, y: 0 })).toBeCloseTo(4, 9)
    expect(dist(T2, { x: 5, y: 0 })).toBeCloseTo(4, 9)
  })

  it('returns the counter-clockwise touch point first', () => {
    const [T1, T2] = tangentPoints({ x: 0, y: 0 }, 3, { x: 5, y: 0 })!
    expect(T1.y).toBeGreaterThan(0)
    expect(T2.y).toBeLessThan(0)
  })

  it('has no tangents from inside the circle or from the circle itself', () => {
    expect(tangentPoints(A, 3, { x: 1, y: 0 })).toBeNull()
    expect(tangentPoints(A, 3, { x: 3, y: 0 })).toBeNull()
    expect(tangentPoints(A, 0, { x: 3, y: 0 })).toBeNull()
  })
})

describe('fmt', () => {
  it('rounds to one decimal and drops the trailing zero', () => {
    expect(fmt(5, ',')).toBe('5')
    expect(fmt(5.04, ',')).toBe('5')
    expect(fmt(5.06, ',')).toBe('5,1')
    expect(fmt(Math.sqrt(2), ',')).toBe('1,4')
  })

  it('takes a different number of digits', () => {
    expect(fmt(Math.PI, ',', 3)).toBe('3,142')
    expect(fmt(2.5, ',', 0)).toBe('3')
    expect(fmt(1.0001, ',', 2)).toBe('1')
  })

  it('uses the separator of the language', () => {
    expect(fmt(1.25, '.', 2)).toBe('1.25')
    expect(fmt(1.25, ',', 2)).toBe('1,25')
  })

  it('writes a real minus sign, and never a minus zero', () => {
    expect(fmt(-2.5, ',')).toBe('−2,5')
    expect(fmt(-0.04, ',')).toBe('0')
    expect(fmt(-0, ',')).toBe('0')
  })

  it('prints a dash for a degenerate figure', () => {
    expect(fmt(NaN, ',')).toBe('—')
    expect(fmt(Infinity, ',')).toBe('—')
  })
})

describe('snapAngle', () => {
  it('snaps to a target inside the tolerance and leaves the rest alone', () => {
    expect(snapAngle(88, [0, 90, 180], 3)).toBe(90)
    expect(snapAngle(84, [0, 90, 180], 3)).toBe(84)
    expect(snapAngle(90, [90], 0)).toBe(90)
  })

  it('measures around the circle, so 359° is near 0°', () => {
    expect(snapAngle(359, [0], 2)).toBe(0)
    expect(snapAngle(1, [360], 2)).toBe(360)
    expect(snapAngle(181, [-180], 2)).toBe(-180)
  })

  it('picks the nearest of several targets', () => {
    expect(snapAngle(46, [0, 45, 60, 90], 20)).toBe(45)
    expect(snapAngle(58, [0, 45, 60, 90], 20)).toBe(60)
  })

  it('changes nothing without targets', () => {
    expect(snapAngle(37.5, [], 10)).toBe(37.5)
  })
})
