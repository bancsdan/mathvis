# MathVis

## 🌐 [bancsdan.github.io/mathvis](https://bancsdan.github.io/mathvis/)

**Interactive math lessons in the browser, in Hungarian and English.** Each
lesson teaches one concept by letting you drag its central idea around. Free,
open source, aimed at Hungarian students.

- [Topics](#topics)
- [Languages](#languages)
- [Run locally](#run-locally)
- [Adding a lesson](#adding-a-lesson)
- [Deploy](#deploy)

## Topics

The left-hand menu has two collapsible groups. Each topic is deep-linkable via
its hash, e.g. [`#derivative`](https://bancsdan.github.io/mathvis/#derivative).
Topics without a lesson yet appear in the menu with a "soon" badge and show a
placeholder page.

### High school

Follows the topic overview table of the Hungarian framework curriculum. The
site opens on Halmazok.

| Magyar | English | Lesson |
|---|---|---|
| Halmazok | Sets | [✅ open](https://bancsdan.github.io/mathvis/#sets) |
| Matematikai logika | Mathematical logic | [✅ open](https://bancsdan.github.io/mathvis/#logic) |
| Kombinatorika, gráfok | Combinatorics, graphs | [✅ open](https://bancsdan.github.io/mathvis/#combinatorics) |
| Számhalmazok, műveletek | Number sets, operations | soon |
| Hatvány, gyök | Powers, roots | soon |
| Betűs kifejezések egyenletmegoldásban, függvényábrázolásban | Algebraic expressions in equations and graphs | soon |
| Arányosság, százalékszámítás | Proportionality, percentages | soon |
| Elsőfokú egyenletek, egyenlőtlenségek, egyenletrendszerek | Linear equations, inequalities, systems | soon |
| Másodfokú egyenletek, egyenlőtlenségek | Quadratic equations, inequalities | soon |
| A függvény fogalma, függvénytulajdonságok | Functions and their properties | soon |
| Geometriai alapismeretek | Geometry basics | soon |
| Háromszögek | Triangles | soon |
| Négyszögek, sokszögek | Quadrilaterals, polygons | soon |
| A kör és részei | The circle and its parts | soon |
| Transzformációk, szerkesztések | Transformations, constructions | soon |
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

Topics live in [src/topics.ts](src/topics.ts). Write a page component, set it
as the topic's `page`, and add its menu label under `topics.*` in both locale
files. The sidebar, placeholder, and hash link update automatically.

### The lesson kit

[SetsPage.tsx](src/components/SetsPage.tsx) is the template for a long lesson.
It stacks one card per section behind a sticky in-page menu, and each section
pairs a manipulable diagram with a checkable exercise. Reusable parts worth
knowing about:

- [VennDiagram.tsx](src/components/VennDiagram.tsx) draws two or three circles
  and shades any set of regions. Shading is one SVG mask per region, so it needs
  no arc geometry, and clicks are resolved by asking which circles contain the
  pointer rather than by hit-testing shapes.
- [Exercise.tsx](src/components/Exercise.tsx) wraps a task with check and reveal
  buttons. The section owns the answer and decides correctness.
- [ChoiceTree.tsx](src/components/ChoiceTree.tsx) draws a multi-step choice as
  one column per step and one row per possibility, with dead branches dashed so
  a pruned search stays visible.
- [GraphDiagram.tsx](src/components/GraphDiagram.tsx) spreads vertices on a
  circle with optional degree badges and click-to-toggle edges.
- [src/lib/](src/lib/) holds the pure logic, all unit tested: `sets.ts` and
  `venn.ts` (set operations and Venn geometry), `logic.ts` (truth tables,
  quantifier and implication checks, the knights-and-knaves solver and the NIM
  strategy) and `combinatorics.ts` (counting, choice trees, the timetable
  constraint solver, graph helpers and the number sieve).

[LogicPage.tsx](src/components/LogicPage.tsx) and
[CombiPage.tsx](src/components/CombiPage.tsx) follow the same shape. The logic
lesson puts the same twelve elements on a `VennDiagram`, so "and" is visibly
the intersection and "if…, then…" visibly a subset.

### Checks that guard a lesson

- Both locale files are compared by
  [src/i18n/locales.test.ts](src/i18n/locales.test.ts): the same keys, no empty
  strings and the same interpolation variables in every language.
- Diagrams carry `role="img"`, which hides their contents from assistive
  technology, so every interactive diagram is paired with a row of ordinary
  buttons that does the same job for keyboard users.

## Deploy

Pushing to `main` lints, tests, builds and publishes the site to GitHub Pages
via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). A failing
check blocks the deploy. The Vite `base` is set to `/mathvis/` to match the
repo name.
