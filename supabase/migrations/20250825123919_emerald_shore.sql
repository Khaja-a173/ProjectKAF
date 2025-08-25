-- ProjectKAF Database Policies - Raw SQL Export
-- Complete RLS policy definitions for recreation

-- =========================================
-- DROP EXISTING POLICIES (Safe cleanup)
-- =========================================

-- Tenants policies
DROP POLICY IF EXISTS "Users can access their tenant data" ON public.tenants;

-- Users policies  
DROP POLICY IF EXISTS "Users can access their tenant users" ON public.users;
DROP POLICY IF EXISTS "users_tenant_delete" ON public.users;
DROP POLICY IF EXISTS "users_tenant_insert" ON public.users;
DROP POLICY IF EXISTS "users_tenant_select" ON public.users;
DROP POLICY IF EXISTS "users_tenant_update" ON public.users;

-- Categories policies
DROP POLICY IF EXISTS "Users can access their tenant categories" ON public.categories;
DROP POLICY IF EXISTS "auth_read_categories_active_tenant" ON public.categories;
DROP POLICY IF EXISTS "categories_tenant_delete" ON public.categories;
DROP POLICY IF EXISTS "categories_tenant_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_tenant_select" ON public.categories;
DROP POLICY IF EXISTS "categories_tenant_update" ON public.categories;

-- Menu items policies
DROP POLICY IF EXISTS "Users can access their tenant menu items" ON public.menu_items;
DROP POLICY IF EXISTS "auth_read_menu_items_active_tenant" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_tenant_delete" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_tenant_insert" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_tenant_select" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_tenant_update" ON public.menu_items;
DROP POLICY IF EXISTS "public_read_menu_items_available" ON public.menu_items;

-- Restaurant tables policies
DROP POLICY IF EXISTS "Users can access their tenant tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "auth_read_restaurant_tables_for_qr_tenant" ON public.restaurant_tables;
DROP POLICY IF EXISTS "restaurant_tables_tenant_delete" ON public.restaurant_tables;
DROP POLICY IF EXISTS "restaurant_tables_tenant_insert" ON public.restaurant_tables;
DROP POLICY IF EXISTS "restaurant_tables_tenant_select" ON public.restaurant_tables;
DROP POLICY IF EXISTS "restaurant_tables_tenant_update" ON public.restaurant_tables;

-- Orders policies
DROP POLICY IF EXISTS "Users can access their tenant orders" ON public.orders;
DROP POLICY IF EXISTS "auth_insert_orders_tenant" ON public.orders;
DROP POLICY IF EXISTS "auth_read_orders_tenant" ON public.orders;
DROP POLICY IF EXISTS "orders_same_tenant_rw" ON public.orders;
DROP POLICY IF EXISTS "orders_tenant_delete" ON public.orders;
DROP POLICY IF EXISTS "orders_tenant_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_tenant_select" ON public.orders;
DROP POLICY IF EXISTS "orders_tenant_update" ON public.orders;

-- Order items policies
DROP POLICY IF EXISTS "Users can access order items through orders" ON public.order_items;
DROP POLICY IF EXISTS "auth_insert_order_items_tenant" ON public.order_items;
DROP POLICY IF EXISTS "auth_read_order_items_tenant" ON public.order_items;

-- Customers policies
DROP POLICY IF EXISTS "Users can access their tenant customers" ON public.customers;
DROP POLICY IF EXISTS "customers_tenant_delete" ON public.customers;
DROP POLICY IF EXISTS "customers_tenant_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_tenant_select" ON public.customers;
DROP POLICY IF EXISTS "customers_tenant_update" ON public.customers;

-- Payments policies
DROP POLICY IF EXISTS "Users can access their tenant payments" ON public.payments;
DROP POLICY IF EXISTS "payments_tenant_delete" ON public.payments;
DROP POLICY IF EXISTS "payments_tenant_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_tenant_select" ON public.payments;
DROP POLICY IF EXISTS "payments_tenant_update" ON public.payments;

-- Table sessions policies
DROP POLICY IF EXISTS "table_sessions_tenant_delete" ON public.table_sessions;
DROP POLICY IF EXISTS "table_sessions_tenant_insert" ON public.table_sessions;
DROP POLICY IF EXISTS "table_sessions_tenant_select" ON public.table_sessions;
DROP POLICY IF EXISTS "table_sessions_tenant_update" ON public.table_sessions;

