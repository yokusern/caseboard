import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { CaseInput, CaseStatus } from '@/types'

type CaseUpdate = Partial<CaseInput & { status: CaseStatus; order: number }>

export async function addCase(uid: string, data: CaseInput, currentCount: number) {
  return addDoc(collection(db, 'users', uid, 'cases'), {
    clientName: data.clientName,
    title: data.title,
    amount: data.amount,
    platform: data.platform,
    status: 'proposal' as CaseStatus,
    deadline: data.deadline ? Timestamp.fromDate(new Date(data.deadline)) : null,
    memo: data.memo ?? '',
    caseUrl: data.caseUrl ?? '',
    order: currentCount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCase(uid: string, caseId: string, data: CaseUpdate) {
  const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() }

  if (data.clientName !== undefined) updateData.clientName = data.clientName
  if (data.title !== undefined) updateData.title = data.title
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.platform !== undefined) updateData.platform = data.platform
  if (data.status !== undefined) updateData.status = data.status
  if (data.order !== undefined) updateData.order = data.order
  if (data.memo !== undefined) updateData.memo = data.memo
  if (data.caseUrl !== undefined) updateData.caseUrl = data.caseUrl
  if ('deadline' in data) {
    updateData.deadline = data.deadline
      ? Timestamp.fromDate(new Date(data.deadline!))
      : null
  }

  return updateDoc(doc(db, 'users', uid, 'cases', caseId), updateData)
}

export async function deleteCase(uid: string, caseId: string) {
  return deleteDoc(doc(db, 'users', uid, 'cases', caseId))
}

export async function seedSampleCases(uid: string) {
  const now = new Date()
  const day7  = new Date(now); day7.setDate(now.getDate() + 7)
  const day14 = new Date(now); day14.setDate(now.getDate() + 14)
  const batch = writeBatch(db)

  const ref1 = doc(collection(db, 'users', uid, 'cases'))
  batch.set(ref1, {
    clientName: 'サンプル株式会社',
    title: 'LP制作',
    amount: 50000,
    platform: 'coconala' as const,
    status: 'working' as CaseStatus,
    deadline: Timestamp.fromDate(day7),
    memo: 'これはサンプル案件です。自由に編集・削除してください。',
    caseUrl: '',
    order: 0,
    isSample: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const ref2 = doc(collection(db, 'users', uid, 'cases'))
  batch.set(ref2, {
    clientName: 'テスト商店',
    title: 'バナーデザイン3枚',
    amount: 15000,
    platform: 'lancers' as const,
    status: 'proposal' as CaseStatus,
    deadline: Timestamp.fromDate(day14),
    memo: 'これはサンプル案件です。自由に編集・削除してください。',
    caseUrl: '',
    order: 0,
    isSample: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}

export function exportCasesToCsv(cases: import('@/types').Case[]) {
  const headers = ['クライアント名', '案件名', '金額', 'プラットフォーム', 'ステータス', '納期', 'メモ', 'URL', '作成日']
  const rows = cases.map(c => [
    c.clientName,
    c.title,
    c.amount,
    c.platform,
    c.status,
    c.deadline ? new Date(c.deadline).toLocaleDateString('ja-JP') : '',
    c.memo,
    c.caseUrl,
    c.createdAt ? new Date(c.createdAt).toLocaleDateString('ja-JP') : '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return '﻿' + csv
}
