'use client'
import Link from 'next/link'

interface Props {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm text-center p-8">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">
          🚀
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">無料プランの上限です</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Proプラン（月980円）にアップグレードすると<br />
          無制限に案件を管理できます。
        </p>
        <div className="space-y-2 text-sm text-slate-500 text-left bg-slate-50 rounded-xl p-4 mb-6">
          <p>✓ 案件数 <strong>無制限</strong></p>
          <p>✓ ダッシュボード・グラフ機能</p>
          <p>✓ CSVエクスポート</p>
        </div>
        <Link
          href="/settings"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          onClick={onClose}
        >
          Proにアップグレード — ¥980/月
        </Link>
        <button
          onClick={onClose}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          あとで
        </button>
      </div>
    </div>
  )
}
