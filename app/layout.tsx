import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import '../styles/mba.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400','500','600','700','800','900'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400','600','800'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MBA — Malmö Basket',
  description: 'Malmös internationella basketfamilj. 8 nationer. 1 tröja. Div 3 Skåne.',
  themeColor: '#FFFFFF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
