import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

export const metadata: Metadata = {
  metadataBase: new URL('https://caseboard-liard.vercel.app'),
  title: 'CaseBoard — フリーランス案件管理SaaS',
  description: 'フリーランスの案件を提案から入金まで1画面で管理。ココナラ・ランサーズ対応。無料で5件まで。',
  openGraph: {
    title: 'CaseBoard — フリーランス案件管理SaaS',
    description: 'フリーランスの案件を提案から入金まで1画面で管理。ランサーズ・ココナラ対応。無料で5件まで。',
    url: 'https://caseboard-liard.vercel.app',
    siteName: 'CaseBoard',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'CaseBoard' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CaseBoard — フリーランス案件管理SaaS',
    description: 'フリーランスの案件を提案から入金まで1画面で管理。ランサーズ・ココナラ対応。無料で5件まで。',
    images: ['/api/og'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
