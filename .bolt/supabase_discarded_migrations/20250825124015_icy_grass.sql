-- ProjectKAF Database DDL Export
-- Complete schema definition for public schema

-- =========================================
-- EXTENSIONS
-- =========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================
-- CUSTOM TYPES (ENUMS)
-- =========================================

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'manager',
    'staff',
    'super_admin',
    'tenant_admin'
);

CREATE TYPE public.order_status AS ENUM (
    'cancelled',
    'confirmed',
    'paid',
    'pending',
    'placed',
    'preparing',
    'processing',
    'ready',
    'served'
);

CREATE TYPE public.payment_status AS ENUM (
    'completed',
    'failed',
    'pending',
    'processing',
    'refunded'
);

CREATE TYPE public.table_status AS ENUM (
    'available',
    'maintenance',
    'occupied',
    'reserved'
);

CREATE TYPE public.notification_type AS ENUM (
    'order',
    'payment',
    'promotion',
    'system'
);

-- =========================================
-- FUNCTIONS
-- =========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.orders_fill_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Auto-generate order number if not provided
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || EXTRACT(EPOCH FROM NOW())::bigint;
    END IF;
    
    -- Set default timestamps
    IF NEW.created_at IS NULL THEN
        NEW.created_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

-- =========================================
-- TABLES
-- =========================================

-- 1. TENANTS TABLE
CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    website text,
    phone text,
    email text,
    address jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    subscription_plan text DEFAULT 'basic'::text,
    subscription_status text DEFAULT 'active'::text,
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. USERS TABLE
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    email text NOT NULL,
    password_hash text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    avatar_url text,
    role public.user_role DEFAULT 'staff'::public.user_role,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    email_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. CATEGORIES TABLE
