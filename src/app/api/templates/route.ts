// Run this SQL in Supabase before using this route:
//
// CREATE TABLE IF NOT EXISTS templates (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
//   name TEXT NOT NULL,
//   message TEXT NOT NULL,
//   is_default BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "owners_manage_templates" ON templates FOR ALL USING (auth.uid() = owner_id);

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, message, is_default } = await request.json()
  if (!name?.trim() || !message?.trim())
    return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })

  if (is_default) {
    await supabase
      .from('templates')
      .update({ is_default: false })
      .eq('owner_id', user.id)
  }

  const { data, error } = await supabase
    .from('templates')
    .insert({ name: name.trim(), message: message.trim(), is_default: !!is_default, owner_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
