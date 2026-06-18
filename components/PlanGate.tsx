'use client'
import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  isPro: boolean
  children: ReactNode
}

export default function PlanGate({ isPro, children }: Props) {
  if (isPro) return <>{children}</>

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-8 text-center max-w-sm">
          <div className="text-3xl mb-3">🔒</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Proプランで解放されます</h2>
          <p className="text-sm text-slate-500 mb-5">
            ダッシュボードと月次グラフはProプラン限定機能です。
          </p>
          <Link
            href="/settings"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Proにアップグレード →
          </Link>
        </div>
      </div>
    </div>
  )
}
