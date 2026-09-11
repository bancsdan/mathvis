# The project

This is an OSS educational site hosted on github pages for now, to provide a free alternative to paid sites in hungarian for learning math. The main audience is the hungarian youth. The thing that I would like to set this project apart is interactive visualizations on the UI next to the explanations of topics.

# Scope

The site covers two levels, shown as two collapsible groups in the left-hand menu, under a `Kezdőlap` entry. Every topic below must have a menu entry; topics without a lesson yet show a "coming soon" placeholder.

A lesson is not a chapter but a short list of **explorers**: one interactive each, titled with the question it answers, reachable at `#<topic>/<slug>` and listed on the home page. The curriculum below is the map, not the content.

## High school (Középiskola)

Follows the topic overview table of the Hungarian framework curriculum.

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

## University (Egyetem)

| Magyar | English |
|---|---|
| Derivált | Derivative |
| Integrál | Integral |
| Fourier-transzformáció | Fourier Transform |

# Architecture

React 19 + TypeScript + Vite. KaTeX for math, react-i18next for all copy, mathjs for user-entered expressions, oxlint, vitest. No router, no CSS framework, no component library, no test-DOM library — do not add one without asking.

| Path | What it is |
|---|---|
| `src/topics.ts` | The only registry of sections, topics and the `Explorer` type. `parseHash` resolves a hash to `{ section, topic, explorer }`; `findTopic`, `findExplorer` and `hasLesson` go with it. A topic being written carries its prefix and an empty `explorers` list: `hasLesson` is false until the first card lands, so the placeholder stays. |
| `src/App.tsx` | Shell and routing. The hash is `#` (home), `#<topic>` or `#<topic>/<slug>`; anything unknown is home. After a lesson mounts it scrolls to `${prefix}-${slug}`. |
| `src/lessons/<prefix>.ts` | One per lesson: the ordered `Explorer[]` (`FN_EXPLORERS`), each entry naming a card, its `navKey` (short nav label) and its `questionKey` (the `h2` and the home card). |
| `src/components/LessonPage.tsx` | The one generic lesson page: sticky `section-nav` plus one card per explorer, whose DOM id is `<prefix>-<slug>`. |
| `src/components/HomePage.tsx` | The question grid: every explorer as a real `#<topic>/<slug>` anchor, grouped by topic. |
| `src/components/Sidebar.tsx` | Left menu, `nav.home` first. `ComingSoonPage.tsx` is the placeholder for topics with no lesson. |
| `src/components/<Name>Card.tsx` | One per explorer, props `{ id }`. The lesson kit grew with the lessons: sets added `VennDiagram` and `SetsElementGrid` (the logic lesson is now the only user of the grid; both draw the same 12-element universe), combi added `ChoiceTree`/`GraphDiagram`, num added `NumberLine`, fn added `ArrowDiagram`. pow, alg, prop, lin and quad needed no new diagram component — chips, small per-card SVGs and `LineChart` cover them. |
| `src/lib/` | Pure logic, no React, unit tested. `sets.ts` and `venn.ts` are the pattern; `logic.ts` builds on `sets.ts` (`Predicate`, `UNIVERSE`); `combinatorics.ts` holds the counting, choice trees and graph helpers; `numbers.ts` holds decimal ↔ fraction, nested intervals and the shared decimal helpers; `powers.ts` holds integer, zero and negative exponents, the laws of powers as factor groups, string-based normal form, square roots and n-th roots; `algebra.ts` holds terms and polynomials with one tex writer, the linear tracker of the number tricks, the named identities and completing the square; `proportion.ts` holds inverse proportion, the graph shapes, percent, chained percentage changes and compound interest; `linear.ts` holds sides and fractions, the balance moves, the inequality solver with its sign flip, both elimination methods for a two-by-two system and the word-problem models; `quadratic.ts` holds the lost-root demo, factoring, the formula with its parallel derivation, the inequality solver, the substitutions and the word-problem models; `functions.ts` holds the assignment kinds with the node that spoils them, the zeros, extremes and monotone runs of a polyline, the three elementary graphs with the solution counts of f(x) = c, the transformation steps, the linear inverse and the two practical models; `geometry.ts` holds the plane geometry the five geometry lessons share — vectors, angles in degrees, the four transformations, the notable points of a triangle, areas and convexity, the circle's arc, sector and tangents, plus `fmt` and `snapAngle` — all in math coordinates with **y up**. |
| `src/i18n/locales/{hu,en}.json` | All copy. Namespaces are flat and exactly two levels: `ns.key`. |
| `src/index.css` | One global stylesheet, no modules. Append new rules at the bottom. |

Shared helpers: `Tex.tsx` (`<Tex tex="A \cup B" block />`), `useWidth.ts` (ResizeObserver, returns `[ref, width]`), `LineChart.tsx` (function plotting only; pass `format` when the y values are money, or the axis reads `1.0e+5`, and `xStep` when x counts whole things, or years get half-year ticks; a non-finite value leaves a gap, so a series can be drawn only where a condition holds). Lesson kit, reuse rather than rebuild: `VennDiagram.tsx`, `Exercise.tsx`, `Definition.tsx`, `SetsElementGrid.tsx`, `ChoiceTree.tsx`, `GraphDiagram.tsx`, `NumberLine.tsx`, `ArrowDiagram.tsx`, `GeoFigure.tsx` (every geometry figure: a world box in math units, a `Draw` kit of `segment`/`line`/`ray`/`polygon`/`circle`/`arc`/`angle`/`label`/`length`/`vector`, and points draggable by pointer and by arrow key through `onDrag` and `clamp`), `useActiveSection.ts`.

