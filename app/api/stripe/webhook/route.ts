import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const uid = session.metadata?.uid
    const customerId = typeof session.customer === 'string' ? session.customer : null

    if (uid) {
      const db = getAdminDb()
      await db.collection('users').doc(uid).update({
        plan: 'pro',
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
  }

  return NextResponse.json({ received: true })
}
