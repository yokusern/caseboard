import { NextRequest, NextResponse } from 'next/server'
import { stripe, APP_URL } from '@/lib/stripe'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const token = (request.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  let uid: string
  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: '認証エラー' }, { status: 401 })
  }

  const db = getAdminDb()
  const userDoc = await db.collection('users').doc(uid).get()
  const customerId = userDoc.data()?.stripeCustomerId as string | undefined

  if (!customerId) {
    return NextResponse.json({ error: 'Stripeアカウントが見つかりません' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
