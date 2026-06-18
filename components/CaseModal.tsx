'use client'
import { FormEvent, useState } from 'react'
import { Case, CaseInput, Platform } from '@/types'
import { addCase, updateCase, deleteCase } from '@/lib/firestore'

interface Props {
  uid: string
  existing?: Case
  totalCases: number
  onClose: () => void
}

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'lancers', label: 'ランサーズ' },
  { value: 'coconala', label: 'ココナラ' },
  { value: 'direct', label: '直接' },
  { value: 'other', label: 'その他' },
]

export default function CaseModal({ uid, existing, totalCases, onClose }: Props) {
  const [form, setForm] = useState<CaseInput & { deadline: string }>({
    clientName: existing?.clientName ?? '',
    title: existing?.title ?? '',
    amount: existing?.amount ?? 0,
    platform: existing?.platform ?? 'lancers',
    deadline: existing?.deadline ? existing.deadline.slice(0, 10) : '',
    memo: existing?.memo ?? '',
    caseUrl: existing?.caseUrl ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const set = (key: keyof typeof form, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data: CaseInput = {
        ...form,
        amount: Number(form.amount),
        deadline: form.deadline || null,
      }
      if (existing) {
        await updateCase(uid, existing.id, data)
      } else {
        await addCase(uid, data, totalCases)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!existing) return
    if (!confirm('この案件を削除しますか？')) return
    setDeleting(true)
    try {
      await deleteCase(uid, existing.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {existing ? '案件を編集' : '新規案件を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              クライアント名 <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.clientName}
              onChange={e => set('clientName', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="株式会社〇〇"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              案件名 <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="LP制作・GASアプリ開発など"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                金額（円） <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="50000"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">プラットフォーム</label>
              <select
                value={form.platform}
                onChange={e => set('platform', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">納期</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">案件URL</label>
            <input
              type="url"
              value={form.caseUrl}
              onChange={e => set('caseUrl', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.lancers.jp/work/..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">メモ</label>
            <textarea
              rows={3}
              value={form.memo}
              onChange={e => set('memo', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="要件・連絡事項など"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {existing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
              >
                {deleting ? '削除中...' : '削除'}
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? '保存中...' : existing ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
