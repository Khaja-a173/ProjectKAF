import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website: string | null
          phone: string | null
          email: string | null
          address: any | null
          settings: any
          subscription_plan: string
          subscription_status: string
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          address?: any | null
          settings?: any
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          phone?: string | null
          email?: string | null
          address?: any | null
          settings?: any
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string | null
          email: string
          password_hash: string | null
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          role: 'super_admin' | 'tenant_admin' | 'manager' | 'staff' | 'customer'
          permissions: any
          is_active: boolean
          last_login_at: string | null
          email_verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          email: string
          password_hash?: string | null
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'tenant_admin' | 'manager' | 'staff' | 'customer'
          permissions?: any
          is_active?: boolean
          last_login_at?: string | null
          email_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          email?: string
          password_hash?: string | null
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'tenant_admin' | 'manager' | 'staff' | 'customer'
          permissions?: any
          is_active?: boolean
          last_login_at?: string | null
          email_verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          tenant_id: string | null
          category_id: string | null
          name: string
          description: string | null
          price: number
          cost: number | null
          image_url: string | null
          images: any
          ingredients: any
          allergens: any
          nutritional_info: any
          dietary_info: any
          preparation_time: number | null
          calories: number | null
          is_available: boolean
          is_featured: boolean
          sort_order: number
          variants: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          cost?: number | null
          image_url?: string | null
          images?: any
          ingredients?: any
          allergens?: any
          nutritional_info?: any
          dietary_info?: any
          preparation_time?: number | null
          calories?: number | null
          is_available?: boolean
          is_featured?: boolean
          sort_order?: number
          variants?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          cost?: number | null
          image_url?: string | null
          images?: any
          ingredients?: any
          allergens?: any
          nutritional_info?: any
          dietary_info?: any
          preparation_time?: number | null
          calories?: number | null
          is_available?: boolean
          is_featured?: boolean
          sort_order?: number
          variants?: any
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          tenant_id: string | null
          customer_id: string | null
          table_id: string | null
          staff_id: string | null
          order_number: string
          order_type: string
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
          subtotal: number
          tax_amount: number
          discount_amount: number
          tip_amount: number
          total_amount: number
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          special_instructions: string | null
          estimated_ready_time: string | null
          ready_at: string | null
          served_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          customer_id?: string | null
          table_id?: string | null
          staff_id?: string | null
          order_number: string
          order_type?: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          tip_amount?: number
          total_amount?: number
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          special_instructions?: string | null
          estimated_ready_time?: string | null
          ready_at?: string | null
          served_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          customer_id?: string | null
          table_id?: string | null
          staff_id?: string | null
          order_number?: string
          order_type?: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          tip_amount?: number
          total_amount?: number
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          special_instructions?: string | null
          estimated_ready_time?: string | null
          ready_at?: string | null
          served_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}