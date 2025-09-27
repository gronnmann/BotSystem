import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'

const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PROJECT_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!PROJECT_URL || !PROJECT_ANON_KEY){
  throw new Error("Supabase vars not configured.");
}

const supabaseClient = createClient<Database>(
  PROJECT_URL, PROJECT_ANON_KEY
);

export default supabaseClient;