Adding a lesson is: write one card component per explorer, list them in `src/lessons/<prefix>.ts`, set `prefix` and `explorers` on the topic in `src/topics.ts`, add the copy to both locale files. Menu entry, home cards, placeholder removal and the `#<topic>/<slug>` links all follow. The three university topics still use a whole-page `page` component.

# Conventions

- An explorer is one interactive with just enough words around it, in this order and nothing else: the `<h2>` question, one framing paragraph (2–4 sentences, ≤ ~80 words), a `<Definition>` only if the widget needs the term, the interactive, its one `.lin-result` line, at most one bold-led note for a trap the widget demonstrates, one `<Exercise>` that checks what the widget shows. No numbered prefixes in titles — the nav numbers them.
- `.lin-result` is the site-wide result line: exactly one per explorer, the sentence saying what working the control was supposed to show.
- One exported component per file, named export. Helpers stay unexported.
- Responsive SVG is always `const [ref, width] = useWidth()`, then `<div className="chart-box">{width > 0 && <svg …>}`. `.chart-box` is the tooltip anchor.
- Plain strings use `t('ns.key')`. Strings containing `<b>`/`<i>` use `<Trans i18nKey components={{ b: <strong />, i: <em /> }} />`.
- Math symbols in prose are literal Unicode (∈ ⊆ ∪ ∩ ∅ −). Anything needing real typesetting goes through KaTeX, with translated words injected as `\text{${t('…')}}` — never hardcode Hungarian inside a tex string.
- Colors only ever come from CSS variables. There are exactly three series colors (`--series-1/2/3`) plus `--accent-select` for a highlighted result.
- Definitions: a term gets a `<Definition i18nKey="ns.xDef" />` block only if the reader must know it to follow the widget — at most one box per explorer, at most two terms, one sentence each. A definition that only restates the textbook is dropped. It sits right after the framing paragraph. It is the one tinted box on the page (`--define-*` colors, label from `app.definition`), so a reader can skim for it. Keys are `<section>Def`, or `<section>Def1…n` for several terms passed as an array, one paragraph each, each opening with the term in `<b>`. Rules and theorems (szorzási elv, De Morgan, the rounding rule) are not definitions; they stay bold-led notes. The intro must not repeat the definition word for word.
- Decimals: never write a comma into a source file. The separator is the `num.decimalSep` key; `formatDecimal(str, sep, tex)` and `texSeparator(tex, sep)` in `numbers.ts` apply it (Tex needs `3{,}14`, prose gets `3,14`).

# Gotchas

These each cost real time to discover.

- **Never use `href="#…"` for in-page navigation.** `App.tsx` reads the hash to choose the topic, so an anchor navigates the reader off the lesson. Use a button and `scrollIntoView`. The one exception is the home grid's cards, which really do mean to leave.
- A new CSS variable must be added to **both** `:root` and the `@media (prefers-color-scheme: dark)` block.
- `tsconfig.app.json` sets `erasableSyntaxOnly` (no enums, use union types), `verbatimModuleSyntax` (type-only imports need `import type`), `noUnusedLocals` and `noUnusedParameters`.
- In i18next, `count` is the pluralization trigger. Passing it means you must supply `_one` and `_other`; name the variable something else if you do not want plurals.
- Inside an SVG `<mask>`, `#fff` and `#000` are luminance channels, not theme colors. They stay literal in both schemes.
- Several diagrams on one page need unique mask and clip-path ids: use `useId()` and strip non-identifier characters from it.
- Section ids of a lesson share a prefix (`sets-`, `logic-`, `combi-`, `num-`, `pow-`, `alg-`, `prop-`, `lin-`, `quad-`, `fn-`) and that prefix must be added to the `.card[id^='…']` scroll-margin rule in `index.css`, or the sticky section nav covers the heading you jump to.
- KaTeX cannot go inside an SVG. A diagram label is plain Unicode (`√2`, `1/3`), so `numbers.ts` carries a `plain` form next to every `tex` one. Where the math must be typeset *and* clickable, build the figure from elements rather than an SVG.

# Workflow
- When adding text, make sure you add relevant translations in the `src/i18n/locales` folder, and only use keys for text on the UI. Both locale files must carry exactly the same keys — `src/i18n/locales.test.ts` enforces that, plus no empty strings and matching interpolation variables. `src/topics.test.ts` checks the registry: every explorer's `navKey` and `questionKey` exist in both bundles, slugs are unique, hashes resolve.
- Run `npm test`, `npm run lint` and `npm run build` before finishing. CI runs all three and a failure blocks the deploy.
- Give every diagram a `role="img"` and a translated aria-label. That hides its contents from assistive technology, so pair any click-driven diagram with ordinary buttons to keep it keyboard-operable.
- Use conventional commits when writing commits.
- If relevant changes happen for `README.md`, update it.
- Update `CLAUDE.md` after each task if any important changes happened that other sessions should know about. Be mindful about what you put there, don't litter/grow the context with unnecessary things, only put things in there that most sessions will need on startup.
