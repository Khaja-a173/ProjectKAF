-- ProjectKAF Test Fixtures - Minimal Seed Data for RLS Verification
-- This file provides minimal test data for verifying Row Level Security policies
-- Use INSERT ... ON CONFLICT DO NOTHING to avoid conflicts with existing data

-- =========================================
-- TENANTS (2 test tenants)
-- =========================================

INSERT INTO tenants (id, name, slug, code, subscription_plan, email, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'Demo Restaurant', 'demo-restaurant', 'DEMO', 'basic', 'admin@demo.com', '+1-555-0001'),
('22222222-2222-2222-2222-222222222222', 'Bella Vista', 'bella-vista', 'BELL', 'pro', 'admin@bellavista.com', '+1-555-0002')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- STAFF (Bridge table for auth users)
-- =========================================

-- Create staff table if it doesn't exist (from blueprint)
CREATE TABLE IF NOT EXISTS staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL, -- supabase auth uid
    role text NOT NULL CHECK (role IN ('admin','manager','waiter','kitchen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, user_id)
);

-- Enable RLS if not already enabled
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Insert test staff records
INSERT INTO staff (id, tenant_id, user_id, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin')
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- =========================================
-- USERS (Map to existing users table)
-- =========================================

INSERT INTO users (id, tenant_id, email, first_name, last_name, role, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin@demo.com', 'Demo', 'Admin', 'tenant_admin', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'admin@bellavista.com', 'Bella', 'Admin', 'tenant_admin', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- LOCATIONS (One per tenant)
-- =========================================

-- Create locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    timezone text NOT NULL DEFAULT 'Australia/Brisbane',
    currency text NOT NULL DEFAULT 'AUD',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

INSERT INTO locations (id, tenant_id, name, timezone, currency) VALUES
('loc11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Demo Main Location', 'America/New_York', 'USD'),
('loc22222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Bella Vista Main', 'Australia/Brisbane', 'AUD')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- RESTAURANT TABLES (Use existing table)
-- =========================================

INSERT INTO restaurant_tables (id, tenant_id, table_number, capacity, status, qr_code) VALUES
('tbl11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'T01', 4, 'available', 'QR_DEMO_T01'),
('tbl11112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'T02', 2, 'available', 'QR_DEMO_T02'),
('tbl22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'T01', 6, 'available', 'QR_BELL_T01'),
('tbl22222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'T02', 4, 'available', 'QR_BELL_T02')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- CATEGORIES (One per tenant)
-- =========================================

INSERT INTO categories (id, tenant_id, name, description, sort_order, is_active) VALUES
('cat11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Demo Appetizers', 'Demo restaurant appetizers', 100, true),
('cat11112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Demo Mains', 'Demo restaurant main courses', 200, true),
('cat22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Bella Starters', 'Bella Vista appetizers', 100, true),
('cat22222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Bella Entrees', 'Bella Vista main courses', 200, true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- MENU ITEMS (One per category)
-- =========================================

INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, cost, is_available, preparation_time) VALUES
-- Demo Restaurant Items
('itm11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'cat11111-1111-1111-1111-111111111111', 'Demo Bruschetta', 'Tomato and basil on toasted bread', 12.00, 4.50, true, 10),
('itm11112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'cat11112-1111-1111-1111-111111111111', 'Demo Pasta', 'Fresh pasta with marinara sauce', 18.00, 6.00, true, 15),

-- Bella Vista Items  
('itm22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'cat22221-2222-2222-2222-222222222222', 'Truffle Arancini', 'Crispy risotto balls with black truffle', 16.00, 6.50, true, 12),
('itm22222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'cat22222-2222-2222-2222-222222222222', 'Wagyu Beef Tenderloin', 'Premium wagyu with seasonal vegetables', 65.00, 28.00, true, 25)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- CUSTOMERS (Test customers)
-- =========================================

INSERT INTO customers (id, tenant_id, email, first_name, last_name, phone, loyalty_points) VALUES
('cust1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'customer1@demo.com', 'Demo', 'Customer', '+1-555-1001', 100),
('cust2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'customer1@bellavista.com', 'Bella', 'Customer', '+1-555-2001', 250)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDERS (Test orders for RLS verification)
-- =========================================

INSERT INTO orders (id, tenant_id, customer_id, table_id, order_number, status, subtotal, tax_amount, total_amount, mode, session_id) VALUES
-- Demo Restaurant Orders
('ord11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'cust1111-1111-1111-1111-111111111111', 'tbl11111-1111-1111-1111-111111111111', 'DEMO-001', 'preparing', 30.00, 2.40, 32.40, 'dine_in', 'sess_demo_1'),
('ord11112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, NULL, 'DEMO-002', 'ready', 18.00, 1.44, 19.44, 'takeaway', 'sess_demo_2'),

-- Bella Vista Orders
('ord22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'cust2222-2222-2222-2222-222222222222', 'tbl22221-2222-2222-2222-222222222222', 'BELL-001', 'confirmed', 81.00, 6.48, 87.48, 'dine_in', 'sess_bell_1'),
('ord22222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NULL, NULL, 'BELL-002', 'pending', 16.00, 1.28, 17.28, 'takeaway', 'sess_bell_2')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDER ITEMS (Items within test orders)
-- =========================================

INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, status) VALUES
-- Demo Restaurant Order Items
('oit11111-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 'itm11111-1111-1111-1111-111111111111', 2, 12.00, 24.00, 'preparing'),
('oit11112-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 'itm11112-1111-1111-1111-111111111111', 1, 6.00, 6.00, 'preparing'),
('oit11113-1111-1111-1111-111111111111', 'ord11112-1111-1111-1111-111111111111', 'itm11112-1111-1111-1111-111111111111', 1, 18.00, 18.00, 'ready'),

-- Bella Vista Order Items
('oit22221-2222-2222-2222-222222222222', 'ord22221-2222-2222-2222-222222222222', 'itm22221-2222-2222-2222-222222222222', 1, 16.00, 16.00, 'confirmed'),
('oit22222-2222-2222-2222-222222222222', 'ord22221-2222-2222-2222-222222222222', 'itm22222-2222-2222-2222-222222222222', 1, 65.00, 65.00, 'confirmed'),
('oit22223-2222-2222-2222-222222222222', 'ord22222-2222-2222-2222-222222222222', 'itm22221-2222-2222-2222-222222222222', 1, 16.00, 16.00, 'pending')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- TABLE SESSIONS (Active sessions for testing)
-- =========================================

INSERT INTO table_sessions (id, tenant_id, table_id, pin_hash, status, expires_at, cart_version) VALUES
('sess1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'tbl11111-1111-1111-1111-111111111111', '$2b$10$example.hash.for.pin.1234', 'active', NOW() + INTERVAL '1 hour', 1),
('sess2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'tbl22221-2222-2222-2222-222222222222', '$2b$10$example.hash.for.pin.5678', 'active', NOW() + INTERVAL '1 hour', 1)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PAYMENTS (Test payment records)
-- =========================================

INSERT INTO payments (id, tenant_id, order_id, amount, payment_method, status, processed_at) VALUES
('pay11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 32.40, 'card', 'pending', NULL),
('pay22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'ord22221-2222-2222-2222-222222222222', 87.48, 'card', 'pending', NULL)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- DAILY SALES SUMMARY (Analytics test data)
-- =========================================

INSERT INTO daily_sales_summary (id, tenant_id, date, total_orders, total_revenue, total_customers, average_order_value) VALUES
('dss11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, 15, 450.00, 12, 37.50),
('dss22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', CURRENT_DATE, 8, 680.00, 6, 113.33)
ON CONFLICT (tenant_id, date) DO NOTHING;

-- =========================================
-- INVENTORY ITEMS (Basic inventory)
-- =========================================

INSERT INTO inventory_items (id, tenant_id, name, unit, current_stock, minimum_stock, cost_per_unit) VALUES
('inv11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Tomatoes', 'kg', 25.5, 5.0, 3.50),
('inv11112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Pasta', 'kg', 15.0, 3.0, 2.80),
('inv22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Truffle Oil', 'ml', 500.0, 100.0, 0.25),
('inv22222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Wagyu Beef', 'kg', 2.5, 0.5, 85.00)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- NOTIFICATIONS (Test notifications)
-- =========================================

INSERT INTO notifications (id, tenant_id, user_id, type, title, message, is_read) VALUES
('not11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'order', 'New Order Received', 'Order DEMO-001 has been placed', false),
('not22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'system', 'Welcome to Bella Vista', 'Your account has been activated', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- STAFF SCHEDULES (Test schedules)
-- =========================================

INSERT INTO staff_schedules (id, tenant_id, staff_id, shift_date, start_time, end_time, hourly_rate) VALUES
('sch11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE, '09:00:00', '17:00:00', 25.00),
('sch22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE, '10:00:00', '18:00:00', 30.00)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- AUDIT LOGS (Test audit entries)
-- =========================================

INSERT INTO audit_logs (id, tenant_id, user_id, action, resource_type, resource_id, new_values) VALUES
('aud11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CREATE', 'order', 'ord11111-1111-1111-1111-111111111111', '{"status": "pending", "total": 32.40}'),
('aud22221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CREATE', 'menu_item', 'itm22221-2222-2222-2222-222222222222', '{"name": "Truffle Arancini", "price": 16.00}')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- RLS VERIFICATION QUERIES
-- =========================================

-- These queries should be run with different authenticated users to verify RLS

-- 1. Verify tenant isolation (run as user aaaaaaaa...)
-- Should only return Demo Restaurant data
/*
SET request.jwt.claims.tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT tenant_id, name FROM tenants; -- Should only show Demo Restaurant
SELECT tenant_id, name FROM menu_items; -- Should only show Demo items
SELECT tenant_id, order_number FROM orders; -- Should only show Demo orders
*/

-- 2. Verify tenant isolation (run as user bbbbbbbb...)  
-- Should only return Bella Vista data
/*
SET request.jwt.claims.tenant_id = '22222222-2222-2222-2222-222222222222';
SELECT tenant_id, name FROM tenants; -- Should only show Bella Vista
SELECT tenant_id, name FROM menu_items; -- Should only show Bella items
SELECT tenant_id, order_number FROM orders; -- Should only show Bella orders
*/

-- 3. Cross-tenant access test (should fail or return empty)
/*
SET request.jwt.claims.tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT * FROM orders WHERE tenant_id = '22222222-2222-2222-2222-222222222222'; -- Should return empty
*/

-- 4. Anonymous access test (should only show available menu items)
/*
SET ROLE anon;
SELECT tenant_id, name, is_available FROM menu_items; -- Should only show available items
RESET ROLE;
*/

-- =========================================
-- CLEANUP QUERIES (for test reset)
-- =========================================

-- Use these to clean up test data if needed
/*
DELETE FROM audit_logs WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM staff_schedules WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM notifications WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM payments WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM table_sessions WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'));
DELETE FROM orders WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM menu_items WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM categories WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM customers WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM restaurant_tables WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM locations WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM users WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM staff WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM tenants WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
*/

-- =========================================
-- VERIFICATION SUMMARY
-- =========================================

-- Run this to verify all test data was inserted correctly
SELECT 
    'tenants' as table_name, 
    COUNT(*) as record_count,
    STRING_AGG(DISTINCT name, ', ') as sample_names
FROM tenants 
WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')

UNION ALL

SELECT 
    'users' as table_name, 
    COUNT(*) as record_count,
    STRING_AGG(DISTINCT first_name || ' ' || last_name, ', ') as sample_names
FROM users 
WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')

UNION ALL

SELECT 
    'menu_items' as table_name, 
    COUNT(*) as record_count,
    STRING_AGG(DISTINCT name, ', ') as sample_names
FROM menu_items 
WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')

UNION ALL

SELECT 
    'orders' as table_name, 
    COUNT(*) as record_count,
    STRING_AGG(DISTINCT order_number, ', ') as sample_names
FROM orders 
WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')

ORDER BY table_name;