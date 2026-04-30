import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOwnerIdForUser } from '@/lib/staff'

export async function DELETE(
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

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id)
    .eq('owner_id', ownerId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
