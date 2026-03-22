import { createClient } from '@supabase/supabase-js'

// 1. Pull the environment variables you just saved in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// 2. Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)