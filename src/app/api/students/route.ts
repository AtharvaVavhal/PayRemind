import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOwnerIdForUser } from '@/lib/staff'

function validate(body: Record<string, unknown>): string | null {
  const { name, phone, fee_amount, due_day } = body
  if (!name || typeof name !== 'string' || !name.trim()) return 'Name is required'
  if (typeof phone !== 'string' || !/^91\d{10}$/.test(phone))
    return 'Phone must be 12 digits starting with 91'
  if (typeof fee_amount !== 'number' || isNaN(fee_amount) || fee_amount < 100)
    return 'Fee amount must be at least ₹100'
  if (
    typeof due_day !== 'number' ||
    !Number.isInteger(due_day) ||
    due_day < 1 ||
    due_day > 28
  )
    return 'Due day must be between 1 and 28'
  return null
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ownerId = await getOwnerIdForUser(supabase, user.id, user.email ?? '')

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('owner_id', ownerId)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ownerId = await getOwnerIdForUser(supabase, user.id, user.email ?? '')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', ownerId)
    .single()

  const isPro = profile?.is_pro ?? false

  if (!isPro) {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Free plan is limited to 3 students. Upgrade to Pro to add more.' },
        { status: 403 }
      )
    }
  }

  const body = (await request.json()) as Record<string, unknown>
  const validationError = validate(body)
  if (validationError)
    return NextResponse.json({ error: validationError }, { status: 400 })

  const { name, phone, fee_amount, due_day } = body
  const batch_name = (typeof body.batch_name === 'string' && body.batch_name.trim())
    ? body.batch_name.trim()
    : 'Default'

  const { data, error } = await supabase
    .from('students')
    .insert({ name, phone, fee_amount, due_day, batch_name, owner_id: ownerId })
    .select()
    .single()

  if (error) {
    console.error('Student insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
