import 'dotenv/config';

// Map VITE_* to Node names used by tests/server
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL)
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;

if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY)
  process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;