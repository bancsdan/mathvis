# MathVis

Interactive math lessons in the browser. A small React app with three topic
tabs, each teaching one concept by letting you drag its central idea around.

## Topics

### Derivative

The derivative as a limit. Pick a function, a point x₀, and drag h toward 0 to
watch the secant through x₀ and x₀+h rotate onto the tangent, with the
difference quotient computed live and a halving-h table showing the limit
settle. The |x| preset demonstrates a corner where the left and right limits
disagree and no derivative exists.

### Integral

The integral as a limit of Riemann sums. Pick a function and an interval,
choose left/midpoint/right sampling, and drag the rectangle count up to watch
the sum melt into the shaded true area, with a doubling-n table showing the
convergence and why midpoint sampling converges faster.

### FFT

Sample a function f(x), take its discrete Fourier transform, and rebuild it
with an inverse FFT from only the strongest frequency components.

- **Time domain** — the sampled function (blue) with the inverse-FFT
  reconstruction (dashed orange) overlaid.
- **Wave components** — each kept component drawn as its own labeled wave
  (aqua) on a shared y-scale, strongest first. Summing them gives the
  reconstruction.
- **Frequency domain** — the one-sided amplitude spectrum (bins k = 0…N/2).
  Kept bars are blue, discarded muted. Hover for frequency, amplitude, phase;
  click a bar to inspect it below.
- **How bin k is computed** — the clicked bin worked out on paper: the DFT
  formula with numbers substituted, a term-by-term table, the column sums,
  and the amplitude/phase assembly, plus a collapsible graphical view of why
  the sums single out that frequency.
- **Result** — the reconstruction as a sum of cosine terms, RMS error, and a
  table of kept components.
- **Aliasing demo** — a sine with adjustable true frequency sampled at N = 64
  fixed points: the alias wave the samples actually describe, a zoomed view,
  and a folding map of where every frequency lands. Explains the Nyquist
  limit hands-on.

FFT controls: any mathjs expression in `x` (presets included), FFT size N
(64–1024), window length in periods, and how many of the strongest components
survive the inverse transform.

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # type-check + production build
```

## Implementation notes

- Dependency-free iterative radix-2 Cooley–Tukey FFT in
  [src/lib/fft.ts](src/lib/fft.ts); forward and inverse share one routine.
- Expression parsing via the number-only mathjs entry point; formulas are
  typeset with KaTeX.
- Charts are hand-rolled SVG with hover tooltips; light and dark themes
  follow the OS setting.
