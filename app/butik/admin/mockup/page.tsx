/**
 * /butik/admin/mockup — Mockup Studio admin page.
 *
 * Lets Cris generate Printful-style on-model mockups in-house, for free,
 * unlimited. Workflow:
 *   1. Upload a design PNG (transparent BG preferred — Photoroom can strip
 *      backgrounds for free if you grabbed the design from AliExpress)
 *   2. Drag-position on the model template, adjust size + displacement
 *   3. Click "Generate" → PNG output download
 *   4. Upload PNG to Sanity Studio as the product's image field
 *
 * Auth: simple env-var gate. Set MOCKUP_ADMIN_PASS in Vercel env, then visit
 * /butik/admin/mockup?key=<pass>. No password = redirect to /butik. Keeps
 * the tool private without needing real auth infrastructure.
 *
 * To add more model templates: drop the model photo + its displacement
 * map into /public/mockup-templates/, then add an entry to the TEMPLATES
 * array in MockupGenerator.tsx.
 */
import { redirect } from 'next/navigation'
import MockupGenerator from '@/components/MockupGenerator'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Mockup Studio · MBA Admin',
  robots: { index: false, follow: false },
}

export default async function MockupAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const params = await searchParams
  const required = process.env.MOCKUP_ADMIN_PASS
  // If admin pass IS set, require it. If not set, allow access (dev mode).
  if (required && params.key !== required) {
    redirect('/butik')
  }

  return (
    <>
      <Navbar />
      <main id="main" style={{ paddingTop: 'clamp(48px, 8vw, 96px)', minHeight: '100vh', background: '#f7f6f1' }}>
        <MockupGenerator />
      </main>
    </>
  )
}
