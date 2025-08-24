// tests/loadEnv.ts
import 'dotenv/config';

if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}
if (!process.env.SUPABASE_SERVICE_ROLE && process.env.VITE_SUPABASE_SERVICE_ROLE) {
  process.env.SUPABASE_SERVICE_ROLE = process.env.VITE_SUPABASE_SERVICE_ROLE;
}