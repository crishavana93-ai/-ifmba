/**
 * Studio layout — strips the site's header/footer/global styles so the
 * Sanity Studio UI gets a full-viewport canvas without MBA nav chrome.
 *
 * Metadata sets a robots noindex so Google never indexes the editor.
 */
import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'MBA Studio',
  robots: {index: false, follow: false},
}

export default function StudioLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>
}
