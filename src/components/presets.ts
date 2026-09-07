import { useMemo } from 'react'
import { compile } from 'mathjs/number'

export const PRESETS: Array<{ name: string; expr: string; labelKey?: string }> = [
  { name: 'sin(x)', expr: 'sin(x)' },
  { name: 'x² / 2', expr: 'x^2 / 2' },
  { name: 'x³ − 2x', expr: 'x^3 - 2*x' },
  { name: 'e^(x/2)', expr: 'exp(x/2)' },
  { name: 'absx', expr: 'abs(x)', labelKey: 'presets.absx' },
]

export function useCompiled(expr: string): { fn: ((x: number) => number) | null; error: string | null } {
  return useMemo(() => {
    try {
      const code = compile(expr)
      const fn = (x: number) => {
        const v: unknown = code.evaluate({ x })
        if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('not finite')
        return v
      }
      fn(0) // probe
      return { fn, error: null }
    } catch (e) {
      return { fn: null, error: e instanceof Error ? e.message : String(e) }
    }
  }, [expr])
}
