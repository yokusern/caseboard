'use client'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { Case, CaseStatus } from '@/types'
import CaseCard from './CaseCard'

interface Props {
  columnId: CaseStatus
  label: string
  cases: Case[]
  uid: string
  onEdit: (c: Case) => void
}

export default function KanbanColumn({ columnId, label, cases, uid, onEdit }: Props) {
  const total = cases.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="shrink-0 w-60 flex flex-col bg-slate-100 rounded-xl">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="bg-slate-200 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {cases.length}
          </span>
        </div>
        {cases.length > 0 && (
          <p className="text-xs text-slate-500 mt-0.5">¥{total.toLocaleString()}</p>
        )}
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-24 px-2 pb-2 flex flex-col gap-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-50 rounded-b-xl' : ''
            }`}
          >
            {cases.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(prov) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                  >
                    <CaseCard item={item} uid={uid} onClick={() => onEdit(item)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
