import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address: any | null;
          settings: any | null;
          subscription_plan: string;
          subscription_status: string;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: any | null;
          settings?: any | null;
          subscription_plan?: string;
          subscription_status?: string;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: any | null;
          settings?: any | null;
          subscription_plan?: string;
          subscription_status?: string;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          tenant_id: string | null;
          email: string;
          password_hash: string | null;
          first_name: string;
          last_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: 'super_admin' | 'tenant_admin' | 'manager' | 'staff' | 'customer';
          permissions: any | null;
          is_active: boolean;
          last_login_at: string | null;
          email_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          email: string;
          password_hash?: string | null;
          first_name: string;
          last_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'super_admin' | 'tenant_admin' | 'manager' | 'staff' | 'customer';
          permissions?: any | null;
          is_active?: boolean;
          last_login_at?: string | null;
          email_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          email?: string;
          password_hash?: string | null;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'super_admin' | 'tenant_admin' | 'manager' | 'staff' | 'customer';
          permissions?: any | null;
          is_active?: boolean;
          last_login_at?: string | null;
          email_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};