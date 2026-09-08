import { useEffect, useState } from 'react'

/**
 * Id of the section currently being read, for highlighting an in-page nav.
 *
 * `ids` must be a stable array (declare it at module level), because it is the
 * effect's only dependency.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        setActive(visible[0].target.id)
      },
      // Watch only the band just below the sticky bar, so "active" tracks where
      // the reader is rather than firing for every partly visible card.
      { rootMargin: '-72px 0px -55% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])

  return active
}
