// tests/loadEnv.ts
import 'dotenv/config';

if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}

// Default port for tests
process.env.PORT = process.env.PORT || '3001';