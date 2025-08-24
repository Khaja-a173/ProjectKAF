import 'dotenv/config';

// Existing mappings…
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}

// NEW: allow tests to provide service role via VITE_*
if (!process.env.SUPABASE_SERVICE_ROLE && process.env.VITE_SUPABASE_SERVICE_ROLE) {
  process.env.SUPABASE_SERVICE_ROLE = process.env.VITE_SUPABASE_SERVICE_ROLE;
}