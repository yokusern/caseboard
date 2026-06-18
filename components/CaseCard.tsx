'use client'
import { Case, PLATFORM_LABELS } from '@/types'
import { deleteCase } from '@/lib/firestore'

interface Props {
  item: Case
  uid: string
  onClick: () => void
}

function deadlineLabel(deadline: string | null) {
  if (!deadline) return null
  const days = Math.round((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0) return { text: `${Math.abs(days)}日超過`, color: 'text-red-500' }
  if (days === 0) return { text: '今日締切', color: 'text-orange-500' }
  return { text: `${days}日後`, color: 'text-slate-500' }
}

export default function CaseCard({ item, uid, onClick }: Props) {
  const platform = PLATFORM_LABELS[item.platform]
  const dl = deadlineLabel(item.deadline)

  const handleSampleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteCase(uid, item.id)
  }

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all relative"
      onClick={onClick}
    >
      {/* Sample badge + quick delete */}
      {item.isSample && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">
            サンプル
          </span>
          <button
            onClick={handleSampleDelete}
            className="text-slate-300 hover:text-red-400 transition-colors leading-none text-sm font-bold"
            title="サンプルを削除"
          >
            ×
          </button>
        </div>
      )}

      <div className={`flex items-start gap-2 mb-1 ${item.isSample ? 'pr-14' : 'pr-6'}`}>
        <p className="font-semibold text-slate-800 text-sm leading-tight flex-1">{item.clientName}</p>
        {!item.isSample && (
          <span className="text-base shrink-0" title={platform.label}>{platform.emoji}</span>
        )}
      </div>
      {item.isSample && (
        <span className="text-base" title={platform.label}>{platform.emoji}</span>
      )}
      <p className="text-xs text-slate-500 line-clamp-2">{item.title}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold text-slate-700">
          ¥{item.amount.toLocaleString()}
        </span>
        {dl && (
          <span className={`text-xs font-medium ${dl.color}`}>{dl.text}</span>
        )}
      </div>
    </div>
  )
}
