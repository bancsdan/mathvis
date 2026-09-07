# MathVis

Interactive math lessons in the browser, in Hungarian and English. A React
app where each lesson teaches one concept by letting you drag its central idea
around. Free, open source, aimed at Hungarian students.

## Topics

The left-hand menu has two collapsible groups. Each topic is deep-linkable via
its hash, e.g. `#derivative`. Topics without a lesson yet appear in the menu
with a "soon" badge and show a placeholder page.

### High school

Follows the topic overview table of the Hungarian framework curriculum. No
lessons written yet.

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

All three have lessons today.

| Magyar | English |
|---|---|
| Derivált | Derivative |
| Integrál | Integral |
| Fourier-transzformáció | Fourier Transform |

## Adding a lesson

Topics live in [src/topics.ts](src/topics.ts). Write a page component, set it
as the topic's `page`, and add its menu label under `topics.*` in both locale
files. The sidebar, placeholder, and hash link update automatically.

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
npm run build    # type-check + production build
```

## Deploy

Pushing to `main` builds and publishes the site to GitHub Pages via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). The Vite `base`
is set to `/mathvis/` to match the repo name. Live at
<https://bancsdan.github.io/mathvis/>.
