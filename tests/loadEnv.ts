import 'dotenv/config';

// Ensure SUPABASE_URL is available for both client and service contexts
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;