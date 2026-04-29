import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify payment belongs to the logged-in owner via join
  const { error: fetchError } = await supabase
    .from('payments')
    .select('id, students!inner(owner_id)')
    .eq('id', id)
    .eq('students.owner_id', user.id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116')
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('payments')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
