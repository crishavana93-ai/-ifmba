'use client'
/**
 * Showroom3DLazy — Client Component wrapper around the dynamic import
 * of <Showroom3D>.
 *
 * Why this exists: Next.js 16 forbids `dynamic({ ssr: false })` inside
 * Server Components. The /butik page is a Server Component (it fetches
 * data from Sanity at request time), so we move the SSR-disabled dynamic
 * import here, into a Client Component, and import THIS file from the
 * server page instead.
 *
 * The 3D bundle (~900KB gzipped — three.js + react-three-fiber + drei)
 * still only loads when this component mounts, not at page-request time.
 */

import dynamic from 'next/dynamic'

const Showroom3D = dynamic(() => import('./Showroom3D'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 420,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        opacity: 0.5,
      }}
    >
      Laddar 3D-showroom…
    </div>
  ),
})

export default function Showroom3DLazy(
  props: React.ComponentProps<typeof Showroom3D>,
) {
  return <Showroom3D {...props} />
}