-- Daily sales summary policies
DROP POLICY IF EXISTS "Users can access their tenant analytics" ON public.daily_sales_summary;
DROP POLICY IF EXISTS "daily_sales_summary_tenant_delete" ON public.daily_sales_summary;
DROP POLICY IF EXISTS "daily_sales_summary_tenant_insert" ON public.daily_sales_summary;
DROP POLICY IF EXISTS "daily_sales_summary_tenant_select" ON public.daily_sales_summary;
DROP POLICY IF EXISTS "daily_sales_summary_tenant_update" ON public.daily_sales_summary;

-- Inventory items policies
DROP POLICY IF EXISTS "Users can access their tenant inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_items_tenant_delete" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_items_tenant_insert" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_items_tenant_select" ON public.inventory_items;
DROP POLICY IF EXISTS "inventory_items_tenant_update" ON public.inventory_items;

-- Notifications policies
DROP POLICY IF EXISTS "Users can access their notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_tenant_delete" ON public.notifications;
DROP POLICY IF EXISTS "notifications_tenant_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_tenant_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_tenant_update" ON public.notifications;

-- Staff schedules policies
DROP POLICY IF EXISTS "Users can access their tenant schedules" ON public.staff_schedules;
DROP POLICY IF EXISTS "staff_schedules_tenant_delete" ON public.staff_schedules;
DROP POLICY IF EXISTS "staff_schedules_tenant_insert" ON public.staff_schedules;
DROP POLICY IF EXISTS "staff_schedules_tenant_select" ON public.staff_schedules;
DROP POLICY IF EXISTS "staff_schedules_tenant_update" ON public.staff_schedules;

-- Audit logs policies
DROP POLICY IF EXISTS "Users can access their tenant audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_tenant_delete" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_tenant_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_tenant_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_tenant_update" ON public.audit_logs;

-- =========================================
-- CREATE POLICIES (Dependency-safe order)
-- =========================================

-- 1. TENANTS TABLE POLICIES
CREATE POLICY "Users can access their tenant data" ON public.tenants
FOR ALL TO public
USING (id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

-- 2. USERS TABLE POLICIES
CREATE POLICY "Users can access their tenant users" ON public.users
FOR ALL TO public
USING (tenant_id = (
    SELECT users_1.tenant_id 
    FROM users users_1 
    WHERE users_1.id = uid()
));

CREATE POLICY "users_tenant_select" ON public.users
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "users_tenant_insert" ON public.users
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "users_tenant_update" ON public.users
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "users_tenant_delete" ON public.users
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 3. CATEGORIES TABLE POLICIES
CREATE POLICY "Users can access their tenant categories" ON public.categories
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "auth_read_categories_active_tenant" ON public.categories
FOR SELECT TO authenticated
USING ((is_active = true) AND (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid));

CREATE POLICY "categories_tenant_select" ON public.categories
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "categories_tenant_insert" ON public.categories
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "categories_tenant_update" ON public.categories
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "categories_tenant_delete" ON public.categories
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 4. MENU ITEMS TABLE POLICIES
CREATE POLICY "Users can access their tenant menu items" ON public.menu_items
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "auth_read_menu_items_active_tenant" ON public.menu_items
FOR SELECT TO authenticated
USING ((is_available = true) AND (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid) AND ((category_id IS NULL) OR (EXISTS (
    SELECT 1 
    FROM categories c 
    WHERE ((c.id = menu_items.category_id) AND (c.is_active = true) AND (c.tenant_id = menu_items.tenant_id))
))));

CREATE POLICY "public_read_menu_items_available" ON public.menu_items
FOR SELECT TO anon
USING (is_available = true);

CREATE POLICY "menu_items_tenant_select" ON public.menu_items
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "menu_items_tenant_insert" ON public.menu_items
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "menu_items_tenant_update" ON public.menu_items
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "menu_items_tenant_delete" ON public.menu_items
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 5. RESTAURANT TABLES POLICIES
CREATE POLICY "Users can access their tenant tables" ON public.restaurant_tables
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "auth_read_restaurant_tables_for_qr_tenant" ON public.restaurant_tables
FOR SELECT TO authenticated
USING ((qr_code IS NOT NULL) AND (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid));

CREATE POLICY "restaurant_tables_tenant_select" ON public.restaurant_tables
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "restaurant_tables_tenant_insert" ON public.restaurant_tables
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "restaurant_tables_tenant_update" ON public.restaurant_tables
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "restaurant_tables_tenant_delete" ON public.restaurant_tables
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 6. ORDERS TABLE POLICIES
CREATE POLICY "Users can access their tenant orders" ON public.orders
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "auth_read_orders_tenant" ON public.orders
FOR SELECT TO authenticated
USING (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid);

CREATE POLICY "auth_insert_orders_tenant" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid);

