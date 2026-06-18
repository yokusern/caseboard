'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Case, CaseStatus, COLUMNS } from '@/types'

interface Props {
  cases: Case[]
}

const STATUS_COLORS: Record<CaseStatus, string> = {
  proposal: '#94a3b8',
  accepted: '#60a5fa',
  working: '#f59e0b',
  review: '#a78bfa',
  paid: '#34d399',
}

export default function Dashboard({ cases }: Props) {
  const now = new Date()

  const thisMonthPaid = cases.filter(c => {
    if (c.status !== 'paid' || !c.updatedAt) return false
    const d = new Date(c.updatedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthPaid.reduce((s, c) => s + c.amount, 0)
  const thisMonthCount = thisMonthPaid.length

  const lastMonth = new Date(now)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const lastMonthTotal = cases.filter(c => {
    if (c.status !== 'paid' || !c.updatedAt) return false
    const d = new Date(c.updatedAt)
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear()
  }).reduce((s, c) => s + c.amount, 0)

  const growthPct = lastMonthTotal === 0
    ? null
    : Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)

  const avgAmount = thisMonthCount > 0 ? Math.round(thisMonthTotal / thisMonthCount) : 0

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - (5 - i))
    const monthLabel = `${d.getMonth() + 1}月`
    const revenue = cases.filter(c => {
      if (c.status !== 'paid' || !c.updatedAt) return false
      const cd = new Date(c.updatedAt)
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()
    }).reduce((s, c) => s + c.amount, 0)
    return { month: monthLabel, revenue }
  })

  const pieData = COLUMNS.map(col => ({
    name: col.label,
    value: cases.filter(c => c.status === col.id).length,
    color: STATUS_COLORS[col.id],
  })).filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="今月の売上" value={`¥${thisMonthTotal.toLocaleString()}`} />
        <Stat
          label="先月比"
          value={growthPct === null ? '—' : `${growthPct > 0 ? '+' : ''}${growthPct}%`}
          accent={growthPct !== null && growthPct > 0}
        />
        <Stat label="今月の受注件数" value={`${thisMonthCount}件`} />
        <Stat label="平均単価" value={`¥${avgAmount.toLocaleString()}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">月次売上推移（過去6ヶ月）</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `¥${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`¥${v.toLocaleString()}`, '売上']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">案件ステータス分布</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              案件がありません
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-green-600' : 'text-slate-800'}`}>{value}</p>
    </div>
  )
}
