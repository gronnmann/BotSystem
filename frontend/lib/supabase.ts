

const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PROJECT_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

if (!PROJECT_URL || !PROJECT_ANON_KEY) {
    throw new Error(
        "Missing Supabase URL or Anon Key. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.",
    );
}

const supabase = createClient<Database>(PROJECT_URL, PROJECT_ANON_KEY);

export { supabase };
