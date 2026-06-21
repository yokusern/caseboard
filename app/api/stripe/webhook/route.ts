import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = getAdminDb()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const uid = session.metadata?.uid
    const customerId = typeof session.customer === 'string' ? session.customer : null
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null

    if (uid) {
      await db.collection('users').doc(uid).update({
        plan: 'pro',
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const uid = sub.metadata?.uid
    if (uid) {
      const active = sub.status === 'active' || sub.status === 'trialing'
      await db.collection('users').doc(uid).update({
        plan: active ? 'pro' : 'free',
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const uid = sub.metadata?.uid
    if (uid) {
      await db.collection('users').doc(uid).update({
        plan: 'free',
        stripeSubscriptionId: null,
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
  }

  return NextResponse.json({ received: true })
}
