'use client'
import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Case } from '@/types'

function serializeCase(id: string, data: DocumentData): Case {
  return {
    id,
    clientName: data.clientName ?? '',
    title: data.title ?? '',
    amount: data.amount ?? 0,
    platform: data.platform ?? 'other',
    status: data.status ?? 'proposal',
    deadline: data.deadline instanceof Timestamp ? data.deadline.toDate().toISOString() : null,
    memo: data.memo ?? '',
    caseUrl: data.caseUrl ?? '',
    order: data.order ?? 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : '',
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : '',
  }
}

export function useCases(uid: string | null) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setCases([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'users', uid, 'cases'),
      orderBy('order', 'asc')
    )

    return onSnapshot(q, (snapshot) => {
      setCases(snapshot.docs.map(d => serializeCase(d.id, d.data())))
      setLoading(false)
    })
  }, [uid])

  return { cases, loading }
}
