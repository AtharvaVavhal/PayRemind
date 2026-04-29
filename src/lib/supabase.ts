// Browser client - safe for client components
export { supabase, createBrowserSupabaseClient } from './supabase-browser'
// Server client - only use in server components and API routes
export { createServerSupabaseClient } from './supabase-server'
