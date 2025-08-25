import type { FastifyInstance } from 'fastify';
import { generateRestaurantCode } from '../lib/codegen.js';

export class TenantService {
  constructor(private app: FastifyInstance) {}

  async createTenant(name: string, plan = 'basic') {
    const { supabase } = this.app;
    for (let i = 0; i < 5; i++) {
      const code = generateRestaurantCode();
      const { data, error } = await supabase
        .from('tenants')
        .insert({ name, plan, code })
        .select()
        .single();
      if (!error) return data;
      if ((error as any).code !== '23505') throw error; // not unique_violation
    }
    throw new Error('Failed to generate unique 4-char code after retries');
  }

  async getTenantByCode(code: string) {
    const { data, error } = await this.app.supabase
      .from('tenants')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}