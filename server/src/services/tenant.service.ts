// server/src/services/tenant.service.ts
import type { FastifyInstance } from 'fastify';
import { createSlug } from '../lib/slug';                // 👈 add this util (see below)
import { generateTenantCode } from '../lib/codegen';     // 👈 already in your project per Bolt output

export class TenantService {
  constructor(private app: FastifyInstance) {}

  /**
   * Create tenant with:
   * - slug: required, unique
   * - code: 4-char, unique
   * - subscription_plan: maps from API field "plan"
   */
  async createTenant(name: string, plan?: string) {
    // 1) Build a base slug from the name
    const baseSlug = createSlug(name);

    // 2) Ensure slug uniqueness (append -2, -3, ...)
    const slug = await this.ensureUniqueSlug(baseSlug);

    // 3) Ensure a unique 4-char code
    const code = await this.ensureUniqueCode();

    // 4) Insert
    const payload = {
      name,
      slug,                               // 👈 REQUIRED by DB (NOT NULL)
      code,                               // 👈 4-char unique
      subscription_plan: plan ?? 'basic', // 👈 map "plan" → "subscription_plan"
    };

    const { data, error } = await this.app.supabase
      .from('tenants')
      .insert(payload)
      .select('id, name, code, slug')
      .single();

    if (error) {
      // use sensible if registered, otherwise Error fallback
      if ((this.app as any).httpErrors?.internalServerError) {
        throw this.app.httpErrors.internalServerError(error.message);
      }
      throw new Error(error.message);
    }

    return data!;
  }

  async getTenantByCode(code: string) {
    const { data, error } = await this.app.supabase
      .from('tenants')
      .select('id, name, code, slug')
      .eq('code', code)
      .single();

    if (error && (error as any).code !== 'PGRST116') {
      if ((this.app as any).httpErrors?.internalServerError) {
        throw this.app.httpErrors.internalServerError(error.message);
      }
      throw new Error(error.message);
    }
    return data ?? null;
  }

  // ---- helpers ----

  private async ensureUniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 1;
    // try up to a reasonable number of suffixes
    while (true) {
      const { data, error } = await this.app.supabase
        .from('tenants')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle();

      if (error) {
        // break on read error to avoid infinite loop; surface error
        if ((this.app as any).httpErrors?.internalServerError) {
          throw this.app.httpErrors.internalServerError(error.message);
        }
        throw new Error(error.message);
      }

      if (!data) return candidate; // unique
      n += 1;
      candidate = `${base}-${n}`;
    }
  }

  private async ensureUniqueCode(): Promise<string> {
    // loop until code is free
    for (let i = 0; i < 50; i++) {
      const code = generateTenantCode(); // e.g., 4-char alphanumeric from your codegen.ts
      const { data, error } = await this.app.supabase
        .from('tenants')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        if ((this.app as any).httpErrors?.internalServerError) {
          throw this.app.httpErrors.internalServerError(error.message);
        }
        throw new Error(error.message);
      }

      if (!data) return code; // not taken
    }
    if ((this.app as any).httpErrors?.internalServerError) {
      throw this.app.httpErrors.internalServerError('Failed to generate unique tenant code after multiple attempts');
    }
    throw new Error('Failed to generate unique tenant code after multiple attempts');
  }
}