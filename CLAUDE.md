# The project

This is an OSS educational site hosted on github pages for now, to provide a free alternative to paid sites in hungarian for learning math. The main audience is the hungarian youth. The thing that I would like to set this project apart is interactive visualizations on the UI next to the explanations of topics.

# Scope

The site covers two levels, shown as two collapsible groups in the left-hand menu. Every topic below must have a menu entry; topics without a lesson yet show a "coming soon" placeholder.

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
| `src/topics.ts` | The only registry of sections and topics, plus `DEFAULT_TOPIC_ID`. |
| `src/App.tsx` | Shell. **Picks the topic from the URL hash**, falling back to the default. |
| `src/components/Sidebar.tsx` | Left menu. `ComingSoonPage.tsx` is the placeholder for topics with no `page`. |
| `src/components/<Name>Page.tsx` | One per lesson. `SetsPage.tsx` is the worked example of a long one; `LogicPage.tsx` is the second lesson and reuses the sets kit (same 12-element universe, `VennDiagram` with `elements`); `CombiPage.tsx` is the third and adds `ChoiceTree`/`GraphDiagram`; `NumPage.tsx` is the fourth and adds `NumberLine`. |
| `src/lib/` | Pure logic, no React, unit tested. `sets.ts` and `venn.ts` are the pattern; `logic.ts` builds on `sets.ts` (`Predicate`, `UNIVERSE`); `combinatorics.ts` holds the counting, choice trees, timetable constraints, graphs and the number sieve; `numbers.ts` holds set membership, long division, decimal ↔ fraction, nested intervals, interval notation, estimation and string-based rounding. |
| `src/i18n/locales/{hu,en}.json` | All copy. Namespaces are flat and exactly two levels: `ns.key`. |
| `src/index.css` | One global stylesheet, no modules. Append new rules at the bottom. |

Shared helpers: `Tex.tsx` (`<Tex tex="A \cup B" block />`), `useWidth.ts` (ResizeObserver, returns `[ref, width]`), `LineChart.tsx` (function plotting only). Lesson kit, reuse rather than rebuild: `VennDiagram.tsx`, `Exercise.tsx`, `SetsElementGrid.tsx`, `ChoiceTree.tsx`, `GraphDiagram.tsx`, `NumberLine.tsx`, `useActiveSection.ts`.

Adding a lesson is: write the page component, set it as `page` on the topic in `src/topics.ts`, add its copy to both locale files. Menu entry, placeholder removal and the `#topic-id` link all follow.

# Conventions

- One exported component per file, named export. Helpers stay unexported.
- Responsive SVG is always `const [ref, width] = useWidth()`, then `<div className="chart-box">{width > 0 && <svg …>}`. `.chart-box` is the tooltip anchor.
- Plain strings use `t('ns.key')`. Strings containing `<b>`/`<i>` use `<Trans i18nKey components={{ b: <strong />, i: <em /> }} />`.
- Math symbols in prose are literal Unicode (∈ ⊆ ∪ ∩ ∅ −). Anything needing real typesetting goes through KaTeX, with translated words injected as `\text{${t('…')}}` — never hardcode Hungarian inside a tex string.
- Colors only ever come from CSS variables. There are exactly three series colors (`--series-1/2/3`) plus `--accent-select` for a highlighted result.
- Decimals: never write a comma into a source file. The separator is the `num.decimalSep` key; `formatDecimal(str, sep, tex)` and `texSeparator(tex, sep)` in `numbers.ts` apply it (Tex needs `3{,}14`, prose gets `3,14`).

# Gotchas

These each cost real time to discover.

- **Never use `href="#…"` for in-page navigation.** `App.tsx` reads the hash to choose the topic, so an anchor navigates the reader off the lesson. Use a button and `scrollIntoView`.
- A new CSS variable must be added to **both** `:root` and the `@media (prefers-color-scheme: dark)` block.
- `tsconfig.app.json` sets `erasableSyntaxOnly` (no enums, use union types), `verbatimModuleSyntax` (type-only imports need `import type`) and `noUnusedLocals`.
- In i18next, `count` is the pluralization trigger. Passing it means you must supply `_one` and `_other`; name the variable something else if you do not want plurals.
- Inside an SVG `<mask>`, `#fff` and `#000` are luminance channels, not theme colors. They stay literal in both schemes.
- Several diagrams on one page need unique mask and clip-path ids: use `useId()` and strip non-identifier characters from it.
- Section ids of a lesson share a prefix (`sets-`, `logic-`, `combi-`, `num-`) and that prefix must be added to the `.card[id^='…']` scroll-margin rule in `index.css`, or the sticky section nav covers the heading you jump to.
- KaTeX cannot go inside an SVG. A diagram label is plain Unicode (`√2`, `1/3`), so `numbers.ts` carries a `plain` form next to every `tex` one. Where the math must be typeset *and* clickable, build the figure from elements rather than an SVG — see the nested boxes of `NumTowerCard.tsx`.

# Workflow
- When adding text, make sure you add relevant translations in the `src/i18n/locales` folder, and only use keys for text on the UI. Both locale files must carry exactly the same keys — `src/i18n/locales.test.ts` enforces that, plus no empty strings and matching interpolation variables.
- Run `npm test`, `npm run lint` and `npm run build` before finishing. CI runs all three and a failure blocks the deploy.
- Give every diagram a `role="img"` and a translated aria-label. That hides its contents from assistive technology, so pair any click-driven diagram with ordinary buttons to keep it keyboard-operable.
- Use conventional commits when writing commits.
- If relevant changes happen for `README.md`, update it.
- Update `CLAUDE.md` after each task if any important changes happened that other sessions should know about. Be mindful about what you put there, don't litter/grow the context with unnecessary things, only put things in there that most sessions will need on startup.
