/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'LeadPulse: Missing Supabase env vars.\n' +
        'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
