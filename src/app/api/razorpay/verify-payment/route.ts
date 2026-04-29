import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
    } = await request.json()

    // 1. Generate our own signature using the secret key
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    // 2. Compare signatures to prevent spoofing
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // 3. If valid, update the payment status to 'paid' in Supabase
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq('id', payment_id)

    if (updateError) {
      console.error('Database Update Error:', updateError)
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Verification Error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}