// server/src/plugins/supabase.ts
import fp from 'fastify-plugin';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

export default fp(async (app) => {
  // Resolve candidate .env paths (server/.env preferred, then project/.env)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);
  const serverEnv  = path.resolve(__dirname, '../.env');      // /server/.env
  const rootEnv    = path.resolve(__dirname, '../../.env');   // /project/.env

  let envPath = '';
  if (fs.existsSync(serverEnv)) envPath = serverEnv;
  else if (fs.existsSync(rootEnv)) envPath = rootEnv;

  if (envPath) {
    loadEnv({ path: envPath });
    app.log.info({ envPath }, 'Loaded environment file for Supabase');
  } else {
    app.log.warn('No .env file found near Supabase plugin; relying on process.env only');
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    // Clear, actionable message; avoids cryptic "supabaseUrl is required"
    const details = {
      hasUrl: !!url,
      hasServiceRole: !!key,
      tried: { serverEnv, rootEnv }
    };
    app.log.error(details, 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
    throw new Error('Supabase env missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE in /server/.env (preferred) or /project/.env');
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  app.decorate('supabase', supabase);
});

// Fastify typing
declare module 'fastify' {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>;
  }
}