CREATE POLICY "orders_same_tenant_rw" ON public.orders
FOR ALL TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "orders_tenant_select" ON public.orders
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "orders_tenant_insert" ON public.orders
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "orders_tenant_update" ON public.orders
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "orders_tenant_delete" ON public.orders
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 7. ORDER ITEMS TABLE POLICIES
CREATE POLICY "Users can access order items through orders" ON public.order_items
FOR ALL TO public
USING (order_id IN (
    SELECT orders.id 
    FROM orders 
    WHERE orders.tenant_id = (
        SELECT users.tenant_id 
        FROM users 
        WHERE users.id = uid()
    )
));

CREATE POLICY "auth_read_order_items_tenant" ON public.order_items
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE ((o.id = order_items.order_id) AND (o.tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid))
));

CREATE POLICY "auth_insert_order_items_tenant" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE ((o.id = order_items.order_id) AND (o.tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid))
));

-- 8. CUSTOMERS TABLE POLICIES
CREATE POLICY "Users can access their tenant customers" ON public.customers
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "customers_tenant_select" ON public.customers
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "customers_tenant_insert" ON public.customers
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "customers_tenant_update" ON public.customers
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "customers_tenant_delete" ON public.customers
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 9. PAYMENTS TABLE POLICIES
CREATE POLICY "Users can access their tenant payments" ON public.payments
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "payments_tenant_select" ON public.payments
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "payments_tenant_insert" ON public.payments
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "payments_tenant_update" ON public.payments
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "payments_tenant_delete" ON public.payments
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 10. TABLE SESSIONS POLICIES
CREATE POLICY "table_sessions_tenant_select" ON public.table_sessions
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_insert" ON public.table_sessions
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_update" ON public.table_sessions
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_delete" ON public.table_sessions
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 11. DAILY SALES SUMMARY POLICIES
CREATE POLICY "Users can access their tenant analytics" ON public.daily_sales_summary
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "daily_sales_summary_tenant_select" ON public.daily_sales_summary
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "daily_sales_summary_tenant_insert" ON public.daily_sales_summary
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "daily_sales_summary_tenant_update" ON public.daily_sales_summary
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "daily_sales_summary_tenant_delete" ON public.daily_sales_summary
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 12. INVENTORY ITEMS POLICIES
CREATE POLICY "Users can access their tenant inventory" ON public.inventory_items
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "inventory_items_tenant_select" ON public.inventory_items
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "inventory_items_tenant_insert" ON public.inventory_items
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "inventory_items_tenant_update" ON public.inventory_items
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "inventory_items_tenant_delete" ON public.inventory_items
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 13. NOTIFICATIONS POLICIES
CREATE POLICY "Users can access their notifications" ON public.notifications
FOR ALL TO public
USING (user_id = uid());

CREATE POLICY "notifications_tenant_select" ON public.notifications
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "notifications_tenant_insert" ON public.notifications
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "notifications_tenant_update" ON public.notifications
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "notifications_tenant_delete" ON public.notifications
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 14. STAFF SCHEDULES POLICIES
CREATE POLICY "Users can access their tenant schedules" ON public.staff_schedules
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "staff_schedules_tenant_select" ON public.staff_schedules
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "staff_schedules_tenant_insert" ON public.staff_schedules
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "staff_schedules_tenant_update" ON public.staff_schedules
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "staff_schedules_tenant_delete" ON public.staff_schedules
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- 15. AUDIT LOGS POLICIES
CREATE POLICY "Users can access their tenant audit logs" ON public.audit_logs
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "audit_logs_tenant_select" ON public.audit_logs
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "audit_logs_tenant_insert" ON public.audit_logs
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "audit_logs_tenant_update" ON public.audit_logs
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "audit_logs_tenant_delete" ON public.audit_logs
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());

-- =========================================
-- POLICY VERIFICATION QUERIES
-- =========================================

-- Verify all policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Verify RLS is enabled on all tables
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relnamespace = 'public'::regnamespace 
AND relkind = 'r' 
AND relname IN (
    'tenants', 'users', 'categories', 'menu_items', 
    'restaurant_tables', 'orders', 'order_items', 
    'customers', 'payments', 'table_sessions',
    'daily_sales_summary', 'inventory_items', 
    'notifications', 'staff_schedules', 'audit_logs'
)
ORDER BY relname;

-- Test tenant isolation (should return 0 for cross-tenant queries)
-- Run as different authenticated users to verify isolation