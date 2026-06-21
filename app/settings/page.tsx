'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useCases } from '@/hooks/useCases'
import { exportCasesToCsv } from '@/lib/firestore'
import NavBar from '@/components/NavBar'

function SettingsContent() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [upgrading, setUpgrading] = useState(false)
  const [managing, setManaging] = useState(false)
  const { cases } = useCases(user?.uid ?? null)
  const showSuccess = params.get('upgraded') === '1'

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isPro = profile?.plan === 'pro'

  const callStripeApi = async (endpoint: string, setter: (v: boolean) => void) => {
    setter(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/stripe/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      if (error) alert(error)
    } finally {
      setter(false)
    }
  }

  const handleExport = () => {
    const csv = exportCasesToCsv(cases)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `caseboard_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-slate-800 mb-6">設定</h1>

        {showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            ✓ Proプランへのアップグレードが完了しました！
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          <Section label="アカウント">
            <Row label="表示名" value={user.displayName ?? '—'} />
            <Row label="メールアドレス" value={user.email ?? '—'} />
          </Section>

          <Section label="プラン">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  現在のプラン:{' '}
                  <span className={isPro ? 'text-indigo-600 font-semibold' : 'text-slate-500'}>
                    {isPro ? 'Pro' : '無料'}
                  </span>
                </p>
                {!isPro && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    案件5件まで・ダッシュボード・CSVエクスポートはPro限定
                  </p>
                )}
                {isPro && (
                  <p className="text-xs text-slate-400 mt-0.5">案件無制限・CSVエクスポート</p>
                )}
              </div>
              {!isPro && (
                <button
                  onClick={() => callStripeApi('checkout', setUpgrading)}
                  disabled={upgrading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {upgrading ? '処理中...' : 'Proにアップグレード ¥980/月'}
                </button>
              )}
              {isPro && (
                <button
                  onClick={() => callStripeApi('portal', setManaging)}
                  disabled={managing}
                  className="border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {managing ? '処理中...' : 'プランを管理'}
                </button>
              )}
            </div>
          </Section>

          <Section label="データ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">CSVエクスポート</p>
                <p className="text-xs text-slate-400 mt-0.5">全案件データをCSVでダウンロード</p>
              </div>
              <button
                onClick={handleExport}
                disabled={!isPro}
                className="border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isPro ? 'ダウンロード' : '🔒 Pro限定'}
              </button>
            </div>
          </Section>

          <Section label="">
            <button
              onClick={() => signOut(auth).then(() => router.push('/'))}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              ログアウト
            </button>
          </Section>
        </div>
      </main>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      {label && <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">{label}</h2>}
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
