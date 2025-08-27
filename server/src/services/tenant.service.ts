// server/src/services/tenant.service.ts
import type { FastifyInstance } from 'fastify';

/** Create a URL-safe slug from a name */
function createSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')       // non-alnum → hyphen
    .replace(/^-+|-+$/g, '')           // trim hyphens
    .replace(/-{2,}/g, '-')            // collapse
    .slice(0, 60);
}

/** Generate a 4-char uppercase code (avoids confusing chars) */
function generateCode4(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

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
      slug,                               // REQUIRED (NOT NULL)
      code,                               // 4-char unique
      subscription_plan: plan ?? 'basic', // map API "plan" → DB "subscription_plan"
    };

    const { data, error } = await this.app.supabase
      .from('tenants')
      .insert(payload)
      .select('id, name, code, slug')
      .single();

    if (error) this.throwHttp500(error.message);
    return data!;
  }

  async getTenantByCode(code: string) {
    const { data, error } = await this.app.supabase
      .from('tenants')
      .select('id, name, code, slug')
      .eq('code', code)
      .single();

    // PGRST116 = No rows
    if (error && (error as any).code !== 'PGRST116') {
      this.throwHttp500(error.message);
    }
    return data ?? null;
  }

  // ---- helpers ----

  private async ensureUniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 1;

    while (true) {
      const { data, error } = await this.app.supabase
        .from('tenants')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle();

      if (error) this.throwHttp500(error.message);
      if (!data) return candidate; // unique

      n += 1;
      candidate = `${base}-${n}`;
    }
  }

  private async ensureUniqueCode(): Promise<string> {
    for (let i = 0; i < 50; i++) {
      const code = generateCode4();
      const { data, error } = await this.app.supabase
        .from('tenants')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (error) this.throwHttp500(error.message);
      if (!data) return code; // unique
    }
    this.throwHttp500('Failed to generate unique tenant code after multiple attempts');
    return 'UNREACHABLE';
  }

  private throwHttp500(message: string): never {
    // Use @fastify/sensible if present; otherwise fall back to Error
    const anyApp = this.app as any;
    if (anyApp.httpErrors?.internalServerError) {
      throw anyApp.httpErrors.internalServerError(message);
    }
    throw new Error(message);
  }
}