import type { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';

const Body = z.object({ user_id: z.string().uuid(), tenant_id: z.string().min(1) });

const authSetTenantRoute: FastifyPluginCallback = (fastify, _opts, done) => {
  const supabase = (fastify as any).supabaseAdmin as import('@supabase/supabase-js').SupabaseClient;

  fastify.post('/auth/set-tenant', async (req, rep) => {
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return rep.code(400).send({ error: parsed.error.flatten() });

    const { user_id, tenant_id } = parsed.data;

    // Read existing app_metadata to avoid clobbering other fields
    const { data: userInfo, error: getErr } = await supabase.auth.admin.getUserById(user_id);
    if (getErr || !userInfo?.user) return rep.code(404).send({ error: 'user_not_found' });

    const prev = userInfo.user.app_metadata || {};
    const nextAppMeta = { ...prev, tenant_id };

    const { error: updErr } = await supabase.auth.admin.updateUserById(user_id, {
      app_metadata: nextAppMeta,
    });

    if (updErr) return rep.code(500).send({ error: 'set_tenant_failed' });

    return rep.send({ ok: true });
  });

  done();
};

export default authSetTenantRoute;