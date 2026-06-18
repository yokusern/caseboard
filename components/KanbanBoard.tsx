'use client'
import { useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Case, CaseStatus, COLUMNS, FREE_CASE_LIMIT } from '@/types'
import KanbanColumn from './KanbanColumn'
import CaseModal from './CaseModal'
import UpgradeModal from './UpgradeModal'

interface Props {
  cases: Case[]
  uid: string
  isPro: boolean
}

export default function KanbanBoard({ cases, uid, isPro }: Props) {
  const [modal, setModal] = useState<{ open: boolean; existing?: Case }>({ open: false })
  const [showUpgrade, setShowUpgrade] = useState(false)

  const casesByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = cases.filter(c => c.status === col.id).sort((a, b) => a.order - b.order)
      return acc
    },
    {} as Record<CaseStatus, Case[]>
  )

  const thisMonthPaid = cases
    .filter(c => {
      if (c.status !== 'paid' || !c.updatedAt) return false
      const d = new Date(c.updatedAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, c) => sum + c.amount, 0)

  const canAdd = isPro || cases.length < FREE_CASE_LIMIT
  const isEmpty = cases.length === 0

  const handleAddClick = () => {
    if (canAdd) {
      setModal({ open: true })
    } else {
      setShowUpgrade(true)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const srcStatus = source.droppableId as CaseStatus
    const dstStatus = destination.droppableId as CaseStatus

    const srcItems = [...casesByStatus[srcStatus]]
    const dstItems = srcStatus === dstStatus ? srcItems : [...casesByStatus[dstStatus]]

    const [moved] = srcItems.splice(source.index, 1)

    if (srcStatus === dstStatus) {
      srcItems.splice(destination.index, 0, moved)
      const batch = writeBatch(db)
      srcItems.forEach((c, i) => {
        batch.update(doc(db, 'users', uid, 'cases', c.id), { order: i })
      })
      await batch.commit()
    } else {
      dstItems.splice(destination.index, 0, moved)
      const batch = writeBatch(db)
      srcItems.forEach((c, i) => {
        batch.update(doc(db, 'users', uid, 'cases', c.id), { order: i })
      })
      dstItems.forEach((c, i) => {
        batch.update(doc(db, 'users', uid, 'cases', c.id), { order: i, status: dstStatus })
      })
      await batch.commit()
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3">
          <span className="text-sm text-indigo-600 font-medium">今月の売上（入金済み）</span>
          <span className="ml-3 text-2xl font-bold text-indigo-700">
            ¥{thisMonthPaid.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleAddClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ＋ 新規案件
          </button>
          {isEmpty && (
            <p className="text-xs text-slate-400">
              ココナラやランサーズの案件を追加して、ステータスを管理しましょう
            </p>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              columnId={col.id}
              label={col.label}
              cases={casesByStatus[col.id]}
              uid={uid}
              onEdit={c => setModal({ open: true, existing: c })}
            />
          ))}
        </div>
      </DragDropContext>

      {modal.open && (
        <CaseModal
          uid={uid}
          existing={modal.existing}
          totalCases={cases.length}
          onClose={() => setModal({ open: false })}
        />
      )}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
