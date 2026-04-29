import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import StudentsClient from '@/components/StudentsClient'
import TemplateManager from '@/components/TemplateManager'
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single()

  const isPro = profile?.is_pro ?? false

  return (
    <>
      <StudentsClient students={students} userId={user.id} isPro={isPro} />
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <TemplateManager />
      </div>
    </>
  )
}
