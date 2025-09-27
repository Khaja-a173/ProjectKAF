import type { FastifyInstance } from "fastify";

export default async function plansRoutes(fastify: FastifyInstance) {
  fastify.get("/api/plans", async (_req, _reply) => {
    const sql = `
      select
        code,
        name,
        description,
        price_monthly,
        price_yearly,
        features,
        is_active
      from public.subscription_plans
      where is_active = true
      order by
        case code
          when 'elite' then 1
          when 'pro'   then 2
          else 3
        end
    `;

    // ✅ Use fastify.pg.pool (official plugin guarantees this shape)
    const { rows } = await fastify.pg.pool.query(sql);
    return { plans: rows ?? [] };
  });
}