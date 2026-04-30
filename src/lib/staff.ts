import type { SupabaseClient } from '@supabase/supabase-js'

export async function getOwnerIdForUser(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string
): Promise<string> {
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)

  if ((count ?? 0) > 0) return userId

  const { data: staffRecord } = await supabase
    .from('staff')
    .select('owner_id')
    .eq('email', userEmail)
    .single()

  if (staffRecord) return staffRecord.owner_id

  return userId
}
