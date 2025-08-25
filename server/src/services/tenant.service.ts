// server/src/services/tenant.service.ts
import type { FastifyInstance } from 'fastify';

export class TenantService {
  constructor(private app: FastifyInstance) {}

  async createTenant(name: string, plan?: string) {
    // Map API 'plan' to DB 'subscription_plan'
    const payload = {
      name,
      subscription_plan: plan ?? 'basic', // 👈 key fix
      // keep any existing fields you were setting (e.g., code) as-is
      // code: generate4CharCode() ... if your current code already sets it
    };

    const { data, error } = await this.app.supabase
      .from('tenants')
      .insert(payload)
      .select('id, name, code, slug')
      .single();

    if (error) {
      throw this.app.httpErrors.internalServerError(error.message);
    }
    return data;
  }

  async getTenantByCode(code: string) {
    const { data, error } = await this.app.supabase
      .from('tenants')
      .select('id, name, code, slug')
      .eq('code', code)
      .single();

    if (error && error.code !== 'PGRST116') { // not found
      throw this.app.httpErrors.internalServerError(error.message);
    }
    return data ?? null;
  }
}