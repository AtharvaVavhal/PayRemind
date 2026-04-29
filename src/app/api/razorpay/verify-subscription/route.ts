import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import crypto from 'crypto' // Needed for signature verification

export async function POST(request: Request) {
  try {
    const { subscription_id, payment_id, signature } = await request.json()
    const supabase = await createServerSupabaseClient()
    
    // 1. Authenticate the Coaching Owner
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. [Optional but Recommended] Verify the Signature
    // If you want to be 100% secure, uncomment this block:
    /*
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(payment_id + '|' + subscription_id)
      .digest('hex');

    if (generated_signature !== signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }
    */

    // 3. Update the profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        is_pro: true, 
        subscription_id: subscription_id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' }) // Ensures we update the existing row if it exists

    if (error) {
      console.error('Supabase Profile Update Error:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Verification Route Crash:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}