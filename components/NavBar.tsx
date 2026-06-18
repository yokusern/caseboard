'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'

export default function NavBar() {
  const { user, profile } = useAuth()
  const pathname = usePathname()

  const nav = [
    { href: '/board', label: 'ボード' },
    { href: '/dashboard', label: 'ダッシュボード' },
    { href: '/settings', label: '設定' },
  ]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-indigo-600 font-bold text-lg tracking-tight">CaseBoard</span>
          <nav className="flex gap-1">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {profile?.plan === 'pro' && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Pro
            </span>
          )}
          <span className="text-sm text-slate-500">{user?.displayName}</span>
          <button
            onClick={() => signOut(auth)}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}
