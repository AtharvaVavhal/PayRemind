import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface RawRow {
  name: unknown
  phone: unknown
  fee_amount: unknown
  due_day: unknown
  batch_name: unknown
}

interface ValidRow {
  name: string
  phone: string
  fee_amount: number
  due_day: number
  batch_name: string
  owner_id: string
}

interface RowError {
  row: number
  reason: string
}

function validateRow(raw: RawRow, ownerID: string): ValidRow | string {
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  if (!name) return 'Name is required'

  const rawPhone = typeof raw.phone === 'string' ? raw.phone.trim().replace(/\D/g, '') : ''
  if (!/^\d{10}$/.test(rawPhone)) return 'Phone must be 10 digits'
  const phone = '91' + rawPhone

  const fee_amount = Number(raw.fee_amount)
  if (isNaN(fee_amount) || fee_amount < 100) return 'Fee must be at least ₹100'

  const due_day = Number(raw.due_day)
  if (!Number.isInteger(due_day) || due_day < 1 || due_day > 28) return 'Due day must be 1–28'

  const batch_name =
    typeof raw.batch_name === 'string' && raw.batch_name.trim()
      ? raw.batch_name.trim()
      : 'Default'

  return { name, phone, fee_amount, due_day, batch_name, owner_id: ownerID }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single()

  const isPro = profile?.is_pro ?? false

  const { students: rows }: { students: RawRow[] } = await request.json()

  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })

  // For free users, check remaining capacity
  let capacity = Infinity
  if (!isPro) {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
    const used = count ?? 0
    capacity = Math.max(0, 3 - used)
    if (capacity === 0)
      return NextResponse.json(
        { error: 'Free plan is limited to 3 students. Upgrade to Pro to import more.' },
        { status: 403 }
      )
  }

  const { data: existing } = await supabase
    .from('students')
    .select('phone')
    .eq('owner_id', user.id)

  const existingPhones = new Set((existing ?? []).map((s) => s.phone))

  const valid: ValidRow[] = []
  const errors: RowError[] = []

  for (let i = 0; i < rows.length; i++) {
    if (!isPro && valid.length >= capacity) {
      errors.push({ row: i + 2, reason: 'Free plan limit reached (3 students max)' })
      continue
    }
    const result = validateRow(rows[i], user.id)
    if (typeof result === 'string') {
      errors.push({ row: i + 2, reason: result })
    } else if (existingPhones.has(result.phone)) {
      errors.push({ row: i + 2, reason: 'Phone number already exists' })
    } else {
      existingPhones.add(result.phone) // prevent duplicates within the same CSV
      valid.push(result)
    }
  }

  if (valid.length === 0)
    return NextResponse.json({ imported: 0, skipped: errors.length, errors })

  const { error: insertError } = await supabase.from('students').insert(valid)

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ imported: valid.length, skipped: errors.length, errors })
}