CREATE TABLE public.categories (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    name text NOT NULL,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. MENU ITEMS TABLE
CREATE TABLE public.menu_items (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    category_id uuid,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    image_url text,
    images jsonb DEFAULT '[]'::jsonb,
    ingredients jsonb DEFAULT '[]'::jsonb,
    allergens jsonb DEFAULT '[]'::jsonb,
    nutritional_info jsonb DEFAULT '{}'::jsonb,
    dietary_info jsonb DEFAULT '{}'::jsonb,
    preparation_time integer,
    calories integer,
    is_available boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    variants jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. RESTAURANT TABLES TABLE
CREATE TABLE public.restaurant_tables (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    table_number text NOT NULL,
    capacity integer NOT NULL,
    location text,
    status public.table_status DEFAULT 'available'::public.table_status,
    qr_code text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 6. CUSTOMERS TABLE
CREATE TABLE public.customers (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    email text,
    phone text,
    first_name text,
    last_name text,
    date_of_birth date,
    preferences jsonb DEFAULT '{}'::jsonb,
    loyalty_points integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0,
    visit_count integer DEFAULT 0,
    last_visit_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 7. ORDERS TABLE
CREATE TABLE public.orders (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    customer_id uuid,
    table_id uuid,
    staff_id uuid,
    order_number text NOT NULL,
    order_type text DEFAULT 'dine_in'::text,
    status public.order_status DEFAULT 'pending'::public.order_status,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    tip_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    special_instructions text,
    estimated_ready_time timestamp with time zone,
    ready_at timestamp with time zone,
    served_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    idempotency_key text,
    mode text DEFAULT 'takeaway'::text NOT NULL,
    total_cents integer DEFAULT 0 NOT NULL,
    session_id text DEFAULT ''::text NOT NULL
);

-- 8. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    order_id uuid,
    menu_item_id uuid,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    customizations jsonb DEFAULT '{}'::jsonb,
    special_instructions text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 9. PAYMENTS TABLE
CREATE TABLE public.payments (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    order_id uuid,
    amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_provider text,
    provider_transaction_id text,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    processed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 10. TABLE SESSIONS TABLE
CREATE TABLE public.table_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    table_id uuid NOT NULL,
    pin_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_by text,
    cart_version integer DEFAULT 0 NOT NULL
);

-- 11. DAILY SALES SUMMARY TABLE
CREATE TABLE public.daily_sales_summary (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    date date NOT NULL,
    total_orders integer DEFAULT 0,
    total_revenue numeric(10,2) DEFAULT 0,
    total_customers integer DEFAULT 0,
    average_order_value numeric(10,2) DEFAULT 0,
    top_selling_items jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 12. INVENTORY ITEMS TABLE
CREATE TABLE public.inventory_items (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    name text NOT NULL,
    description text,
    unit text NOT NULL,
    current_stock numeric(10,3) DEFAULT 0 NOT NULL,
    minimum_stock numeric(10,3) DEFAULT 0 NOT NULL,
    maximum_stock numeric(10,3),
    cost_per_unit numeric(10,2),
    supplier_info jsonb DEFAULT '{}'::jsonb,
    last_restocked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    type public.notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 14. STAFF SCHEDULES TABLE
CREATE TABLE public.staff_schedules (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    staff_id uuid,
    shift_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    break_duration integer DEFAULT 0,
    hourly_rate numeric(8,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- =========================================
-- PRIMARY KEY CONSTRAINTS
-- =========================================

ALTER TABLE ONLY public.tenants ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.menu_items ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.restaurant_tables ADD CONSTRAINT restaurant_tables_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.customers ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.table_sessions ADD CONSTRAINT table_sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.daily_sales_summary ADD CONSTRAINT daily_sales_summary_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.inventory_items ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.staff_schedules ADD CONSTRAINT staff_schedules_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);

-- =========================================
-- UNIQUE CONSTRAINTS
-- =========================================

ALTER TABLE ONLY public.tenants ADD CONSTRAINT tenants_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_tenant_id_email_key UNIQUE (tenant_id, email);
ALTER TABLE ONLY public.restaurant_tables ADD CONSTRAINT restaurant_tables_tenant_id_table_number_key UNIQUE (tenant_id, table_number);
ALTER TABLE ONLY public.customers ADD CONSTRAINT customers_tenant_id_email_key UNIQUE (tenant_id, email);
ALTER TABLE ONLY public.customers ADD CONSTRAINT customers_tenant_id_phone_key UNIQUE (tenant_id, phone);
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_tenant_id_order_number_key UNIQUE (tenant_id, order_number);
ALTER TABLE ONLY public.orders ADD CONSTRAINT ux_orders_tenant_idem UNIQUE (tenant_id, idempotency_key);
ALTER TABLE ONLY public.daily_sales_summary ADD CONSTRAINT daily_sales_summary_tenant_id_date_key UNIQUE (tenant_id, date);

-- =========================================
-- FOREIGN KEY CONSTRAINTS
-- =========================================

-- Users foreign keys
ALTER TABLE ONLY public.users ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Categories foreign keys
ALTER TABLE ONLY public.categories ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Menu items foreign keys
ALTER TABLE ONLY public.menu_items ADD CONSTRAINT menu_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.menu_items ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Restaurant tables foreign keys
ALTER TABLE ONLY public.restaurant_tables ADD CONSTRAINT restaurant_tables_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Customers foreign keys
ALTER TABLE ONLY public.customers ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Orders foreign keys
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.restaurant_tables(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Order items foreign keys
ALTER TABLE ONLY public.order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.order_items ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE RESTRICT;

-- Payments foreign keys
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Daily sales summary foreign keys
ALTER TABLE ONLY public.daily_sales_summary ADD CONSTRAINT daily_sales_summary_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Inventory items foreign keys
ALTER TABLE ONLY public.inventory_items ADD CONSTRAINT inventory_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Notifications foreign keys
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Staff schedules foreign keys
ALTER TABLE ONLY public.staff_schedules ADD CONSTRAINT staff_schedules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.staff_schedules ADD CONSTRAINT staff_schedules_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Audit logs foreign keys
ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- =========================================
-- INDEXES
-- =========================================

-- Primary key indexes (automatically created)
CREATE UNIQUE INDEX tenants_pkey ON public.tenants USING btree (id);
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);
CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);
CREATE UNIQUE INDEX menu_items_pkey ON public.menu_items USING btree (id);
CREATE UNIQUE INDEX restaurant_tables_pkey ON public.restaurant_tables USING btree (id);
CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);
CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);
CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);
CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);
CREATE UNIQUE INDEX table_sessions_pkey ON public.table_sessions USING btree (id);
CREATE UNIQUE INDEX daily_sales_summary_pkey ON public.daily_sales_summary USING btree (id);
CREATE UNIQUE INDEX inventory_items_pkey ON public.inventory_items USING btree (id);
CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);
CREATE UNIQUE INDEX staff_schedules_pkey ON public.staff_schedules USING btree (id);
CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

-- Unique constraint indexes
CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug);
CREATE UNIQUE INDEX users_tenant_id_email_key ON public.users USING btree (tenant_id, email);
CREATE UNIQUE INDEX restaurant_tables_tenant_id_table_number_key ON public.restaurant_tables USING btree (tenant_id, table_number);
CREATE UNIQUE INDEX customers_tenant_id_email_key ON public.customers USING btree (tenant_id, email);
CREATE UNIQUE INDEX customers_tenant_id_phone_key ON public.customers USING btree (tenant_id, phone);
CREATE UNIQUE INDEX orders_tenant_id_order_number_key ON public.orders USING btree (tenant_id, order_number);
CREATE UNIQUE INDEX daily_sales_summary_tenant_id_date_key ON public.daily_sales_summary USING btree (tenant_id, date);

