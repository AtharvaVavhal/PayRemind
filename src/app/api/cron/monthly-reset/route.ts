// Required env vars: CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const month = currentMonth()

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id')

  if (studentsError) {
    console.error('Monthly reset — fetch students error:', studentsError)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }

  if (!students || students.length === 0) {
    return NextResponse.json({ success: true, created: 0 })
  }

  const studentIds = students.map((s) => s.id)

  const { data: existing, error: existingError } = await supabase
    .from('payments')
    .select('student_id')
    .in('student_id', studentIds)
    .eq('month', month)

  if (existingError) {
    console.error('Monthly reset — fetch existing payments error:', existingError)
    return NextResponse.json({ error: 'Failed to fetch existing payments' }, { status: 500 })
  }

  const coveredIds = new Set((existing ?? []).map((p) => p.student_id))
  const missing = studentIds.filter((id) => !coveredIds.has(id))

  if (missing.length === 0) {
    return NextResponse.json({ success: true, created: 0 })
  }

  const { error: insertError } = await supabase.from('payments').insert(
    missing.map((student_id) => ({
      student_id,
      month,
      status: 'pending' as const,
      paid_at: null,
      reminder_sent_at: null,
    }))
  )

  if (insertError) {
    console.error('Monthly reset — insert error:', insertError)
    return NextResponse.json({ error: 'Failed to insert payment records' }, { status: 500 })
  }

  return NextResponse.json({ success: true, created: missing.length })
}
