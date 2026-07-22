import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
  })
}

export async function GET() {
  try {
    const stripe = getStripe()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ plan: 'FREE', status: 'active' })
    }

    // Try to fetch from subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    if (subscription?.plan === 'PRO' && subscription?.status === 'active') {
      return NextResponse.json({ plan: 'PRO', status: 'active' })
    }

    // Fallback: check Stripe directly for active subscriptions
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    if (customers.data.length > 0) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
        limit: 1,
      })

      if (subscriptions.data.length > 0) {
        // Found active Stripe subscription — upsert into local table
        const sub = subscriptions.data[0]
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_subscription_id: sub.id,
            stripe_customer_id: customers.data[0].id,
            status: 'active',
            plan: 'PRO',
          })

        return NextResponse.json({ plan: 'PRO', status: 'active' })
      }
    }

    return NextResponse.json({ plan: 'FREE', status: 'active' })
  } catch (error) {
    console.error('Failed to fetch subscription:', error)
    return NextResponse.json({ plan: 'FREE', status: 'active' })
  }
}

export async function POST() {
  try {
    const stripe = getStripe()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find active subscription in local table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('plan', 'PRO')
      .single()

    if (subscription?.stripe_subscription_id) {
      // Cancel the Stripe subscription at period end
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        })
      } catch (stripeErr) {
        console.error('Stripe cancel error (non-fatal):', stripeErr)
      }
    }

    // Update local table
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_subscription_id: subscription?.stripe_subscription_id || null,
        stripe_customer_id: subscription?.stripe_customer_id || null,
        status: 'canceled',
        plan: 'FREE',
      })

    return NextResponse.json({ plan: 'FREE', status: 'active' })
  } catch (error) {
    console.error('Failed to cancel subscription:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
