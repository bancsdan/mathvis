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

# Structure

- `src/topics.ts` is the single registry of sections and topics. Adding a lesson = writing a page component and setting it as `page` on the topic there; the menu, placeholder, and `#topic-id` deep link follow automatically.
- `src/components/Sidebar.tsx` renders the menu; `src/components/ComingSoonPage.tsx` is the placeholder.
- `src/components/SetsPage.tsx` is the worked example of a full lesson: one card per section behind a sticky in-page menu, each pairing a diagram with a checkable exercise. Reuse `VennDiagram.tsx`, `Exercise.tsx` and `SetsElementGrid.tsx` rather than rebuilding them.
- Pure logic belongs in `src/lib/` with unit tests next to it. `src/lib/sets.ts` and `src/lib/venn.ts` are the pattern.

# Workflow
- When adding text, make sure you add relevant translations in the `src/i18n/locales` folder, and only use keys for text on the UI. Both locale files must carry exactly the same keys.
- Run `npm test`, `npm run lint` and `npm run build` before finishing. CI runs all three and a failure blocks the deploy.
- Give every diagram a `role="img"` and a translated aria-label, and pair any click-driven diagram with ordinary buttons so it works from a keyboard.
- Use conventional commits when writing commits.
- For math formulas use KaTeX.
- If relevant changes happen for `README.md`, update it.
