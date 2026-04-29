import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import StudentsClient from '@/components/StudentsClient'
import type { Student } from '@/types'

export default async function StudentsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  const students: Student[] = data ?? []

  return <StudentsClient students={students} userId={user.id} />
}
