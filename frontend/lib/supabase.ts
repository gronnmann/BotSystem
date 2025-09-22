

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROJECT_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!PROJECT_URL || !PROJECT_ANON_KEY) {
  throw new Error(
    'Missing Supabase URL or Anon Key. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
  )
}

// Single global Supabase client instance
export const supabase = createBrowserClient<Database>(PROJECT_URL, PROJECT_ANON_KEY)
