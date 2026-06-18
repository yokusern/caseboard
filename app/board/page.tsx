'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCases } from '@/hooks/useCases'
import NavBar from '@/components/NavBar'
import KanbanBoard from '@/components/KanbanBoard'

export default function BoardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const { cases, loading: casesLoading } = useCases(user?.uid ?? null)

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

  return (
    <>
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">案件ボード</h1>
          <p className="text-sm text-slate-500 mt-0.5">ドラッグ&ドロップでステータスを変更できます</p>
        </div>

        {casesLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <KanbanBoard
            cases={cases}
            uid={user.uid}
            isPro={profile?.plan === 'pro'}
          />
        )}
      </main>
    </>
  )
}
