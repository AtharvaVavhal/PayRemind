import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOwnerIdForUser } from '@/lib/staff'

function addDays(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ownerId = await getOwnerIdForUser(supabase, user.id, user.email ?? '')
  const { id } = await params

  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, reminder_count, month, students!inner(owner_id, due_day)')
    .eq('id', id)
    .eq('students.owner_id', ownerId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116')
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const student = Array.isArray(payment.students) ? payment.students[0] : payment.students
  const newCount = (payment.reminder_count ?? 0) + 1
  const dueDate = new Date(`${payment.month}-${String(student.due_day).padStart(2, '0')}`)

  let next_reminder_due: string | null = null
  if (newCount === 1) next_reminder_due = addDays(dueDate, 7)
  else if (newCount === 2) next_reminder_due = addDays(dueDate, 10)
  // newCount >= 3 → null (no more scheduled reminders)

  const { data, error } = await supabase
    .from('payments')
    .update({
      reminder_sent_at: new Date().toISOString(),
      reminder_count: newCount,
      next_reminder_due,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
