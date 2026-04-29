import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from '@/components/DashboardClient'
import type { Payment, Student } from '@/types'

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const month = currentMonth()

  const { data: studentsData } = await supabase
    .from('students')
    .select('*')
    .eq('owner_id', user.id)
    .order('name')

  const students: Student[] = studentsData ?? []

  let payments: Payment[] = []

  if (students.length > 0) {
    const studentIds = students.map((s) => s.id)

    const { data: existingData } = await supabase
      .from('payments')
      .select('*')
      .in('student_id', studentIds)
      .eq('month', month)

    const existing: Payment[] = existingData ?? []
    const coveredIds = new Set(existing.map((p) => p.student_id))
    const missing = students.filter((s) => !coveredIds.has(s.id))

    let inserted: Payment[] = []
    if (missing.length > 0) {
      const { data: insertedData } = await supabase
        .from('payments')
        .insert(
          missing.map((s) => ({
            student_id: s.id,
            month,
            status: 'pending' as const,
            paid_at: null,
            reminder_sent_at: null,
          }))
        )
        .select()
      inserted = insertedData ?? []
    }

    payments = [...existing, ...inserted]
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single()

  const isPro = profile?.is_pro ?? false

  return <DashboardClient students={students} payments={payments} isPro={isPro} />
}
