import fp from 'fastify-plugin';
import { createClient } from '@supabase/supabase-js';

export default fp(async (app) => {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  app.decorate('supabase', supabase);
});

console.log('DEBUG SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('DEBUG SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE ? '***SET***' : 'MISSING');

declare module 'fastify' {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>;
  }
}