-- Performance indexes
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_tenant_id ON public.users USING btree (tenant_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items USING btree (category_id);
CREATE INDEX idx_menu_items_tenant_id ON public.menu_items USING btree (tenant_id);
CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_tenant_created ON public.orders USING btree (tenant_id, created_at DESC);
CREATE INDEX idx_orders_tenant_id ON public.orders USING btree (tenant_id);
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs USING btree (tenant_id);

-- Special constraint indexes
CREATE UNIQUE INDEX ux_restaurant_tables_qr_code ON public.restaurant_tables USING btree (qr_code) WHERE (qr_code IS NOT NULL);
CREATE UNIQUE INDEX uniq_active_table_session ON public.table_sessions USING btree (tenant_id, table_id) WHERE (status = 'active'::text);
CREATE UNIQUE INDEX ux_orders_active_per_table ON public.orders USING btree (tenant_id, table_id) WHERE ((table_id IS NOT NULL) AND (status = ANY (ARRAY['pending'::public.order_status, 'processing'::public.order_status])));
CREATE UNIQUE INDEX ux_orders_tenant_idem ON public.orders USING btree (tenant_id, idempotency_key);

-- =========================================
-- TRIGGERS
-- =========================================

-- Update timestamp triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER trg_orders_fill_defaults BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.orders_fill_defaults();

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =========================================
-- VIEWS
-- =========================================

-- Current staff view for RLS policies
CREATE OR REPLACE VIEW public.v_current_staff AS
SELECT s.*, t.code as tenant_code
FROM public.staff s
JOIN public.tenants t ON t.id = s.tenant_id
WHERE s.user_id = auth.uid();

-- =========================================
-- GRANTS (Default Supabase permissions)
-- =========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- =========================================
-- COMMENTS
-- =========================================

COMMENT ON TABLE public.tenants IS 'Multi-tenant restaurant organizations';
COMMENT ON TABLE public.users IS 'Staff and user management with role-based access';
COMMENT ON TABLE public.categories IS 'Menu categorization system';
COMMENT ON TABLE public.menu_items IS 'Restaurant menu items with detailed information';
COMMENT ON TABLE public.restaurant_tables IS 'Physical table management and QR integration';
COMMENT ON TABLE public.customers IS 'Customer profiles and loyalty tracking';
COMMENT ON TABLE public.orders IS 'Order management with comprehensive tracking';
COMMENT ON TABLE public.order_items IS 'Individual items within orders';
COMMENT ON TABLE public.payments IS 'Payment processing and transaction records';
COMMENT ON TABLE public.table_sessions IS 'Table session management for QR ordering';
COMMENT ON TABLE public.daily_sales_summary IS 'Daily analytics and business intelligence';
COMMENT ON TABLE public.inventory_items IS 'Inventory management and tracking';
COMMENT ON TABLE public.notifications IS 'User notification and alert system';
COMMENT ON TABLE public.staff_schedules IS 'Staff scheduling and shift management';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for compliance';

-- =========================================
-- VALIDATION
-- =========================================

-- Verify schema creation
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify RLS enabled
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relnamespace = 'public'::regnamespace 
AND relkind = 'r'
ORDER BY relname;

-- Verify foreign keys
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;