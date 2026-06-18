'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCases } from '@/hooks/useCases'
import NavBar from '@/components/NavBar'
import Dashboard from '@/components/Dashboard'
import PlanGate from '@/components/PlanGate'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { cases } = useCases(user?.uid ?? null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isPro = profile?.plan === 'pro'

  return (
    <>
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-0.5">売上・案件の統計</p>
        </div>

        <PlanGate isPro={isPro}>
          <Dashboard cases={cases} />
        </PlanGate>
      </main>
    </>
  )
}
