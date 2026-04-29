import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { razorpay } from '@/lib/razorpay'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Create the Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID!,
      customer_notify: 1,
      total_count: 12, // 1 year of billing cycles
      notes: {
        owner_id: user.id // We store this to know who paid
      }
    })

    return NextResponse.json({ 
      subscription_id: subscription.id 
    })

  } catch (error) {
    console.error('Subscription Creation Error:', error)
    return NextResponse.json({ error: 'Failed to initiate subscription' }, { status: 500 })
  }
}