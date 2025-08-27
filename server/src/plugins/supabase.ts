// server/src/plugins/supabase.ts
import fp from 'fastify-plugin';
import { createClient } from '@supabase/supabase-js';

export default fp(async (app) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    app.log.error({ url: !!url, key: !!key }, 'Supabase env missing');
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  app.decorate('supabase', supabase);
  app.log.info({ envPath: process.env.DOTENV_CONFIG_PATH || 'process.env' }, 'Supabase client initialized');
});

declare module 'fastify' {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>;
  }
}