// server/src/plugins/supabase.ts
import fp from "fastify-plugin";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Fastify plugin: attaches a typed Supabase client to `app.supabase`.
 * - Uses service role for server-side operations.
 * - No session persistence on server.
 */
export default fp(async (app) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    app.log.error(
      { hasUrl: Boolean(url), hasKey: Boolean(key), nodeEnv: process.env.NODE_ENV },
      "Supabase env missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE)"
    );
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
  }

  const supabase: SupabaseClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
    global: {
      fetch: (input, init) => {
        // Apply a 10s timeout to all Supabase fetches
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
      }
    }
  });

  app.decorate("supabase", supabase);
  app.decorate("checkSupabaseHealth", async () => {
    try {
      const { error } = await supabase.from("tenants").select("id").limit(1);
      return !error;
    } catch {
      return false;
    }
  });
  app.log.debug("Supabase client initialized");
});

// Module augmentation to expose `supabase` on FastifyInstance
declare module "fastify" {
  interface FastifyInstance {
    supabase: SupabaseClient;
    checkSupabaseHealth: () => Promise<boolean>;
  }
}