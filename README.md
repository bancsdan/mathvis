# MathVis

Interactive math lessons in the browser, in Hungarian and English. A React
app where each lesson teaches one concept by letting you drag its central idea
around. Free, open source, aimed at Hungarian students.

## Topics

The left-hand menu has two collapsible groups. Each topic is deep-linkable via
its hash, e.g. `#derivative`. Topics without a lesson yet appear in the menu
with a "soon" badge and show a placeholder page.

### High school

Follows the topic overview table of the Hungarian framework curriculum.
**Halmazok** is the first written lesson and is where the site opens. The rest
carry a "soon" badge and show a placeholder.

| Magyar | English |
|---|---|
| Halmazok | Sets |
| Matematikai logika | Mathematical logic |
| Kombinatorika, gráfok | Combinatorics, graphs |
| Számhalmazok, műveletek | Number sets, operations |
| Hatvány, gyök | Powers, roots |
| Betűs kifejezések egyenletmegoldásban, függvényábrázolásban | Algebraic expressions in equations and graphs |
| Arányosság, százalékszámítás | Proportionality, percentages |
| Elsőfokú egyenletek, egyenlőtlenségek, egyenletrendszerek | Linear equations, inequalities, systems |
| Másodfokú egyenletek, egyenlőtlenségek | Quadratic equations, inequalities |
| A függvény fogalma, függvénytulajdonságok | Functions and their properties |
| Geometriai alapismeretek | Geometry basics |
| Háromszögek | Triangles |
| Négyszögek, sokszögek | Quadrilaterals, polygons |
| A kör és részei | The circle and its parts |
| Transzformációk, szerkesztések | Transformations, constructions |
| Leíró statisztika | Descriptive statistics |
| Valószínűség-számítás | Probability |

### University

All three have lessons.

| Magyar | English |
|---|---|
| Derivált | Derivative |
| Integrál | Integral |
| Fourier-transzformáció | Fourier Transform |

## Adding a lesson

Topics live in [src/topics.ts](src/topics.ts). Write a page component, set it
as the topic's `page`, and add its menu label under `topics.*` in both locale
files. The sidebar, placeholder, and hash link update automatically.

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
- [src/lib/sets.ts](src/lib/sets.ts) and [src/lib/venn.ts](src/lib/venn.ts) hold
  the pure logic and geometry, and are covered by unit tests.

Diagrams carry `role="img"`, which hides their contents from assistive
technology, so every interactive diagram is paired with a row of ordinary
buttons that does the same job for keyboard users.

## Languages

The UI ships in Hungarian and English with a HU/EN switcher in the header
(persisted in localStorage, overridable with `?lang=en`). All copy lives in
translation files under [src/i18n/locales/](src/i18n/locales/) — add a new
language by dropping in another JSON file and registering it in
[src/i18n/index.ts](src/i18n/index.ts).

## Run

```sh
npm install
npm run dev      # dev server
npm test         # unit tests for the pure logic
npm run lint     # oxlint
npm run build    # type-check + production build
```

## Deploy

Pushing to `main` lints, tests, builds and publishes the site to GitHub Pages
via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). A failing test
blocks the deploy. The Vite `base`
is set to `/mathvis/` to match the repo name. Live at
<https://bancsdan.github.io/mathvis/>.
