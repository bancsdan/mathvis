import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useMemo } from 'react'

/** Renders a LaTeX string with KaTeX. Block mode centers it on its own line. */
export function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: block, throwOnError: false }),
    [tex, block]
  )
  return block ? (
    <div className="tex-block" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className="tex-inline" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
