# MathVis

## 🌐 [bancsdan.github.io/mathvis](https://bancsdan.github.io/mathvis/)

**Interactive math lessons in the browser, in Hungarian and English.** A lesson
is a short list of *explorers*: one interactive each, titled with the question
it answers, so you can go straight at the thing that confuses you. Free, open
source, aimed at Hungarian students.

- [Topics](#topics)
- [Languages](#languages)
- [Run locally](#run-locally)
- [Adding a lesson](#adding-a-lesson)
- [Deploy](#deploy)

## Topics

The site opens on a grid of questions, one card per explorer. The left-hand
menu has a home entry and two collapsible groups under it. The hash is the
route: `#` is home, [`#derivative`](https://bancsdan.github.io/mathvis/#derivative)
is a topic and
[`#functions/transform`](https://bancsdan.github.io/mathvis/#functions/transform)
is one explorer inside a topic. An unknown hash falls back to home. Topics
without a lesson yet appear in the menu with a "soon" badge and show a
placeholder page.

### High school

Follows the topic overview table of the Hungarian framework curriculum.

| Magyar | English | Lesson |
|---|---|---|
| Halmazok | Sets | [✅ open](https://bancsdan.github.io/mathvis/#sets) |
| Matematikai logika | Mathematical logic | [✅ open](https://bancsdan.github.io/mathvis/#logic) |
| Kombinatorika, gráfok | Combinatorics, graphs | [✅ open](https://bancsdan.github.io/mathvis/#combinatorics) |
| Számhalmazok, műveletek | Number sets, operations | [✅ open](https://bancsdan.github.io/mathvis/#number-sets) |
| Hatvány, gyök | Powers, roots | [✅ open](https://bancsdan.github.io/mathvis/#powers-roots) |
| Betűs kifejezések egyenletmegoldásban, függvényábrázolásban | Algebraic expressions in equations and graphs | [✅ open](https://bancsdan.github.io/mathvis/#algebraic-expressions) |
| Arányosság, százalékszámítás | Proportionality, percentages | [✅ open](https://bancsdan.github.io/mathvis/#proportionality) |
| Elsőfokú egyenletek, egyenlőtlenségek, egyenletrendszerek | Linear equations, inequalities, systems | [✅ open](https://bancsdan.github.io/mathvis/#linear-equations) |
| Másodfokú egyenletek, egyenlőtlenségek | Quadratic equations, inequalities | [✅ open](https://bancsdan.github.io/mathvis/#quadratic-equations) |
| A függvény fogalma, függvénytulajdonságok | Functions and their properties | [✅ open](https://bancsdan.github.io/mathvis/#functions) |
| Geometriai alapismeretek | Geometry basics | [✅ open](https://bancsdan.github.io/mathvis/#geometry-basics) |
| Háromszögek | Triangles | [✅ open](https://bancsdan.github.io/mathvis/#triangles) |
| Négyszögek, sokszögek | Quadrilaterals, polygons | [✅ open](https://bancsdan.github.io/mathvis/#polygons) |
| A kör és részei | The circle and its parts | [✅ open](https://bancsdan.github.io/mathvis/#circle) |
| Transzformációk, szerkesztések | Transformations, constructions | [✅ open](https://bancsdan.github.io/mathvis/#transformations) |
| Leíró statisztika | Descriptive statistics | soon |
| Valószínűség-számítás | Probability | soon |

### University

| Magyar | English | Lesson |
|---|---|---|
| Derivált | Derivative | [✅ open](https://bancsdan.github.io/mathvis/#derivative) |
| Integrál | Integral | [✅ open](https://bancsdan.github.io/mathvis/#integral) |
| Fourier-transzformáció | Fourier Transform | [✅ open](https://bancsdan.github.io/mathvis/#fft) |

## Languages

The UI ships in Hungarian and English with a HU/EN switcher in the header
(persisted in localStorage, overridable with `?lang=en`). All copy lives in
translation files under [src/i18n/locales/](src/i18n/locales/). Add a new
language by dropping in another JSON file and registering it in
[src/i18n/index.ts](src/i18n/index.ts).

## Run locally

```sh
npm install
npm run dev      # dev server
npm test         # unit tests for the pure logic
npm run lint     # oxlint
npm run build    # type-check + production build
```

## Adding a lesson

Topics live in [src/topics.ts](src/topics.ts). Write one card component per
explorer, list them in `src/lessons/<prefix>.ts` as an `Explorer[]`, set the
topic's `prefix` and `explorers`, and add the copy — the menu label under
`topics.*`, the short nav label and the question — to both locale files. The
sidebar, the home grid, the placeholder and the `#topic/slug` links update
automatically. [LessonPage.tsx](src/components/LessonPage.tsx) renders any
lesson from that list, so there is no per-lesson page component.

### The explorer shape

An explorer is the question as an `<h2>`, one short framing paragraph, a
`<Definition>` only where the widget needs the term, the interactive itself
with its single `.lin-result` line, at most one bold-led note about a trap the
widget demonstrates, and one `<Exercise>` that checks it. Nothing else.

### The lesson kit

A card owns one interactive and its words, and takes a single `id` prop. The
reusable parts worth knowing about:

- [VennDiagram.tsx](src/components/VennDiagram.tsx) draws two or three circles
  and shades any set of regions. Shading is one SVG mask per region, so it needs
  no arc geometry, and clicks are resolved by asking which circles contain the
  pointer rather than by hit-testing shapes.
- [Exercise.tsx](src/components/Exercise.tsx) wraps a task with check and reveal
  buttons. The section owns the answer and decides correctness.
- [Definition.tsx](src/components/Definition.tsx) is the tinted, labelled box
  every introduced term lives in, so a reader can skim a lesson for "what does
  X mean" by colour alone.
- [ChoiceTree.tsx](src/components/ChoiceTree.tsx) draws a multi-step choice as
  one column per step and one row per possibility, with dead branches dashed so
  a pruned search stays visible.
- [GraphDiagram.tsx](src/components/GraphDiagram.tsx) spreads vertices on a
  circle with optional degree badges and click-to-toggle edges.
- [NumberLine.tsx](src/components/NumberLine.tsx) puts ticks, dots and
  intervals on one scale, with crowded labels stepping up a row rather than
  being dropped. Its labels are plain text, since KaTeX cannot live inside
  an SVG.
- [ArrowDiagram.tsx](src/components/ArrowDiagram.tsx) draws an assignment as two
  columns of labelled nodes with arrows between them, and tints the one node
  that spoils the property being tested. It only draws: the arrows are edited in
  ordinary form controls, so the picture stays keyboard-operable.
- [GeoFigure.tsx](src/components/GeoFigure.tsx) is the figure every geometry
  lesson draws with: a world box in math units with y up, a `Draw` kit of
  segments, lines, rays, polygons, circles, arcs, angle marks, labels,
  measurements and vectors, and points the reader drags with the pointer or
  nudges with the arrow keys.
- [src/lib/](src/lib/) holds the pure logic, all unit tested: `sets.ts` and
  `venn.ts` (set operations and Venn geometry), `logic.ts` (truth tables and
  quantifier and implication checks), `combinatorics.ts` (counting, choice
  trees and graph helpers), `numbers.ts` (decimal to fraction, nested intervals
  and the shared decimal helpers), `powers.ts` (integer, zero and negative exponents, the laws
  of powers as factor groups, string-based normal form, square roots and n-th
  roots with rational exponents), `algebra.ts` (terms and polynomials with one
  tex writer, the linear tracker behind the number tricks, the named identities
  with their mental-arithmetic forms, and completing the square),
  `proportion.ts` (inverse proportion, the graph shapes, the three percent
  questions, chained percentage changes, and compound interest against simple
  interest),
  `linear.ts` (sides and fractions so a root stays 3/2, the balance moves that
  only exist when both pans can afford them, the inequality solver that records
  where the sign turns, substitution and equal coefficients for a two-by-two
  system, and the word-problem models behind meeting cars, joint work and
  mixtures), `quadratic.ts` (the step that loses a root, factoring from the
  roots, the formula derived in letters and in numbers at once, the shapes a
  quadratic inequality's answer can take, substitutions that reduce to a
  quadratic, and the garden and ball models) and `functions.ts` (assignment
  kinds with the node that spoils them, the zeros, extremes and monotone runs
  of a polyline, the three elementary graphs with the solution counts of
  f(x) = c, the transformation steps, the linear inverse and the trip and
  fence models), and `geometry.ts` (vectors and angles in degrees, the four
  transformations, the notable points of a triangle, areas and convexity, the
  circle's arc, sector and tangent points — all in math coordinates with y up).

The lessons share this kit rather than growing their own: the logic lesson puts
the same twelve elements on a `VennDiagram` as the sets lesson, so "and" is
visibly the intersection and "if…, then…" visibly a subset.

Decimals are written with a comma in Hungarian and a point in English, so no
number is ever spelled out in a source file: the separator comes from the
`num.decimalSep` translation key and `formatDecimal` / `texSeparator` in
`numbers.ts` apply it, in prose and in KaTeX alike.

### Checks that guard a lesson

- Both locale files are compared by
  [src/i18n/locales.test.ts](src/i18n/locales.test.ts): the same keys, no empty
  strings and the same interpolation variables in every language.
- The registry is checked by [src/topics.test.ts](src/topics.test.ts): every
  explorer's labels exist in both languages, slugs are unique inside a topic,
  and a hash resolves to the topic and card id it should.
- Diagrams carry `role="img"`, which hides their contents from assistive
  technology, so every interactive diagram is paired with a row of ordinary
  buttons that does the same job for keyboard users.

## Deploy

Pushing to `main` lints, tests, builds and publishes the site to GitHub Pages
via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). A failing
check blocks the deploy. The Vite `base` is set to `/mathvis/` to match the
repo name.
