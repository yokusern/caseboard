export type CaseStatus = 'proposal' | 'accepted' | 'working' | 'review' | 'paid'
export type Platform = 'coconala' | 'lancers' | 'direct' | 'other'
export type Plan = 'free' | 'pro'

export interface Case {
  id: string
  clientName: string
  title: string
  amount: number
  platform: Platform
  status: CaseStatus
  deadline: string | null
  memo: string
  caseUrl: string
  order: number
  isSample?: boolean
  createdAt: string
  updatedAt: string
}

export interface CaseInput {
  clientName: string
  title: string
  amount: number
  platform: Platform
  deadline?: string | null
  memo?: string
  caseUrl?: string
}

export interface UserProfile {
  email: string
  displayName: string
  plan: Plan
  stripeCustomerId: string
  hasSeenOnboarding?: boolean
  createdAt: string
}

export const COLUMNS: { id: CaseStatus; label: string }[] = [
  { id: 'proposal', label: '提案中' },
  { id: 'accepted', label: '受注' },
  { id: 'working', label: '制作中' },
  { id: 'review', label: '検収' },
  { id: 'paid', label: '入金済み' },
]

export const PLATFORM_LABELS: Record<Platform, { label: string; emoji: string }> = {
  lancers: { label: 'ランサーズ', emoji: '🟣' },
  coconala: { label: 'ココナラ', emoji: '🟠' },
  direct: { label: '直接', emoji: '⚪' },
  other: { label: 'その他', emoji: '⚫' },
}

export const FREE_CASE_LIMIT = 5
