import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { razorpay } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { payment_id } = await request.json()

    if (!payment_id) {
      return NextResponse.json({ error: 'Missing payment_id' }, { status: 400 })
    }

    // 1. Fetch the payment and related student fee amount
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*, students(fee_amount)')
      .eq('id', payment_id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Handle potential array response from Supabase joins
    const studentData = Array.isArray(payment.students) 
      ? payment.students[0] 
      : payment.students;
    
    const feeAmount = studentData?.fee_amount;

    if (!feeAmount) {
      return NextResponse.json({ error: 'Fee amount not found' }, { status: 400 });
    }

    // Razorpay expects the amount in paise
    const amountInPaise = feeAmount * 100

    // 2. Create the order in Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      // FIX: Truncate receipt to stay under Razorpay's strict 40-character limit
      receipt: `rcpt_${payment_id.substring(0, 15)}`, 
    })

    // 3. Save the order ID to your database
    await supabase
      .from('payments')
      .update({ razorpay_order_id: order.id })
      .eq('id', payment_id)

    // 4. Send the data back to the client component
    return NextResponse.json({ 
      order_id: order.id, 
      amount: amountInPaise, 
      currency: 'INR' 
    })
    
  } catch (error) {
    // Log the full error to your terminal for debugging
    console.error('Create Order Error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}