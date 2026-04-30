import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { subscription_id } = await request.json()
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('profiles')
      .update({ is_pro: true, subscription_id })
      .eq('id', user.id)

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
