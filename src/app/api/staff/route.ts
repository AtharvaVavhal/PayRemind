import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOwnerIdForUser } from '@/lib/staff'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at')

    if (error) {
      console.error('Supabase staff query error:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      isOwner: true,
      ownerEmail: user.email ?? '',
      staff: data ?? [],
    })
  } catch (error) {
    console.error('GET /api/staff error:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ownerId = await getOwnerIdForUser(supabase, user.id, user.email ?? '')

    const body = (await request.json()) as { email?: string; name?: string }
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    const { data: existing, error: dupError } = await supabase
      .from('staff')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('email', email)
      .maybeSingle()

    if (dupError) {
      console.error('Supabase staff duplicate check error:', JSON.stringify(dupError, null, 2))
      return NextResponse.json({ error: dupError.message }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json(
        { error: 'A staff member with this email already exists' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('staff')
      .insert({ owner_id: ownerId, email, name, role: 'staff' })
      .select()
      .single()

    if (error) {
      console.error('Supabase staff insert error:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/staff error:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
